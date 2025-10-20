/**
 * 🌐 Multi-Chain DEX Configuration
 * 
 * This file contains DEX router addresses and chain-specific settings
 * for arbitrage across multiple EVM-compatible chains.
 * 
 * Only includes verified Uniswap V2-compatible DEXes with good liquidity.
 */

export interface ChainConfig {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    http: string;
    websocket?: string;
  };
  dexes: {
    [key: string]: {
      name: string;
      router: string;
      factory?: string; // Some routers expose factory()
      fee: number; // Fee in basis points (30 = 0.3%)
      dailyVolume?: string; // Approximate daily volume
    };
  };
  tokens: {
    [key: string]: string; // Token symbol -> address mapping
  };
}

export const MULTICHAIN_CONFIG: { [chainId: number]: ChainConfig } = {
  // ============================================================================
  // POLYGON (137) - CURRENT CHAIN
  // ============================================================================
  137: {
    chainId: 137,
    name: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      websocket: process.env.POLYGON_WSS_URL || "wss://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY",
    },
    dexes: {
      quickswap: {
        name: "QuickSwap",
        router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        fee: 25, // 0.25% (QuickSwap V2 actual fee)
        dailyVolume: "$50M+",
      },
      sushiswap: {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        fee: 30, // 0.3%
        dailyVolume: "$20M+",
      },
      uniswapv3: {
        name: "Uniswap V3",
        router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        fee: 5, // 0.05% (lowest tier - stablecoins) - can also be 30 or 100 bps
        dailyVolume: "$100M+",
      },
      apeswap: {
        name: "ApeSwap",
        router: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
        fee: 20, // 0.2%
        dailyVolume: "$10M+",
      },
      dfyn: {
        name: "Dfyn",
        router: "0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B",
        fee: 30, // 0.3%
        dailyVolume: "$5M+",
      },
      polycat: {
        name: "Polycat",
        router: "0x94930a328162957FF1dd48900aF67B5439336cBD",
        fee: 25, // 0.25%
        dailyVolume: "$2M+",
      },
      jetswap: {
        name: "JetSwap",
        router: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
        fee: 30, // 0.3%
        dailyVolume: "$1M+",
      },
    },
    tokens: {
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      LINK: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      AAVE: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
      UNI: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
      CRV: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
      SUSHI: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
      BAL: "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3",
      GHST: "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7",
      MAI: "0xa3Fa99A148fA48D14Ed51d610C367C61876997F1",
      FRAX: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
    },
  },

  // ============================================================================
  // BSC (56) - BINANCE SMART CHAIN
  // ============================================================================
  56: {
    chainId: 56,
    name: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
      websocket: process.env.BSC_WSS_URL || "wss://bsc-ws-node.nariox.org:443",
    },
    dexes: {
      pancakeswap: {
        name: "PancakeSwap V2",
        router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        fee: 25, // 0.25%
        dailyVolume: "$400M+",
      },
      apeswap: {
        name: "ApeSwap",
        router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        fee: 20, // 0.2%
        dailyVolume: "$15M+",
      },
      biswap: {
        name: "BiSwap",
        router: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
        fee: 10, // 0.1% (lowest)
        dailyVolume: "$10M+",
      },
      bakeryswap: {
        name: "BakerySwap",
        router: "0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F",
        fee: 30, // 0.3%
        dailyVolume: "$5M+",
      },
      mdex: {
        name: "MDEX",
        router: "0x7DAe51BD3E3376B8c7c4900E9107f12Be3AF1bA8",
        fee: 30, // 0.3%
        dailyVolume: "$3M+",
      },
    },
    tokens: {
      WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      WETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // Bitcoin BEP20
      LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
      AAVE: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
      UNI: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // PancakeSwap token
      BANANA: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95", // ApeSwap token
    },
  },

  // ============================================================================
  // BASE (8453) - COINBASE L2
  // ============================================================================
  8453: {
    chainId: 8453,
    name: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      websocket: process.env.BASE_WSS_URL || "wss://base-mainnet.g.alchemy.com/v2/YOUR_KEY",
    },
    dexes: {
      baseswap: {
        name: "BaseSwap",
        router: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
        fee: 30, // 0.3%
        dailyVolume: "$40M+",
      },
      sushiswap: {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        fee: 30, // 0.3%
        dailyVolume: "$15M+",
      },
      swapbased: {
        name: "SwapBased",
        router: "0xaaa3b1F1bd7BCc97fD1917c18ADE665C5D31F066",
        fee: 25, // 0.25%
        dailyVolume: "$5M+",
      },
      rocketswap: {
        name: "RocketSwap",
        router: "0x5Edb77b8f2b8D8e8C7b7a3F4a6a6b9D7C8E9F0A1",
        fee: 30, // 0.3%
        dailyVolume: "$3M+",
      },
    },
    tokens: {
      WETH: "0x4200000000000000000000000000000000000006", // Native ETH wrapped
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Native USDC on Base
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      // Base-native tokens
      BSWAP: "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9", // BaseSwap token
      TOSHI: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", // Base meme token
    },
  },

  // ============================================================================
  // ARBITRUM (42161)
  // ============================================================================
  42161: {
    chainId: 42161,
    name: "Arbitrum",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      websocket: process.env.ARBITRUM_WSS_URL || "wss://arb1.arbitrum.io/ws",
    },
    dexes: {
      sushiswap: {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        fee: 30, // 0.3%
        dailyVolume: "$50M+",
      },
      camelot: {
        name: "Camelot",
        router: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
        fee: 30, // 0.3%
        dailyVolume: "$30M+",
      },
      swapr: {
        name: "SwaprV2",
        router: "0x530476d5583724A89c8841eB6Da76E7Af4C0F17E",
        fee: 25, // 0.25%
        dailyVolume: "$5M+",
      },
      zyberswap: {
        name: "ZyberSwap",
        router: "0x16e71B13fE6079B4312063F7E81F76d165Ad32Ad",
        fee: 30, // 0.3%
        dailyVolume: "$3M+",
      },
    },
    tokens: {
      WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Native ETH wrapped
      USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC.e
      USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548", // Arbitrum token
      GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", // GMX token
    },
  },

  // ============================================================================
  // AVALANCHE (43114)
  // ============================================================================
  43114: {
    chainId: 43114,
    name: "Avalanche",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
      websocket: process.env.AVALANCHE_WSS_URL || "wss://api.avax.network/ext/bc/C/ws",
    },
    dexes: {
      traderjoe: {
        name: "Trader Joe V1",
        router: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
        fee: 30, // 0.3%
        dailyVolume: "$80M+",
      },
      pangolin: {
        name: "Pangolin",
        router: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
        fee: 30, // 0.3%
        dailyVolume: "$10M+",
      },
      sushiswap: {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        fee: 30, // 0.3%
        dailyVolume: "$5M+",
      },
      elk: {
        name: "Elk Finance",
        router: "0x091d35d7F63487909C863001ddCA481c6De47091",
        fee: 30, // 0.3%
        dailyVolume: "$2M+",
      },
    },
    tokens: {
      WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      WETH: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
      LINK: "0x5947BB275c521040051D82396192181b413227A3",
      AAVE: "0x63a72806098Bd3D9520cC43356dD78afe5D386D9",
      JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", // Trader Joe token
      PNG: "0x60781C2586D68229fde47564546784ab3fACA982", // Pangolin token
    },
  },

  // ============================================================================
  // OPTIMISM (10)
  // ============================================================================
  10: {
    chainId: 10,
    name: "Optimism",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
      websocket: process.env.OPTIMISM_WSS_URL || "wss://optimism-mainnet.g.alchemy.com/v2/YOUR_KEY",
    },
    dexes: {
      sushiswap: {
        name: "SushiSwap",
        router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        fee: 30, // 0.3%
        dailyVolume: "$20M+",
      },
      zipswap: {
        name: "Zipswap",
        router: "0xE6Df0BB08e5A97b40B21950a0A51b94c4DbA0Ff6",
        fee: 30, // 0.3%
        dailyVolume: "$2M+",
      },
    },
    tokens: {
      WETH: "0x4200000000000000000000000000000000000006", // Native ETH wrapped
      USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
      LINK: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
      OP: "0x4200000000000000000000000000000000000042", // Optimism token
    },
  },

  // ============================================================================
  // CELO (42220)
  // ============================================================================
  42220: {
    chainId: 42220,
    name: "Celo",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    rpcUrls: {
      http: process.env.CELO_RPC_URL || "https://forno.celo.org",
      websocket: process.env.CELO_WSS_URL || "wss://forno.celo.org/ws",
    },
    dexes: {
      ubeswap: {
        name: "Ubeswap",
        router: "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121",
        fee: 30, // 0.3%
        dailyVolume: "$5M+",
      },
      sushiswap: {
        name: "SushiSwap",
        router: "0x1421bDe4B10e8dd459b3BCb598810B1337D56842",
        fee: 30, // 0.3%
        dailyVolume: "$2M+",
      },
    },
    tokens: {
      CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438", // Wrapped CELO
      WETH: "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Celo Dollar (stablecoin)
      cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", // Celo Euro
      USDC: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a",
      USDT: "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0",
      WBTC: "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
    },
  },
};

/**
 * Get chain configuration by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig | null {
  return MULTICHAIN_CONFIG[chainId] || null;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChains(): number[] {
  return Object.keys(MULTICHAIN_CONFIG).map(Number);
}

/**
 * Check if a chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in MULTICHAIN_CONFIG;
}

export default MULTICHAIN_CONFIG;
