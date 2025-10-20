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

// Supported chains
export type SupportedChain = "polygon" | "bsc" | "base";

export const config = {
  // Network settings (dynamic based on NETWORK env var)
  network: {
    name: (process.env.NETWORK || "polygon") as SupportedChain,
    rpcUrl: process.env.NETWORK === "bsc" 
      ? (process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org")
      : process.env.NETWORK === "base"
      ? (process.env.BASE_RPC_URL || "https://mainnet.base.org")
      : (process.env.POLYGON_RPC_URL || ""),
    chainId: process.env.NETWORK === "bsc" ? 56 : process.env.NETWORK === "base" ? 8453 : 137,
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
  // BSC TOKEN ADDRESSES (BSC Mainnet - Chain ID 56)
  // ============================================================================
  tokensBSC: {
    // === TIER 1: NATIVE & MAJOR TOKENS ===
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",   // Wrapped BNB (native)
    WETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",   // Wrapped ETH
    BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",   // Bitcoin BEP20
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",   // USD Coin
    USDT: "0x55d398326f99059fF775485246999027B3197955",   // Tether
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",   // Binance USD
    DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",    // DAI Stablecoin
    
    // === TIER 2: DEFI TOKENS ===
    CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",   // PancakeSwap
    BANANA: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95", // ApeSwap
    UNI: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",    // Uniswap
    LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",   // Chainlink
    AAVE: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",   // Aave
    SUSHI: "0x947950BcC74888a40Ffa2593C5798F11Fc9124C4",  // SushiSwap
    
    // === TIER 3: GAMING & METAVERSE ===
    AXS: "0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0",    // Axie Infinity
    MBOX: "0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377",   // Mobox
    GALA: "0x7dDEE176F665cD201F93eEDE625770E2fD911990",   // Gala
    
    // === TIER 4: LAYER 1 TOKENS ===
    ADA: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",    // Cardano
    DOT: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",    // Polkadot
    MATIC: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",  // Polygon
    AVAX: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041",   // Avalanche
    FTM: "0xAD29AbB318791D579433D831ed122aFeAf29dcfe",    // Fantom
    
    // === TIER 5: EXCHANGE TOKENS ===
    XVS: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",    // Venus
    ALPACA: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F", // Alpaca Finance
  },

  // ============================================================================
  // BASE TOKEN ADDRESSES (Base Mainnet - Chain ID 8453)
  // ============================================================================
  tokensBase: {
    // === TIER 1: NATIVE & MAJOR TOKENS ===
    WETH: "0x4200000000000000000000000000000000000006",   // Wrapped ETH (native on Base)
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // Native USDC on Base
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",    // DAI Stablecoin
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",   // Tether
    WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",   // Wrapped Bitcoin
    
    // === TIER 2: BASE-NATIVE DEFI TOKENS ===
    BSWAP: "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9",   // BaseSwap token
    TOSHI: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4",   // Toshi (Base meme/community token)
    
    // === TIER 3: MAJOR DEFI TOKENS (Bridged) ===
    UNI: "0xc3De830EA07524a0761646a6a4e4be0e114a3C83",     // Uniswap (bridged)
    LINK: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",    // Chainlink (bridged)
    AAVE: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",    // Aave (bridged)
    SUSHI: "0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA",   // SushiSwap (bridged)
    
    // === TIER 4: EMERGING BASE PROJECTS ===
    // Note: Base is newer, so fewer established tokens
    // Will add more as ecosystem grows
  },

  // ============================================================================
  // DEX ROUTER ADDRESSES (Polygon Mainnet)
  // ============================================================================
  // LOW-FEE DEXes ON POLYGON
  // ============================================================================
  dexes: {
    // Primary Uniswap V2 Router (using QuickSwap - most popular on Polygon)
    uniswapV2Router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    
    // ============================================================================
    // UNISWAP V2 COMPATIBLE DEXES (TIER 1) ✅
    // ============================================================================
    
    // QuickSwap (Polygon's native Uniswap V2 fork) - MOST POPULAR ✅
    // Fee: 0.25% | Gas: Low | Liquidity: Highest | Volume: $50M+ daily
    quickswap: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    
    // SushiSwap on Polygon ✅
    // Fee: 0.3% | Gas: Low | Liquidity: High | Volume: $20M+ daily
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    
    // Uniswap V3 on Polygon ✅ NEW!
    // Fee: 0.05%-1% (tiered) | Gas: Medium | Liquidity: Very High | Volume: $100M+ daily
    // BENEFITS: Lower fees (0.05% for stablecoins), concentrated liquidity = better prices
    uniswapv3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    
    // ApeSwap (BSC-originated, now on Polygon) ✅ NEW!
    // Fee: 0.2% | Gas: Low | Liquidity: Medium | Volume: $10M+ daily
    apeswap: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
    
    // Dfyn Exchange (Polygon-native DEX) ✅ RE-ENABLED!
    // Fee: 0.3% | Gas: Low | Liquidity: Medium | Volume: $5M+ daily
    dfyn: "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429",
    
    // Polycat Finance (Yield farming + DEX) ✅ NEW!
    // Fee: 0.25% | Gas: Low | Liquidity: Medium-Low | Volume: $2M+ daily
    polycat: "0x94930a328162957FF1dd48900aF67B5439336cBD",
    
    // JetSwap (Multi-chain DEX) ✅ NEW!
    // Fee: 0.3% | Gas: Low | Liquidity: Medium-Low | Volume: $1M+ daily
    jetswap: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
    
    // ⚠️ HIGHER FEE/GAS DEXes (Use with caution)
    
    // Uniswap V3 on Polygon
    // Fee: 0.05%-1% | Gas: Medium-High
    uniswapV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    
    // Curve (stablecoin swaps - very efficient)
    // Fee: 0.04% | Gas: Low | Only for stablecoins
    curve: "0x445FE580eF8d70FF569aB36e80c647af338db351",
    
    // Balancer V2
    // Fee: ~0.1% | Gas: High | Complex routing
    balancer: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  },

  // ============================================================================
  // BSC DEX ROUTER ADDRESSES (BSC Mainnet - Chain ID 56)
  // ============================================================================
  dexesBSC: {
    // Primary Uniswap V2 Router (using PancakeSwap V2 - most popular on BSC)
    uniswapV2Router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    
    // ============================================================================
    // UNISWAP V2 COMPATIBLE DEXES (BSC) ✅
    // ============================================================================
    
    // PancakeSwap V2 (BSC's largest DEX) - KING OF BSC ✅
    // Fee: 0.25% | Gas: Low | Liquidity: Highest | Volume: $400M+ daily
    pancakeswap: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    
    // ApeSwap (BSC-native, also on Polygon) ✅
    // Fee: 0.2% | Gas: Low | Liquidity: High | Volume: $15M+ daily
    apeswap: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
    
    // BiSwap (Ultra-low fee DEX) ✅
    // Fee: 0.1% | Gas: Low | Liquidity: Medium | Volume: $10M+ daily
    biswap: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
    
    // BakerySwap (Early BSC DEX) ✅
    // Fee: 0.3% | Gas: Low | Liquidity: Medium | Volume: $5M+ daily
    bakeryswap: "0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F",
    
    // MDEX (Multi-chain DEX) ✅
    // Fee: 0.3% | Gas: Low | Liquidity: Medium | Volume: $3M+ daily
    mdex: "0x7DAe51BD3E3376B8c7c4900E9107f12Be3AF1bA8",
  },

  // ============================================================================
  // BASE DEX ROUTER ADDRESSES (Base Mainnet - Chain ID 8453)
  // ============================================================================
  dexesBase: {
    // Primary Uniswap V2 Router (using BaseSwap - most popular on Base)
    uniswapV2Router: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
    
    // ============================================================================
    // UNISWAP V2 COMPATIBLE DEXES (BASE) ✅
    // ============================================================================
    
    // BaseSwap (Base's leading DEX) - MOST POPULAR ON BASE ✅
    // Fee: 0.3% | Gas: Low | Liquidity: Highest on Base | Volume: $40M+ daily
    baseswap: "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86",
    
    // SushiSwap on Base ✅
    // Fee: 0.3% | Gas: Low | Liquidity: High | Volume: $15M+ daily
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    
    // SwapBased (Base-native DEX) ✅
    // Fee: 0.25% | Gas: Low | Liquidity: Medium | Volume: $5M+ daily
    swapbased: "0xaaa3b1F1bd7BCc97fD1917c18ADE665C5D31F066",
    
    // Aerodrome (Base's Largest DEX) ✅
    // Fee: 0.3% | Gas: Low | Liquidity: Highest | Volume: $100M+ daily
    aerodrome: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
  },

  // ============================================================================
  // BOT TRADING PARAMETERS (Optimized for Polygon)
  // ============================================================================
  trading: {
    // Minimum profit threshold (in basis points)
    // 10 bps = 0.1% profit minimum on-chain (very aggressive, allows slippage)
    minProfitBps: 10,

    // Maximum gas price willing to pay (in Gwei)
    // Polygon gas is MUCH cheaper than Ethereum
    maxGasPrice: 500, // 500 Gwei on Polygon ≈ $0.02-0.05

    // Maximum trade size (in USD equivalent)
    // Start small on mainnet!
    maxTradeSize: parseInt(process.env.MAX_TRADE_SIZE_USD || "1000", 10),

    // Minimum trade size (in USD equivalent)
    minTradeSize: parseInt(process.env.MIN_TRADE_SIZE_USD || "50", 10),

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
      // ✅ VERIFIED PAIRS (Real liquidity on QuickSwap + SushiSwap)
      // ⚠️ EXCLUDING TOP 15 TOKENS: POL, USDC (used as base only), LINK, USDT (used as base only), UNI, AAVE, WBTC
      // These pairs passed liquidity verification with realistic spreads < 2%
      
      // === TIER 1: ULTRA-TIGHT SPREADS (0.02-0.25%) ===
      {
        name: "WMATIC/DAI",
        token0: "WMATIC",
        token1: "DAI",
        enabled: true, // ✅ 0.02% spread - BEST! DAI is #8 locally but mid-tier globally
      },
      {
        name: "MAI/USDC",
        token0: "MAI",
        token1: "USDC",
        enabled: true, // ✅ 0.02% spread - MAI is mid-tier alt stablecoin
      },
      {
        name: "WMATIC/USDT",
        token0: "WMATIC",
        token1: "USDT",
        enabled: true, // ✅ 0.04% spread - USDT used as base pair only
      },
      {
        name: "WMATIC/USDC",
        token0: "WMATIC",
        token1: "USDC",
        enabled: true, // ✅ 0.06% spread - USDC used as base pair only
      },
      {
        name: "DAI/USDC",
        token0: "DAI",
        token1: "USDC",
        enabled: false, // ❌ EXCLUDED per user request
      },
      {
        name: "WMATIC/WETH",
        token0: "WMATIC",
        token1: "WETH",
        enabled: true, // ✅ 0.23% spread - Native/ETH pairing
      },
      
      // === EXCLUDED PAIRS (User request) ===
      {
        name: "WETH/USDT",
        token0: "WETH",
        token1: "USDT",
        enabled: false, // ❌ EXCLUDED per user request
      },
      {
        name: "WETH/USDC",
        token0: "WETH",
        token1: "USDC",
        enabled: false, // ❌ EXCLUDED per user request
      },
      {
        name: "GHST/USDC",
        token0: "GHST",
        token1: "USDC",
        enabled: true, // ✅ 1.71% spread - Gaming token, not top 15
      },
      
      // === DISABLED: TOP 15 TOKENS (Avoiding MEV competition) ===
      {
        name: "WBTC/USDC",
        token0: "WBTC",
        token1: "USDC",
        enabled: false, // ❌ WBTC is #9 in top 15 + 71943% spread fake pool!
      },
      {
        name: "WBTC/WETH",
        token0: "WBTC",
        token1: "WETH",
        enabled: false, // ❌ WBTC is #9 in top 15 + 11.53% spread suspicious
      },
      {
        name: "WMATIC/WBTC",
        token0: "WMATIC",
        token1: "WBTC",
        enabled: true, // ✅ ENABLED - High volume pair with WBTC
      },
      {
        name: "WETH/DAI",
        token0: "WETH",
        token1: "DAI",
        enabled: false, // ❌ DISABLED - Top 15 high-volume pair (not wanted)
      },
      
      // === LINK PAIRS - TOP 15 TOKEN (#3) ===
      {
        name: "LINK/WETH",
        token0: "LINK",
        token1: "WETH",
        enabled: false, // ❌ LINK is #3 in top 15 ($11.7B market cap)
      },
      {
        name: "LINK/USDC",
        token0: "LINK",
        token1: "USDC",
        enabled: false, // ❌ LINK is #3 in top 15 + 183% spread fake pool!
      },
      {
        name: "LINK/WMATIC",
        token0: "LINK",
        token1: "WMATIC",
        enabled: false, // ❌ LINK is #3 in top 15 + 22.35% spread fake pool!
      },
      
      // === AAVE PAIRS - TOP 15 TOKEN (#6) ===
      {
        name: "AAVE/WETH",
        token0: "AAVE",
        token1: "WETH",
        enabled: false, // ❌ AAVE is #6 in top 15 ($3.2B market cap)
      },
      {
        name: "AAVE/USDC",
        token0: "AAVE",
        token1: "USDC",
        enabled: false, // ❌ AAVE is #6 in top 15 + 97.83% spread fake pool!
      },
      {
        name: "AAVE/WMATIC",
        token0: "AAVE",
        token1: "WMATIC",
        enabled: false, // ❌ AAVE is #6 in top 15 + 6.94% spread suspicious
      },
      
      // === UNI PAIRS - TOP 15 TOKEN (#5) ===
      {
        name: "UNI/WETH",
        token0: "UNI",
        token1: "WETH",
        enabled: false, // ❌ UNI is #5 in top 15 ($3.6B market cap)
      },
      {
        name: "UNI/USDC",
        token0: "UNI",
        token1: "USDC",
        enabled: false, // ❌ UNI is #5 in top 15 + 8780% spread fake pool!
      },
      {
        name: "UNI/WMATIC",
        token0: "UNI",
        token1: "WMATIC",
        enabled: false, // ❌ UNI is #5 in top 15 + 99.87% spread fake pool!
      },
      
      // === STABLECOIN PAIRS ===
      {
        name: "USDC/USDT",
        token0: "USDC",
        token1: "USDT",
        enabled: false, // ❌ Both in top 15 + 78% spread fake pool!
      },
      {
        name: "USDC/DAI",
        token0: "USDC",
        token1: "DAI",
        enabled: false, // Duplicate of DAI/USDC
      },
      {
        name: "USDT/DAI",
        token0: "USDT",
        token1: "DAI",
        enabled: false, // Not verified
      },
      
      // === MORE TOP 15 TOKEN PAIRS ===
      {
        name: "WBTC/USDT",
        token0: "WBTC",
        token1: "USDT",
        enabled: false, // ❌ WBTC is #9 in top 15
      },
      {
        name: "WBTC/DAI",
        token0: "WBTC",
        token1: "DAI",
        enabled: false, // ❌ WBTC is #9 in top 15
      },
      {
        name: "LINK/USDT",
        token0: "LINK",
        token1: "USDT",
        enabled: false, // ❌ LINK is #3 in top 15
      },
      {
        name: "AAVE/USDT",
        token0: "AAVE",
        token1: "USDT",
        enabled: false, // ❌ AAVE is #6 in top 15
      },
      
      // === GAMING & METAVERSE - TOP 15 TOKENS (#10, #11) ===
      {
        name: "SAND/USDC",
        token0: "SAND",
        token1: "USDC",
        enabled: false, // ❌ SAND is #10 in top 15 + 13675% spread fake pool!
      },
      {
        name: "MANA/USDC",
        token0: "MANA",
        token1: "USDC",
        enabled: false, // ❌ MANA is #11 in top 15 + 14.23% spread fake pool!
      },
      {
        name: "SAND/WMATIC",
        token0: "SAND",
        token1: "WMATIC",
        enabled: false, // ❌ SAND is #10 in top 15
      },
      {
        name: "MANA/WMATIC",
        token0: "MANA",
        token1: "WMATIC",
        enabled: false, // ❌ MANA is #11 in top 15
      },
      
      // === DEX TOKENS ===
      {
        name: "SUSHI/WMATIC",
        token0: "SUSHI",
        token1: "WMATIC",
        enabled: true, // ✅ ENABLED - SushiSwap native token with good liquidity
      },
      {
        name: "CRV/WMATIC",
        token0: "CRV",
        token1: "WMATIC",
        enabled: true, // ✅ ENABLED - Curve DAO token, good for DeFi
      },
      {
        name: "BAL/WMATIC",
        token0: "BAL",
        token1: "WMATIC",
        enabled: true, // ✅ ENABLED - Balancer token, especially relevant since we're adding Balancer DEX
      },
      {
        name: "UNI/WMATIC",
        token0: "UNI",
        token1: "WMATIC",
        enabled: false, // ❌ 99.87% spread - FAKE!
      },
      
      // === ALT STABLECOIN / OTHER ===
      {
        name: "MAI/WMATIC",
        token0: "MAI",
        token1: "WMATIC",
        enabled: true, // ✅ ENABLED - MAI stablecoin native to Polygon
      },
      {
        name: "POL/USDC",
        token0: "POL",
        token1: "USDC",
        enabled: false, // ❌ POL is #1 in top 15 ($2B market cap) + No pools on either DEX!
      },
      {
        name: "QUICK/WMATIC",
        token0: "QUICK",
        token1: "WMATIC",
        enabled: false, // ❌ No SushiSwap pool!
      },
      
      // === NEW PAIRS - SCALING UP! ===
      {
        name: "CRV/WETH",
        token0: "CRV",
        token1: "WETH",
        enabled: true, // ✅ Curve DAO / ETH - Good DeFi pair
      },
      {
        name: "CRV/USDC",
        token0: "CRV",
        token1: "USDC",
        enabled: true, // ✅ Curve DAO / Stablecoin
      },
      {
        name: "SUSHI/WETH",
        token0: "SUSHI",
        token1: "WETH",
        enabled: true, // ✅ SushiSwap / ETH
      },
      {
        name: "SUSHI/USDC",
        token0: "SUSHI",
        token1: "USDC",
        enabled: true, // ✅ SushiSwap / Stablecoin
      },
      {
        name: "BAL/WETH",
        token0: "BAL",
        token1: "WETH",
        enabled: true, // ✅ Balancer / ETH - Relevant for Balancer DEX
      },
      {
        name: "BAL/USDC",
        token0: "BAL",
        token1: "USDC",
        enabled: true, // ✅ Balancer token / Stablecoin (DeFi token, not stablecoin-vs-stablecoin)
      },
      {
        name: "FRAX/USDC",
        token0: "FRAX",
        token1: "USDC",
        enabled: false, // ❌ DISABLED - Stablecoin vs Stablecoin (not wanted)
      },
      {
        name: "FRAX/DAI",
        token0: "FRAX",
        token1: "DAI",
        enabled: false, // ❌ DISABLED - Stablecoin vs Stablecoin (not wanted)
      },
      {
        name: "MAI/DAI",
        token0: "MAI",
        token1: "DAI",
        enabled: false, // ❌ DISABLED - Stablecoin vs Stablecoin (not wanted)
      },
      {
        name: "WMATIC/FRAX",
        token0: "WMATIC",
        token1: "FRAX",
        enabled: true, // ✅ WMATIC / Frax
      },
    ],

    // ============================================================================
    // BSC TRADING PAIRS (BSC Mainnet - Chain ID 56)
    // ============================================================================
    watchedPairsBSC: [
      // === TIER 1: BNB PAIRS (Highest Volume) ===
      // ❌ EXCLUDED per user request: WBNB vs Stablecoins
      {
        name: "WBNB/USDT",
        token0: "WBNB",
        token1: "USDT",
        enabled: false, // ❌ DISABLED - Native vs Stablecoin (user excluded)
      },
      {
        name: "WBNB/BUSD",
        token0: "WBNB",
        token1: "BUSD",
        enabled: false, // ❌ DISABLED - Native vs Stablecoin (user excluded)
      },
      {
        name: "WBNB/USDC",
        token0: "WBNB",
        token1: "USDC",
        enabled: false, // ❌ DISABLED - Native vs Stablecoin (user excluded)
      },
      {
        name: "WBNB/WETH",
        token0: "WBNB",
        token1: "WETH",
        enabled: false, // ❌ DISABLED - WBNB vs top 5 coin (ETH)
      },
      {
        name: "WBNB/BTCB",
        token0: "WBNB",
        token1: "BTCB",
        enabled: false, // ❌ DISABLED - WBNB vs top 5 coin (Bitcoin)
      },
      
      // === TIER 2: MAJOR CRYPTO PAIRS ===
      {
        name: "WETH/USDT",
        token0: "WETH",
        token1: "USDT",
        enabled: false, // ❌ DISABLED - WETH vs stablecoin (user excluded)
      },
      {
        name: "WETH/BUSD",
        token0: "WETH",
        token1: "BUSD",
        enabled: false, // ❌ DISABLED - WETH vs stablecoin (user excluded)
      },
      {
        name: "BTCB/USDT",
        token0: "BTCB",
        token1: "USDT",
        enabled: false, // ❌ DISABLED - BTCB vs stablecoin (user excluded)
      },
      {
        name: "BTCB/BUSD",
        token0: "BTCB",
        token1: "BUSD",
        enabled: false, // ❌ DISABLED - BTCB vs stablecoin (user excluded)
      },
      
      // === TIER 3: DEFI TOKEN PAIRS ===
      {
        name: "CAKE/WBNB",
        token0: "CAKE",
        token1: "WBNB",
        enabled: true, // ✅ PancakeSwap / BNB - Very active
      },
      {
        name: "CAKE/USDT",
        token0: "CAKE",
        token1: "USDT",
        enabled: true, // ✅ PancakeSwap / USDT
      },
      {
        name: "BANANA/WBNB",
        token0: "BANANA",
        token1: "WBNB",
        enabled: true, // ✅ ApeSwap / BNB
      },
      {
        name: "UNI/WBNB",
        token0: "UNI",
        token1: "WBNB",
        enabled: true, // ✅ Uniswap / BNB
      },
      {
        name: "LINK/WBNB",
        token0: "LINK",
        token1: "WBNB",
        enabled: true, // ✅ Chainlink / BNB
      },
      {
        name: "AAVE/WBNB",
        token0: "AAVE",
        token1: "WBNB",
        enabled: true, // ✅ Aave / BNB
      },
      
      // === TIER 4: GAMING TOKENS ===
      {
        name: "AXS/WBNB",
        token0: "AXS",
        token1: "WBNB",
        enabled: true, // ✅ Axie Infinity / BNB
      },
      {
        name: "GALA/WBNB",
        token0: "GALA",
        token1: "WBNB",
        enabled: true, // ✅ Gala Games / BNB
      },
      
      // === TIER 5: LAYER 1 TOKENS ===
      {
        name: "ADA/WBNB",
        token0: "ADA",
        token1: "WBNB",
        enabled: true, // ✅ Cardano / BNB
      },
      {
        name: "DOT/WBNB",
        token0: "DOT",
        token1: "WBNB",
        enabled: true, // ✅ Polkadot / BNB
      },
      {
        name: "MATIC/WBNB",
        token0: "MATIC",
        token1: "WBNB",
        enabled: true, // ✅ Polygon / BNB
      },
      
      // === NO STABLECOIN-VS-STABLECOIN PAIRS ===
      // User explicitly requested NO stablecoin-vs-stablecoin pairs
    ],

    // ============================================================================
    // BASE TRADING PAIRS (Base Mainnet - Chain ID 8453)
    // ============================================================================
    watchedPairsBase: [
      // === EXCLUSION STRATEGY (Following Polygon & BSC patterns) ===
      // ❌ NO WETH vs stablecoins (WETH/USDC, WETH/USDT, WETH/DAI)
      // ❌ NO WBTC vs stablecoins
      // ✅ YES DeFi tokens vs WETH
      // ✅ YES Base-native tokens
      // ✅ YES Emerging Base projects
      
      // === TIER 1: BASE-NATIVE TOKENS (High Priority) ===
      {
        name: "BSWAP/WETH",
        token0: "BSWAP",
        token1: "WETH",
        enabled: true, // ✅ BaseSwap token / ETH - Base-native DEX token
      },
      {
        name: "BSWAP/USDC",
        token0: "BSWAP",
        token1: "USDC",
        enabled: true, // ✅ BaseSwap / USDC - DeFi token vs stablecoin is OK
      },
      {
        name: "TOSHI/WETH",
        token0: "TOSHI",
        token1: "WETH",
        enabled: true, // ✅ Toshi / ETH - Base community token
      },
      {
        name: "TOSHI/USDC",
        token0: "TOSHI",
        token1: "USDC",
        enabled: true, // ✅ Toshi / USDC - Community token vs stablecoin
      },
      
      // === TIER 2: MAJOR DEFI TOKENS ===
      {
        name: "UNI/WETH",
        token0: "UNI",
        token1: "WETH",
        enabled: true, // ✅ Uniswap / ETH
      },
      {
        name: "UNI/USDC",
        token0: "UNI",
        token1: "USDC",
        enabled: true, // ✅ Uniswap / USDC
      },
      {
        name: "LINK/WETH",
        token0: "LINK",
        token1: "WETH",
        enabled: true, // ✅ Chainlink / ETH
      },
      {
        name: "LINK/USDC",
        token0: "LINK",
        token1: "USDC",
        enabled: true, // ✅ Chainlink / USDC
      },
      {
        name: "AAVE/WETH",
        token0: "AAVE",
        token1: "WETH",
        enabled: true, // ✅ Aave / ETH
      },
      {
        name: "SUSHI/WETH",
        token0: "SUSHI",
        token1: "WETH",
        enabled: true, // ✅ SushiSwap / ETH
      },
      
      // === TIER 3: WBTC PAIRS (Bitcoin on Base) ===
      {
        name: "WBTC/WETH",
        token0: "WBTC",
        token1: "WETH",
        enabled: true, // ✅ Bitcoin / ETH - Major pair
      },
      {
        name: "WBTC/USDC",
        token0: "WBTC",
        token1: "USDC",
        enabled: false, // ❌ DISABLED - Major coin vs stablecoin (following BSC strategy)
      },
      
      // === EXCLUDED PAIRS (Following strategy) ===
      // ❌ WETH/USDC - Native vs stablecoin
      // ❌ WETH/USDT - Native vs stablecoin
      // ❌ WETH/DAI - Native vs stablecoin
      // ❌ NO stablecoin-vs-stablecoin pairs
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
