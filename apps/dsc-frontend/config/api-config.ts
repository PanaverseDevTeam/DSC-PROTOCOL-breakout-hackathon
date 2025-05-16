// api.config.ts
// --------------------------------------------------------
// API Configuration for Stable Token Frontend
// --------------------------------------------------------

type ApiEnvironment = {
  baseUrl: string
  endpoints: {
    wallet: {
      save: string
    }
    tokens: {
      approve: string
      mintWBTC: string
      mintWETH: string
    }
    collateral: {
      deposit: string
      redeem: string
      depositAndMint: string
      redeemForDSC: string
    }
    dsc: {
      mint: string
      burn: string
    }
    liquidation: string
    readOnly: {
      accountInfo: string
      collateralBalance: string
      healthFactor: string
      collateralTokens: string
      usdValue: string
    }
  }
  contracts: {
    DSC_ENGINE: string
    WBTC: string
    WETH: string
    DSC: string
  }
  network: {
    rpcUrl: string
    chainId: string
    explorerUrl: string
  }
}

// Load from .env or fallback to defaults
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export const API_CONFIG: ApiEnvironment = {
  baseUrl,

  endpoints: {
    wallet: {
      save: "/save-wallet",
    },

    tokens: {
      approve: "/approve-tokens",
      mintWBTC: "/mint-wbtc",
      mintWETH: "/mint-weth",
    },

    collateral: {
      deposit: "/deposit-collateral",
      redeem: "/redeem-collateral",
      depositAndMint: "/deposit-collateral-and-mint-dsc",
      redeemForDSC: "/redeem-collateral-for-dsc",
    },

    dsc: {
      mint: "/mint-dsc",
      burn: "/burn-dsc",
    },

    liquidation: "/liquidate",

    readOnly: {
      accountInfo: "/account-information",
      collateralBalance: "/collateral-balance",
      healthFactor: "/health-factor",
      collateralTokens: "/collateral-tokens", // This endpoint should now accept POST requests
      usdValue: "/usd-value",
    },
  },

  contracts: {
    DSC_ENGINE: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    WBTC: process.env.NEXT_PUBLIC_WBTC_ADDRESS || "0x0000000000000000000000000000000000000000",
    WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x0000000000000000000000000000000000000000",
    DSC: process.env.NEXT_PUBLIC_DSC_ADDRESS || "0x0000000000000000000000000000000000000000",
  },

  network: {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "31337",
    explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://etherscan.io",
  },
}
