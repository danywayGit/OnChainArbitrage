/**
 * Network Configuration
 * Defines all supported networks, DEXs, and contract addresses
 */

export interface DEXConfig {
  name: string;
  router: string;
  factory: string;
  fee: number; // in basis points
}

export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number; // in seconds
  aavePoolProvider: string;
  dexes: DEXConfig[];
  commonTokens: TokenConfig[];
  explorer: string;
}

export const NETWORKS: { [key: string]: NetworkConfig } = {
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: process.env.ARBITRUM_RPC_URL || "",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockTime: 0.25,
    aavePoolProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    dexes: [
      {
        name: "Uniswap V3",
        router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        fee: 30,
      },
      {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
        fee: 30,
      },
      {
        name: "Camelot",
        router: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
        factory: "0x6EcCab422D763aC031210895C81787E87B43A652",
        fee: 30,
      },
    ],
    commonTokens: [
      {
        symbol: "WETH",
        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        decimals: 18,
      },
      {
        symbol: "USDC",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
      },
      {
        symbol: "USDT",
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        decimals: 6,
      },
      {
        symbol: "DAI",
        address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        decimals: 18,
      },
      {
        symbol: "ARB",
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        decimals: 18,
      },
    ],
    explorer: "https://arbiscan.io",
  },
  polygon: {
    chainId: 137,
    name: "Polygon PoS",
    rpcUrl: process.env.POLYGON_RPC_URL || "",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockTime: 2,
    aavePoolProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    dexes: [
      {
        name: "Uniswap V3",
        router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        fee: 30,
      },
      {
        name: "QuickSwap",
        router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
        fee: 30,
      },
      {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
        fee: 30,
      },
    ],
    commonTokens: [
      {
        symbol: "WMATIC",
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        decimals: 18,
      },
      {
        symbol: "WETH",
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        decimals: 18,
      },
      {
        symbol: "USDC",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
      },
      {
        symbol: "USDT",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
      },
      {
        symbol: "DAI",
        address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        decimals: 18,
      },
    ],
    explorer: "https://polygonscan.com",
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: process.env.BASE_RPC_URL || "",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockTime: 2,
    aavePoolProvider: "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D",
    dexes: [
      {
        name: "Uniswap V3",
        router: "0x2626664c2603336E57B271c5C0b26F421741e481",
        factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
        fee: 30,
      },
      {
        name: "BaseSwap",
        router: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
        factory: "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB",
        fee: 30,
      },
    ],
    commonTokens: [
      {
        symbol: "WETH",
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
      },
      {
        symbol: "USDbC",
        address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        decimals: 6,
      },
      {
        symbol: "DAI",
        address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
        decimals: 18,
      },
    ],
    explorer: "https://basescan.org",
  },
};

export function getNetworkConfig(networkName: string): NetworkConfig {
  const config = NETWORKS[networkName.toLowerCase()];
  if (!config) {
    throw new Error(`Network ${networkName} not supported`);
  }
  return config;
}

export function getAllNetworks(): string[] {
  return Object.keys(NETWORKS);
}
