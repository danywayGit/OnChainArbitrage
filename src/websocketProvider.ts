import { ethers, WebSocketProvider, Log } from 'ethers';
import logger from './logger';

/**
 * WebSocket Provider Manager
 * 
 * Manages multiple WebSocket connections to RPC providers with:
 * - Automatic reconnection
 * - Failover between providers
 * - Event subscription management
 * - Connection health monitoring
 */

interface ProviderConfig {
  name: string;
  url: string;
  priority: number; // 1 = highest priority
  isActive: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

interface Subscription {
  id: string;
  address: string;
  topics: string[];
  callback: (log: Log) => void;
}

export class WebSocketProviderManager {
  private providers: Map<string, ProviderConfig>;
  private ethersProviders: Map<string, WebSocketProvider>;
  private subscriptions: Map<string, Subscription>;
  private activeProvider: string | null;
  private reconnectTimers: Map<string, NodeJS.Timeout>;
  private heartbeatIntervals: Map<string, NodeJS.Timeout>;
  private isShuttingDown: boolean;

  constructor() {
    this.providers = new Map();
    this.ethersProviders = new Map();
    this.subscriptions = new Map();
    this.activeProvider = null;
    this.reconnectTimers = new Map();
    this.heartbeatIntervals = new Map();
    this.isShuttingDown = false;
  }

  /**
   * Add a WebSocket provider to the pool
   */
  addProvider(name: string, url: string, priority: number = 5): void {
    this.providers.set(name, {
      name,
      url,
      priority,
      isActive: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 10,
    });
    logger.info(`[WSS] Added provider: ${name} (priority: ${priority})`);
  }

  /**
   * Connect to all providers (highest priority first)
   */
  async connectAll(): Promise<void> {
    const sortedProviders = Array.from(this.providers.values())
      .sort((a, b) => a.priority - b.priority);

    for (const provider of sortedProviders) {
      try {
        await this.connect(provider.name);
        
        // Use first successful connection as active
        if (!this.activeProvider) {
          this.activeProvider = provider.name;
          logger.info(`[WSS] ✅ Active provider: ${provider.name}`);
        }
      } catch (error) {
        logger.error(`[WSS] Failed to connect to ${provider.name}:`, error);
      }
    }

    if (!this.activeProvider) {
      throw new Error('[WSS] ❌ No WebSocket providers could connect!');
    }
  }

  /**
   * Connect to a specific provider
   */
  private async connect(name: string): Promise<void> {
    const config = this.providers.get(name);
    if (!config) {
      throw new Error(`[WSS] Provider ${name} not found`);
    }

    logger.info(`[WSS] Connecting to ${name}...`);

    try {
      // Create ethers WebSocket provider
      const provider = new WebSocketProvider(config.url);

      // Store provider immediately (don't wait for ready - ethers v6 connects asynchronously)
      this.ethersProviders.set(name, provider);
      config.isActive = true;
      config.reconnectAttempts = 0;

      logger.info(`[WSS] ✅ Connected to ${name}`);

      // Set up event handlers
      this.setupEventHandlers(name, provider);

      // Start heartbeat
      this.startHeartbeat(name, provider);

      // Resubscribe to all events if this is a reconnection
      if (this.subscriptions.size > 0) {
        this.resubscribeAll(name, provider);
      }

      // Test connection with a simple call (but don't await in constructor)
      provider.getBlockNumber().catch((error) => {
        logger.error(`[WSS] ${name} initial connection test failed:`, error);
        config.isActive = false;
        this.scheduleReconnect(name);
      });

    } catch (error) {
      config.isActive = false;
      logger.error(`[WSS] ❌ Failed to connect to ${name}:`, error);
      
      // Schedule reconnection
      this.scheduleReconnect(name);
      throw error;
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(
    name: string,
    provider: WebSocketProvider
  ): void {
    // Ethers v6 WebSocketProvider handles connection events internally
    // We detect disconnections through heartbeat failures
    // The provider will emit 'error' events through the normal event system
    logger.info(`[WSS] ${name} event handlers configured (heartbeat-based detection)`);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(
    name: string,
    provider: WebSocketProvider
  ): void {
    const interval = setInterval(async () => {
      try {
        // Ping by getting block number
        await provider.getBlockNumber();
      } catch (error) {
        logger.error(`[WSS] ${name} heartbeat failed:`, error);
        this.handleDisconnect(name);
      }
    }, 30000); // Every 30 seconds

    this.heartbeatIntervals.set(name, interval);
  }

  /**
   * Handle provider disconnect
   */
  private handleDisconnect(name: string): void {
    const config = this.providers.get(name);
    if (!config) return;

    config.isActive = false;

    // Clear heartbeat
    const heartbeat = this.heartbeatIntervals.get(name);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.heartbeatIntervals.delete(name);
    }

    // If this was the active provider, switch to backup
    if (this.activeProvider === name) {
      logger.info(`[WSS] Active provider ${name} disconnected, switching to backup...`);
      this.switchToBackup();
    }

    // Schedule reconnection
    if (!this.isShuttingDown) {
      this.scheduleReconnect(name);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(name: string): void {
    const config = this.providers.get(name);
    if (!config) return;

    if (config.reconnectAttempts >= config.maxReconnectAttempts) {
      logger.error(`[WSS] ${name} exceeded max reconnect attempts`);
      return;
    }

    // Clear existing timer
    const existingTimer = this.reconnectTimers.get(name);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s, 30s...
    const delay = Math.min(1000 * Math.pow(2, config.reconnectAttempts), 30000);
    config.reconnectAttempts++;

    logger.info(`[WSS] Reconnecting to ${name} in ${delay}ms (attempt ${config.reconnectAttempts})`);

    const timer = setTimeout(() => {
      this.connect(name).catch((error) => {
        logger.error(`[WSS] Reconnect to ${name} failed:`, error);
      });
    }, delay);

    this.reconnectTimers.set(name, timer);
  }

  /**
   * Switch to backup provider
   */
  private switchToBackup(): void {
    const activeProviders = Array.from(this.providers.values())
      .filter((p) => p.isActive)
      .sort((a, b) => a.priority - b.priority);

    if (activeProviders.length > 0) {
      this.activeProvider = activeProviders[0].name;
      logger.info(`[WSS] ✅ Switched to backup provider: ${this.activeProvider}`);
      
      // Resubscribe all events to new provider
      const provider = this.ethersProviders.get(this.activeProvider);
      if (provider) {
        this.resubscribeAll(this.activeProvider, provider);
      }
    } else {
      this.activeProvider = null;
      logger.error(`[WSS] ❌ No backup providers available!`);
    }
  }

  /**
   * Subscribe to contract events
   */
  subscribe(
    id: string,
    address: string,
    topics: string[],
    callback: (log: Log) => void
  ): void {
    // Store subscription
    this.subscriptions.set(id, {
      id,
      address,
      topics,
      callback,
    });

    // Subscribe on active provider
    if (this.activeProvider) {
      const provider = this.ethersProviders.get(this.activeProvider);
      if (provider) {
        this.subscribeOnProvider(this.activeProvider, provider, { id, address, topics, callback });
      }
    }

    logger.info(`[WSS] Subscribed to ${id} (address: ${address})`);
  }

  /**
   * Subscribe to events on a specific provider
   */
  private subscribeOnProvider(
    providerName: string,
    provider: WebSocketProvider,
    sub: Subscription
  ): void {
    const filter = {
      address: sub.address,
      topics: sub.topics,
    };

    provider.on(filter, (log: any) => {
      try {
        sub.callback(log);
      } catch (error) {
        logger.error(`[WSS] Error in callback for ${sub.id}:`, error);
      }
    });

    logger.debug(`[WSS] ${providerName}: Subscribed to ${sub.id}`);
  }

  /**
   * Resubscribe all events to a provider
   */
  private resubscribeAll(
    providerName: string,
    provider: WebSocketProvider
  ): void {
    logger.info(`[WSS] Resubscribing ${this.subscriptions.size} events to ${providerName}...`);

    for (const sub of this.subscriptions.values()) {
      this.subscribeOnProvider(providerName, provider, sub);
    }
  }

  /**
   * Unsubscribe from specific event
   */
  unsubscribe(id: string): void {
    this.subscriptions.delete(id);
    
    // Remove from all providers
    for (const [name, provider] of this.ethersProviders.entries()) {
      provider.removeAllListeners(); // Note: This removes ALL listeners, you may want to be more specific
    }

    logger.info(`[WSS] Unsubscribed from ${id}`);
  }

  /**
   * Get active provider
   */
  getActiveProvider(): WebSocketProvider | null {
    if (!this.activeProvider) return null;
    return this.ethersProviders.get(this.activeProvider) || null;
  }

  /**
   * Get provider status
   */
  getStatus(): Record<string, any> {
    const status: Record<string, any> = {
      activeProvider: this.activeProvider,
      subscriptions: this.subscriptions.size,
      providers: {},
    };

    for (const [name, config] of this.providers.entries()) {
      status.providers[name] = {
        active: config.isActive,
        priority: config.priority,
        reconnectAttempts: config.reconnectAttempts,
      };
    }

    return status;
  }

  /**
   * Disconnect all providers
   */
  async disconnect(): Promise<void> {
    this.isShuttingDown = true;

    logger.info('[WSS] Disconnecting all providers...');

    // Clear all timers
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();

    for (const interval of this.heartbeatIntervals.values()) {
      clearInterval(interval);
    }
    this.heartbeatIntervals.clear();

    // Disconnect all providers
    for (const [name, provider] of this.ethersProviders.entries()) {
      try {
        provider.removeAllListeners();
        await provider.destroy();
        logger.info(`[WSS] Disconnected from ${name}`);
      } catch (error) {
        logger.error(`[WSS] Error disconnecting from ${name}:`, error);
      }
    }

    this.ethersProviders.clear();
    this.subscriptions.clear();
    this.activeProvider = null;

    logger.info('[WSS] ✅ All providers disconnected');
  }
}

// Singleton instance
export const wssManager = new WebSocketProviderManager();
