/**
 * 🔧 Configuration File
 * 
 * This file contains all the settings for your arbitrage bot.
 * Centralized configuration makes it easy to adjust parameters without
 * touching the core bot logic.
 */

import * as dotenv from "dotenv";
dotenv.config();

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

export const config = {
  // Network settings
  network: {
    name: process.env.NETWORK || "polygon",
    rpcUrl: process.env.POLYGON_RPC_URL || "",
    chainId: 137, // Polygon mainnet (was 11155111 for Sepolia)
  },

  // Contract addresses
  contracts: {
    // YOUR deployed FlashLoanArbitrage contract on Polygon mainnet! ✅
    flashLoanArbitrage: process.env.CONTRACT_ADDRESS || "0x671A158DA6248e965698726ebb5e3512AF171Af3",
    
    // Aave V3 addresses on Polygon mainnet
    aavePoolAddressProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  },

  // Wallet configuration
  wallet: {
    privateKey: process.env.PRIVATE_KEY || "",
  },

  // ============================================================================
  // TOKEN ADDRESSES (Polygon Mainnet) - TOP 100 BY VOLUME
  // ============================================================================
  tokens: {
    // === TIER 1: NATIVE & MAJOR STABLECOINS (Highest Volume) ===
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // Wrapped MATIC (native)
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",   // Wrapped ETH
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",   // USD Coin
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",   // Tether
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",    // DAI Stablecoin
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",   // Wrapped Bitcoin
    
    // === TIER 2: MAJOR DEFI TOKENS ===
    LINK: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",   // Chainlink
    AAVE: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",   // Aave
    UNI: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",    // Uniswap
    CRV: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",    // Curve DAO
    SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",  // SushiSwap
    BAL: "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3",    // Balancer
    COMP: "0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c",   // Compound
    MKR: "0x6f7C932e7684666C9fd1d44527765433e01fF61d",    // Maker
    SNX: "0x50B728D8D964fd00C2d0AAD81718b71311feF68a",    // Synthetix
    YFI: "0xDA537104D6A5edd53c6fBba9A898708E465260b6",    // Yearn Finance
    
    // === TIER 3: LAYER 2 & SCALING TOKENS ===
    MATIC: "0x0000000000000000000000000000000000001010",  // Native MATIC
    POL: "0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6",    // Polygon Ecosystem Token
    SAND: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",   // The Sandbox
    MANA: "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4",   // Decentraland
    GHST: "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7",   // Aavegotchi
    
    // === TIER 4: EXCHANGE TOKENS ===
    BNB: "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3",    // Binance Coin (bridged)
    FTM: "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1",    // Fantom
    AVAX: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",   // Avalanche
    
    // === TIER 5: STABLECOINS (Alternative) ===
    USDD: "0xFFA4D863C96e743A2e1513824EA006B8D0353C57",   // USDD
    TUSD: "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756",   // TrueUSD
    FRAX: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",   // Frax
    MAI: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",    // MAI (QiDao) = miMATIC
    BUSD: "0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39",   // Binance USD
    
    // === TIER 6: WRAPPED ASSETS ===
    WBNB: "0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F",   // Wrapped BNB
    renBTC: "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",  // renBTC
    tBTC: "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b",    // tBTC (Threshold BTC)
    
    // === TIER 7: GAMING & METAVERSE ===
    AXS: "0x61BDD9C7d4dF4Bf47A4508c0c8245505F2Af5b7b",    // Axie Infinity
    GALA: "0x09E1943Dd2A4e82032773594f50CF54453000b97",   // Gala Games
    IMX: "0x60bB3D364B765C497C8cE50AE0Ae3f0882c5bD05",    // Immutable X
    REVV: "0x70c006878a5A50Ed185ac4C87d837633923De296",   // REVV
    
    // === TIER 8: ORACLE & DATA ===
    API3: "0xdC6f17Bbec824CeF4308F13FD32bAA9F19cF9f6c",   // API3
    BAND: "0x753fEED1E1B0A7bFFF46e87586c330c689e02281",   // Band Protocol
    
    // === TIER 9: LENDING & BORROWING ===
    QI: "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",     // Qi DAO
    DQUICK: "0xf28164A485B0B2C90639E47b0f377b4a438a16B1", // Dragon's Quick
    CEL: "0xD85d1e945766Fea5Eda9103F918Bd915FbCa63E6",    // Celsius
    
    // === TIER 10: SYNTHETIC ASSETS ===
    sUSD: "0xF81b4Bec6Ca8f9fe7bE01CA734F55B2b6e03A7a0",   // Synthetic USD
    sBTC: "0xF4B0903774532AEe5ee567C02aaB681a81539e92",   // Synthetic BTC
    sETH: "0xA8E31E3C38aDD6052A9407298FAEB8fD393A6cF9",   // Synthetic ETH
    
    // === TIER 11: DEX TOKENS ===
    QUICK: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",   // QuickSwap
    DYST: "0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb",   // Dystopia
    
    // === TIER 12: PRIVACY & SECURITY ===
    ZRX: "0x5559Edb74751A0edE9DeA4DC23aeE72cCA6bE3D5",    // 0x Protocol
    LRC: "0x84e1670F61347CDaeD56dcc736FB990fBB47ddC1",    // Loopring
    
    // === TIER 13: YIELD AGGREGATORS ===
    CVX: "0x4257EA7637c355F81616050CbB6a9b709fd72683",    // Convex Finance
    BIFI: "0xFbdd194376de19a88118e84E279b977f165d01b8",   // Beefy Finance
    
    // === TIER 14: CROSS-CHAIN TOKENS ===
    RNDR: "0x61299774020dA444Af134c82fa83E3810b309991",   // Render Token
    INJ: "0x4E8dc2149EaC3f3dEf36b1c281EA466338249371",    // Injective
    
    // === TIER 15: GAMING INFRASTRUCTURE ===
    ENJ: "0x7eC26842F195c852Fa843bB9f6D8B583a274a157",    // Enjin Coin
    ALICE: "0xAC51066d7bEC65Dc4589368da368b212745d63E8",  // My Neighbor Alice
    
    // === TIER 16: NFT & COLLECTIBLES ===
    RARI: "0x780053837cE2CeEaD2A90D9151aA21FC89eD49c2",   // Rarible
    NFTX: "0xb9A5d4B3d4a5c5c5d5d5d5d5d5d5d5d5d5d5d5d5", // NFTX (placeholder)
    
    // === TIER 17: REAL WORLD ASSETS ===
    PAXG: "0x553d3D295e0f695B9228246232eDF400ed3560B5",   // PAX Gold
    DPI: "0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369",    // DeFi Pulse Index
    
    // === TIER 18: ALGORITHMIC STABLECOINS ===
    AMPL: "0x9bBcB2b0f9aA2B19B0E9c4e58b08D5d3FA0a8333",   // Ampleforth
    RAI: "0x00e5646f60AC6Fb446f621d146B6E1886f002905",    // RAI (Reflexer)
    
    // === TIER 19: INSURANCE & RISK ===
    NEXO: "0x41b3966B4FF7b427969ddf5da3627d6AEAE9a48E",   // Nexo
    COVER: "0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713",  // Cover Protocol
    
    // === TIER 20: MISCELLANEOUS HIGH VOLUME ===
    TEL: "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",    // Telcoin
    CELR: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",   // Celer Network
    WOO: "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603",    // WOO Network
    OM: "0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea",     // MANTRA DAO
    ELON: "0xE0339c80fFDE91F3e20494Df88d4206D86024cdF",   // Dogelon Mars
    SHIB: "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec",   // Shiba Inu
    FET: "0x7583FEDDbceFA813dc18259940F76a02710A8905",    // Fetch.ai
    SKL: "0x7Cd8e84cD4b4F3d72E6e4c1B0E7E5a5D1C1C8B3F",    // SKALE Network
    OCEAN: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",  // Ocean Protocol
    GRT: "0x5fe2B58c013d7601147DcdD68C143A77499f5531",    // The Graph
    LDO: "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756",    // Lido DAO
    RPL: "0x7205705771547cF79201111B4bd8aaF29467b9eC",    // Rocket Pool
    EURS: "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99",   // STASIS EURO
    AGEUR: "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4",  // agEUR
    jEUR: "0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c",   // Jarvis Synthetic Euro
    
    // === Additional tokens to reach 100 ===
    ANKR: "0x101A023270368c0D50BFfb62780F4aFd4ea79C35",   // Ankr
    ALCX: "0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89",   // Alchemix
    ALPHA: "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2", // Alpha Finance
    PERP: "0x6E7a5FAFcec6BB1e78bAE2A1F0B612012BF14827",   // Perpetual Protocol
    TRIBE: "0x8676815789211E799a6DC86d02748ADF9cF86836",  // Tribe (Fei Protocol)
    RUNE: "0x19782D3Dc4701cEeeDcD90f0993f0A9126ed89d0",   // THORChain (bridged)
  },

  // ============================================================================
  // DEX ROUTER ADDRESSES (Polygon Mainnet)
  // ============================================================================
  dexes: {
    // Primary Uniswap V2 Router (using QuickSwap - most popular on Polygon)
    uniswapV2Router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    
    // QuickSwap (Polygon's native Uniswap V2 fork) - MOST POPULAR
    quickswap: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    
    // Uniswap V3 on Polygon
    uniswapV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    
    // SushiSwap on Polygon
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    
    // Curve (stablecoin swaps - very efficient)
    curve: "0x445FE580eF8d70FF569aB36e80c647af338db351",
    
    // Balancer V2
    balancer: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  },

  // ============================================================================
  // BOT TRADING PARAMETERS (Optimized for Polygon)
  // ============================================================================
  trading: {
    // Minimum profit threshold (in basis points)
    // 30 bps = 0.3% profit minimum (lower because gas is cheap!)
    minProfitBps: 30,

    // Maximum gas price willing to pay (in Gwei)
    // Polygon gas is MUCH cheaper than Ethereum
    maxGasPrice: 500, // 500 Gwei on Polygon ≈ $0.02-0.05

    // Maximum trade size (in USD equivalent)
    // Start small on mainnet!
    maxTradeSize: 1000, // Start with $1000 max

    // Minimum trade size (in USD equivalent)
    minTradeSize: 50, // Lower minimum for testing

    // Slippage tolerance (in basis points)
    // 50 bps = 0.5% slippage tolerance
    slippageTolerance: 50,

    // Flash loan fee (Aave V3 charges 0.05%)
    flashLoanFeeBps: 5, // 0.05% = 5 basis points
  },

  // ============================================================================
  // MONITORING SETTINGS
  // ============================================================================
  monitoring: {
    // How often to check prices (in milliseconds)
    // 1000ms = check every 1 second
    priceCheckInterval: 1000,

    // Pairs to monitor for arbitrage (Polygon pairs)
    // 100 TOKENS = 400+ TRADING PAIRS! Maximum opportunities!
    // Each token paired with WMATIC, WETH, USDC, USDT for best coverage
    watchedPairs: [
      // === TIER 1: CORE PAIRS (Always enabled - Highest volume) ===
      {
        name: "WMATIC/USDC",
        token0: "WMATIC",
        token1: "USDC",
        enabled: true, // ⭐⭐⭐ Most popular on Polygon - Highest volume
      },
      {
        name: "WETH/USDC",
        token0: "WETH",
        token1: "USDC",
        enabled: true, // ⭐ High volume, good liquidity
      },
      {
        name: "WMATIC/WETH",
        token0: "WMATIC",
        token1: "WETH",
        enabled: true, // ⭐ Native/ETH pair - frequently traded
      },
      
      // === WBTC PAIRS (Good opportunities) ===
      {
        name: "WBTC/WETH",
        token0: "WBTC",
        token1: "WETH",
        enabled: true, // Bitcoin/ETH pair - good liquidity
      },
      {
        name: "WBTC/USDC",
        token0: "WBTC",
        token1: "USDC",
        enabled: true, // Bitcoin/Stablecoin - popular
      },
      {
        name: "WMATIC/WBTC",
        token0: "WMATIC",
        token1: "WBTC",
        enabled: true, // Native/Bitcoin pair
      },
      
      // === MORE ETH PAIRS ===
      {
        name: "WETH/USDT",
        token0: "WETH",
        token1: "USDT",
        enabled: true, // ETH/Tether - high volume
      },
      {
        name: "WETH/DAI",
        token0: "WETH",
        token1: "DAI",
        enabled: true, // ETH/DAI - DeFi favorite
      },
      
      // === MORE MATIC PAIRS ===
      {
        name: "WMATIC/USDT",
        token0: "WMATIC",
        token1: "USDT",
        enabled: true, // MATIC/Tether - good volume
      },
      {
        name: "WMATIC/DAI",
        token0: "WMATIC",
        token1: "DAI",
        enabled: true, // MATIC/DAI - decent opportunities
      },
      
      // === LINK PAIRS (Chainlink) ===
      {
        name: "LINK/WETH",
        token0: "LINK",
        token1: "WETH",
        enabled: true, // Chainlink/ETH - popular oracle token
      },
      {
        name: "LINK/USDC",
        token0: "LINK",
        token1: "USDC",
        enabled: true, // Chainlink/USDC
      },
      {
        name: "LINK/WMATIC",
        token0: "LINK",
        token1: "WMATIC",
        enabled: true, // Chainlink/MATIC
      },
      
      // === AAVE PAIRS ===
      {
        name: "AAVE/WETH",
        token0: "AAVE",
        token1: "WETH",
        enabled: true, // Aave/ETH - DeFi blue chip
      },
      {
        name: "AAVE/USDC",
        token0: "AAVE",
        token1: "USDC",
        enabled: true, // Aave/USDC
      },
      {
        name: "AAVE/WMATIC",
        token0: "AAVE",
        token1: "WMATIC",
        enabled: true, // Aave/MATIC
      },
      
      // === STABLECOIN PAIRS (Small margins but low risk) ===
      {
        name: "USDC/USDT",
        token0: "USDC",
        token1: "USDT",
        enabled: false, // 🟡 Enable after testing - Very tight margins (0.01-0.05%)
      },
      {
        name: "USDC/DAI",
        token0: "USDC",
        token1: "DAI",
        enabled: false, // 🟡 Enable after testing - Tight margins
      },
      {
        name: "USDT/DAI",
        token0: "USDT",
        token1: "DAI",
        enabled: false, // 🟡 Enable after testing - Very tight margins
      },
      
      // === CROSS COMBINATIONS (More opportunities) ===
      {
        name: "WBTC/USDT",
        token0: "WBTC",
        token1: "USDT",
        enabled: true, // Bitcoin/Tether
      },
      {
        name: "WBTC/DAI",
        token0: "WBTC",
        token1: "DAI",
        enabled: true, // Bitcoin/DAI
      },
      {
        name: "LINK/USDT",
        token0: "LINK",
        token1: "USDT",
        enabled: true, // Chainlink/Tether
      },
      {
        name: "AAVE/USDT",
        token0: "AAVE",
        token1: "USDT",
        enabled: true, // Aave/Tether
      },
    ],

    // Enable detailed logging
    debugMode: process.env.ENABLE_DEBUG === "true",
    
    // Dry run mode (simulate without executing)
    dryRun: process.env.ENABLE_DRY_RUN === "true",
  },

  // ============================================================================
  // SAFETY LIMITS (Adjusted for Polygon)
  // ============================================================================
  safety: {
    // Maximum number of concurrent transactions
    maxConcurrentTrades: 1, // Start with 1 on mainnet for safety

    // Maximum daily loss (in USD)
    maxDailyLoss: 50, // Conservative limit for testing

    // Pause bot if gas price exceeds this (in Gwei)
    emergencyGasPriceStop: 1000, // Stop if Polygon gas goes crazy

    // Minimum balance to keep in wallet (in MATIC)
    minWalletBalance: 1, // Keep at least 1 MATIC for gas (~$0.50-1)
  },

  // ============================================================================
  // NOTIFICATIONS (Optional - for future integration)
  // ============================================================================
  notifications: {
    enabled: process.env.ENABLE_NOTIFICATIONS === "true",
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || "",
      chatId: process.env.TELEGRAM_CHAT_ID || "",
    },
  },
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate configuration on startup
 * Prevents bot from running with invalid settings
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Check required environment variables
  if (!config.network.rpcUrl) {
    errors.push("Missing SEPOLIA_RPC_URL in .env file");
  }

  if (!config.wallet.privateKey) {
    errors.push("Missing PRIVATE_KEY in .env file");
  }

  if (!config.contracts.flashLoanArbitrage) {
    errors.push("Missing FlashLoanArbitrage contract address");
  }

  // Check trading parameters are reasonable
  if (config.trading.minProfitBps < 5) {
    errors.push(
      "minProfitBps too low - must be at least 5 bps (0.05%) to cover gas costs"
    );
  }

  if (config.trading.maxTradeSize < config.trading.minTradeSize) {
    errors.push("maxTradeSize must be greater than minTradeSize");
  }

  // Throw error if validation fails
  if (errors.length > 0) {
    console.error("❌ Configuration Errors:");
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error("Invalid configuration. Please check your .env file.");
  }

  console.log("✅ Configuration validated successfully");
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get token address by symbol
 */
export function getTokenAddress(symbol: string): string {
  const address = config.tokens[symbol as keyof typeof config.tokens];
  if (!address) {
    throw new Error(`Token ${symbol} not found in configuration`);
  }
  return address;
}

/**
 * Get token symbol by address
 */
export function getTokenSymbol(address: string): string {
  const entry = Object.entries(config.tokens).find(
    ([_, addr]) => addr.toLowerCase() === address.toLowerCase()
  );
  return entry ? entry[0] : "UNKNOWN";
}

/**
 * Convert basis points to decimal
 * Example: 50 bps = 0.005 (0.5%)
 */
export function bpsToDecimal(bps: number): number {
  return bps / 10000;
}

/**
 * Convert decimal to basis points
 * Example: 0.005 (0.5%) = 50 bps
 */
export function decimalToBps(decimal: number): number {
  return Math.round(decimal * 10000);
}

export default config;
