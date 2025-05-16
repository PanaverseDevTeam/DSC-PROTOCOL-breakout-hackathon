// services/config.ts
// This file is created to avoid circular dependencies and to support dynamic API URL changes

// Try to get the API URL from localStorage first (for dynamic changes)
let baseUrl = ""
if (typeof window !== "undefined") {
  baseUrl = localStorage.getItem("api_base_url") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
} else {
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
}

export const API_CONFIG = {
  baseUrl,
  network: {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "31337",
    explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://etherscan.io",
  },
  contracts: {
    DSC_ENGINE: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    WBTC: process.env.NEXT_PUBLIC_WBTC_ADDRESS || "0x0000000000000000000000000000000000000000",
    WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x0000000000000000000000000000000000000000",
    DSC: process.env.NEXT_PUBLIC_DSC_ADDRESS || "0x0000000000000000000000000000000000000000",
  },
}
