
🚀 Generating trading pairs for top 100 tokens...
📊 Base currencies: WMATIC, USDC, WETH, USDT

✅ Generated 294 trading pairs

📋 Summary by tier:
   - Tier 1 (Core):       6 pairs
   - Tier 2 (Major DeFi): 56 pairs
   - Tier 3 (Additional): 232 pairs
   - Tier 4 (Cross):      0 pairs
   - Total enabled:       294 pairs

💡 Copy this configuration to src/config.ts:

────────────────────────────────────────────────────────────────────────────────
    watchedPairs: [
      {
        name: "WBTC/WMATIC",
        token0: "WBTC",
        token1: "WMATIC",
        enabled: true , // ⭐⭐⭐
      },
      {
        name: "WBTC/USDC",
        token0: "WBTC",
        token1: "USDC",
        enabled: true , // ⭐⭐⭐
      },
      {
        name: "WBTC/WETH",
        token0: "WBTC",
        token1: "WETH",
        enabled: true , // ⭐⭐⭐
      },
      {
        name: "WBTC/USDT",
        token0: "WBTC",
        token1: "USDT",
        enabled: true , // ⭐⭐⭐
      },
      {
        name: "DAI/WMATIC",
        token0: "DAI",
        token1: "WMATIC",
        enabled: true , // ⭐⭐⭐
      },
      {
        name: "DAI/WETH",
        token0: "DAI",
        token1: "WETH",
        enabled: true , // ⭐⭐⭐
      },

      // === TIER 2: MAJOR DEFI (High Priority) ===
      {
        name: "LINK/WMATIC",
        token0: "LINK",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "LINK/USDC",
        token0: "LINK",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "LINK/WETH",
        token0: "LINK",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "LINK/USDT",
        token0: "LINK",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "AAVE/WMATIC",
        token0: "AAVE",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "AAVE/USDC",
        token0: "AAVE",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "AAVE/WETH",
        token0: "AAVE",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "AAVE/USDT",
        token0: "AAVE",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "UNI/WMATIC",
        token0: "UNI",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "UNI/USDC",
        token0: "UNI",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "UNI/WETH",
        token0: "UNI",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "UNI/USDT",
        token0: "UNI",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "CRV/WMATIC",
        token0: "CRV",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "CRV/USDC",
        token0: "CRV",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "CRV/WETH",
        token0: "CRV",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "CRV/USDT",
        token0: "CRV",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "SUSHI/WMATIC",
        token0: "SUSHI",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SUSHI/USDC",
        token0: "SUSHI",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SUSHI/WETH",
        token0: "SUSHI",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "SUSHI/USDT",
        token0: "SUSHI",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "BAL/WMATIC",
        token0: "BAL",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "BAL/USDC",
        token0: "BAL",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "BAL/WETH",
        token0: "BAL",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "BAL/USDT",
        token0: "BAL",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "COMP/WMATIC",
        token0: "COMP",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "COMP/USDC",
        token0: "COMP",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "COMP/WETH",
        token0: "COMP",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "COMP/USDT",
        token0: "COMP",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "MKR/WMATIC",
        token0: "MKR",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "MKR/USDC",
        token0: "MKR",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "MKR/WETH",
        token0: "MKR",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "MKR/USDT",
        token0: "MKR",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "SNX/WMATIC",
        token0: "SNX",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SNX/USDC",
        token0: "SNX",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SNX/WETH",
        token0: "SNX",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "SNX/USDT",
        token0: "SNX",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "YFI/WMATIC",
        token0: "YFI",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "YFI/USDC",
        token0: "YFI",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "YFI/WETH",
        token0: "YFI",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "YFI/USDT",
        token0: "YFI",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "SAND/WMATIC",
        token0: "SAND",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SAND/USDC",
        token0: "SAND",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "SAND/WETH",
        token0: "SAND",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "SAND/USDT",
        token0: "SAND",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "MANA/WMATIC",
        token0: "MANA",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "MANA/USDC",
        token0: "MANA",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "MANA/WETH",
        token0: "MANA",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "MANA/USDT",
        token0: "MANA",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "GHST/WMATIC",
        token0: "GHST",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "GHST/USDC",
        token0: "GHST",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "GHST/WETH",
        token0: "GHST",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "GHST/USDT",
        token0: "GHST",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },
      {
        name: "POL/WMATIC",
        token0: "POL",
        token1: "WMATIC",
        enabled: true , // ⭐⭐
      },
      {
        name: "POL/USDC",
        token0: "POL",
        token1: "USDC",
        enabled: true , // ⭐⭐
      },
      {
        name: "POL/WETH",
        token0: "POL",
        token1: "WETH",
        enabled: true , // ⭐⭐
      },
      {
        name: "POL/USDT",
        token0: "POL",
        token1: "USDT",
        enabled: true , // ⭐⭐
      },

      // === TIER 3: ADDITIONAL TOKENS (Medium Priority) ===
      {
        name: "BNB/WMATIC",
        token0: "BNB",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "BNB/USDC",
        token0: "BNB",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "BNB/WETH",
        token0: "BNB",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "BNB/USDT",
        token0: "BNB",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "FTM/WMATIC",
        token0: "FTM",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "FTM/USDC",
        token0: "FTM",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "FTM/WETH",
        token0: "FTM",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "FTM/USDT",
        token0: "FTM",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "AVAX/WMATIC",
        token0: "AVAX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "AVAX/USDC",
        token0: "AVAX",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "AVAX/WETH",
        token0: "AVAX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "AVAX/USDT",
        token0: "AVAX",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "QUICK/WMATIC",
        token0: "QUICK",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "QUICK/USDC",
        token0: "QUICK",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "QUICK/WETH",
        token0: "QUICK",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "QUICK/USDT",
        token0: "QUICK",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "DYST/WMATIC",
        token0: "DYST",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "DYST/USDC",
        token0: "DYST",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "DYST/WETH",
        token0: "DYST",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "DYST/USDT",
        token0: "DYST",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "AXS/WMATIC",
        token0: "AXS",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "AXS/USDC",
        token0: "AXS",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "AXS/WETH",
        token0: "AXS",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "AXS/USDT",
        token0: "AXS",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "GALA/WMATIC",
        token0: "GALA",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "GALA/USDC",
        token0: "GALA",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "GALA/WETH",
        token0: "GALA",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "GALA/USDT",
        token0: "GALA",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "IMX/WMATIC",
        token0: "IMX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "IMX/USDC",
        token0: "IMX",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "IMX/WETH",
        token0: "IMX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "IMX/USDT",
        token0: "IMX",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "REVV/WMATIC",
        token0: "REVV",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "REVV/USDC",
        token0: "REVV",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "REVV/WETH",
        token0: "REVV",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "REVV/USDT",
        token0: "REVV",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ENJ/WMATIC",
        token0: "ENJ",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ENJ/USDC",
        token0: "ENJ",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ENJ/WETH",
        token0: "ENJ",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ENJ/USDT",
        token0: "ENJ",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ALICE/WMATIC",
        token0: "ALICE",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ALICE/USDC",
        token0: "ALICE",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ALICE/WETH",
        token0: "ALICE",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ALICE/USDT",
        token0: "ALICE",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "API3/WMATIC",
        token0: "API3",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "API3/USDC",
        token0: "API3",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "API3/WETH",
        token0: "API3",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "API3/USDT",
        token0: "API3",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "BAND/WMATIC",
        token0: "BAND",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "BAND/USDC",
        token0: "BAND",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "BAND/WETH",
        token0: "BAND",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "BAND/USDT",
        token0: "BAND",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "GRT/WMATIC",
        token0: "GRT",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "GRT/USDC",
        token0: "GRT",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "GRT/WETH",
        token0: "GRT",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "GRT/USDT",
        token0: "GRT",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "USDD/WMATIC",
        token0: "USDD",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "USDD/WETH",
        token0: "USDD",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "TUSD/WMATIC",
        token0: "TUSD",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "TUSD/WETH",
        token0: "TUSD",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "FRAX/WMATIC",
        token0: "FRAX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "FRAX/WETH",
        token0: "FRAX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "MAI/WMATIC",
        token0: "MAI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "MAI/WETH",
        token0: "MAI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "QI/WMATIC",
        token0: "QI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "QI/USDC",
        token0: "QI",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "QI/WETH",
        token0: "QI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "QI/USDT",
        token0: "QI",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "DQUICK/WMATIC",
        token0: "DQUICK",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "DQUICK/USDC",
        token0: "DQUICK",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "DQUICK/WETH",
        token0: "DQUICK",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "DQUICK/USDT",
        token0: "DQUICK",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "CEL/WMATIC",
        token0: "CEL",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "CEL/USDC",
        token0: "CEL",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "CEL/WETH",
        token0: "CEL",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "CEL/USDT",
        token0: "CEL",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "sUSD/WMATIC",
        token0: "sUSD",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "sUSD/USDC",
        token0: "sUSD",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "sUSD/WETH",
        token0: "sUSD",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "sUSD/USDT",
        token0: "sUSD",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "sBTC/WMATIC",
        token0: "sBTC",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "sBTC/USDC",
        token0: "sBTC",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "sBTC/WETH",
        token0: "sBTC",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "sBTC/USDT",
        token0: "sBTC",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "sETH/WMATIC",
        token0: "sETH",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "sETH/USDC",
        token0: "sETH",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "sETH/WETH",
        token0: "sETH",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "sETH/USDT",
        token0: "sETH",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ZRX/WMATIC",
        token0: "ZRX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ZRX/USDC",
        token0: "ZRX",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ZRX/WETH",
        token0: "ZRX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ZRX/USDT",
        token0: "ZRX",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "LRC/WMATIC",
        token0: "LRC",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "LRC/USDC",
        token0: "LRC",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "LRC/WETH",
        token0: "LRC",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "LRC/USDT",
        token0: "LRC",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "CVX/WMATIC",
        token0: "CVX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "CVX/USDC",
        token0: "CVX",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "CVX/WETH",
        token0: "CVX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "CVX/USDT",
        token0: "CVX",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "BIFI/WMATIC",
        token0: "BIFI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "BIFI/USDC",
        token0: "BIFI",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "BIFI/WETH",
        token0: "BIFI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "BIFI/USDT",
        token0: "BIFI",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "RNDR/WMATIC",
        token0: "RNDR",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "RNDR/USDC",
        token0: "RNDR",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "RNDR/WETH",
        token0: "RNDR",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "RNDR/USDT",
        token0: "RNDR",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "INJ/WMATIC",
        token0: "INJ",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "INJ/USDC",
        token0: "INJ",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "INJ/WETH",
        token0: "INJ",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "INJ/USDT",
        token0: "INJ",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "RARI/WMATIC",
        token0: "RARI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "RARI/USDC",
        token0: "RARI",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "RARI/WETH",
        token0: "RARI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "RARI/USDT",
        token0: "RARI",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "PAXG/WMATIC",
        token0: "PAXG",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "PAXG/USDC",
        token0: "PAXG",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "PAXG/WETH",
        token0: "PAXG",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "PAXG/USDT",
        token0: "PAXG",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "DPI/WMATIC",
        token0: "DPI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "DPI/USDC",
        token0: "DPI",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "DPI/WETH",
        token0: "DPI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "DPI/USDT",
        token0: "DPI",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "AMPL/WMATIC",
        token0: "AMPL",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "AMPL/USDC",
        token0: "AMPL",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "AMPL/WETH",
        token0: "AMPL",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "AMPL/USDT",
        token0: "AMPL",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "RAI/WMATIC",
        token0: "RAI",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "RAI/USDC",
        token0: "RAI",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "RAI/WETH",
        token0: "RAI",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "RAI/USDT",
        token0: "RAI",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "NEXO/WMATIC",
        token0: "NEXO",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "NEXO/USDC",
        token0: "NEXO",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "NEXO/WETH",
        token0: "NEXO",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "NEXO/USDT",
        token0: "NEXO",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "COVER/WMATIC",
        token0: "COVER",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "COVER/USDC",
        token0: "COVER",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "COVER/WETH",
        token0: "COVER",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "COVER/USDT",
        token0: "COVER",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "TEL/WMATIC",
        token0: "TEL",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "TEL/USDC",
        token0: "TEL",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "TEL/WETH",
        token0: "TEL",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "TEL/USDT",
        token0: "TEL",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "CELR/WMATIC",
        token0: "CELR",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "CELR/USDC",
        token0: "CELR",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "CELR/WETH",
        token0: "CELR",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "CELR/USDT",
        token0: "CELR",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "WOO/WMATIC",
        token0: "WOO",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "WOO/USDC",
        token0: "WOO",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "WOO/WETH",
        token0: "WOO",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "WOO/USDT",
        token0: "WOO",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "OM/WMATIC",
        token0: "OM",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "OM/USDC",
        token0: "OM",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "OM/WETH",
        token0: "OM",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "OM/USDT",
        token0: "OM",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ELON/WMATIC",
        token0: "ELON",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ELON/USDC",
        token0: "ELON",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ELON/WETH",
        token0: "ELON",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ELON/USDT",
        token0: "ELON",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "SHIB/WMATIC",
        token0: "SHIB",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "SHIB/USDC",
        token0: "SHIB",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "SHIB/WETH",
        token0: "SHIB",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "SHIB/USDT",
        token0: "SHIB",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "FET/WMATIC",
        token0: "FET",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "FET/USDC",
        token0: "FET",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "FET/WETH",
        token0: "FET",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "FET/USDT",
        token0: "FET",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "OCEAN/WMATIC",
        token0: "OCEAN",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "OCEAN/USDC",
        token0: "OCEAN",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "OCEAN/WETH",
        token0: "OCEAN",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "OCEAN/USDT",
        token0: "OCEAN",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "LDO/WMATIC",
        token0: "LDO",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "LDO/USDC",
        token0: "LDO",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "LDO/WETH",
        token0: "LDO",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "LDO/USDT",
        token0: "LDO",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "RPL/WMATIC",
        token0: "RPL",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "RPL/USDC",
        token0: "RPL",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "RPL/WETH",
        token0: "RPL",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "RPL/USDT",
        token0: "RPL",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "EURS/WMATIC",
        token0: "EURS",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "EURS/USDC",
        token0: "EURS",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "EURS/WETH",
        token0: "EURS",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "EURS/USDT",
        token0: "EURS",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "AGEUR/WMATIC",
        token0: "AGEUR",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "AGEUR/USDC",
        token0: "AGEUR",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "AGEUR/WETH",
        token0: "AGEUR",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "AGEUR/USDT",
        token0: "AGEUR",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "jEUR/WMATIC",
        token0: "jEUR",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "jEUR/USDC",
        token0: "jEUR",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "jEUR/WETH",
        token0: "jEUR",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "jEUR/USDT",
        token0: "jEUR",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "MIMATIC/WMATIC",
        token0: "MIMATIC",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "MIMATIC/USDC",
        token0: "MIMATIC",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "MIMATIC/WETH",
        token0: "MIMATIC",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "MIMATIC/USDT",
        token0: "MIMATIC",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ANKR/WMATIC",
        token0: "ANKR",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ANKR/USDC",
        token0: "ANKR",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ANKR/WETH",
        token0: "ANKR",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ANKR/USDT",
        token0: "ANKR",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ALCX/WMATIC",
        token0: "ALCX",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ALCX/USDC",
        token0: "ALCX",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ALCX/WETH",
        token0: "ALCX",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ALCX/USDT",
        token0: "ALCX",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "ALPHA/WMATIC",
        token0: "ALPHA",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "ALPHA/USDC",
        token0: "ALPHA",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "ALPHA/WETH",
        token0: "ALPHA",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "ALPHA/USDT",
        token0: "ALPHA",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "PERP/WMATIC",
        token0: "PERP",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "PERP/USDC",
        token0: "PERP",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "PERP/WETH",
        token0: "PERP",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "PERP/USDT",
        token0: "PERP",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "TRIBE/WMATIC",
        token0: "TRIBE",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "TRIBE/USDC",
        token0: "TRIBE",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "TRIBE/WETH",
        token0: "TRIBE",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "TRIBE/USDT",
        token0: "TRIBE",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "RUNE/WMATIC",
        token0: "RUNE",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "RUNE/USDC",
        token0: "RUNE",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "RUNE/WETH",
        token0: "RUNE",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "RUNE/USDT",
        token0: "RUNE",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "WBNB/WMATIC",
        token0: "WBNB",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "WBNB/USDC",
        token0: "WBNB",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "WBNB/WETH",
        token0: "WBNB",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "WBNB/USDT",
        token0: "WBNB",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "WFTM/WMATIC",
        token0: "WFTM",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "WFTM/USDC",
        token0: "WFTM",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "WFTM/WETH",
        token0: "WFTM",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "WFTM/USDT",
        token0: "WFTM",
        token1: "USDT",
        enabled: true , // ⭐
      },
      {
        name: "renBTC/WMATIC",
        token0: "renBTC",
        token1: "WMATIC",
        enabled: true , // ⭐
      },
      {
        name: "renBTC/USDC",
        token0: "renBTC",
        token1: "USDC",
        enabled: true , // ⭐
      },
      {
        name: "renBTC/WETH",
        token0: "renBTC",
        token1: "WETH",
        enabled: true , // ⭐
      },
      {
        name: "renBTC/USDT",
        token0: "renBTC",
        token1: "USDT",
        enabled: true , // ⭐
      },
    ],

────────────────────────────────────────────────────────────────────────────────

📝 Next steps:
   1. Copy the watchedPairs array above
   2. Replace the watchedPairs in src/config.ts
   3. Run: npm run bot (dry run mode)
   4. Monitor for 24 hours
   5. Enable live trading when ready

⚙️  Options:
   --top=50    Generate pairs for top 50 tokens
   --top=100   Generate pairs for all 100 tokens

