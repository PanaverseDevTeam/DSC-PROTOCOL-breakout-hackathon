// api.ts
// --------------------------------------------------------
// Stable Token API Service Layer - Clean, Typed, Scalable
// --------------------------------------------------------

import { API_CONFIG } from "@/config/api-config"
import Web3 from "web3"
import axios from "axios"
import getCollateralTokens from "@/app/actions/get-collateral-tokens"

// --------------------
// Types
// --------------------

interface TxResponse {
  txHash: string
}

interface AccountInfoResponse {
  totalDscMinted: string
  collateralValueUSD: string
}

interface BalanceResponse {
  balance: string
}

interface HealthFactorResponse {
  healthFactor: string
}

interface USDValueResponse {
  value: string
}

interface TokenInfo {
  address: string
  symbol: string
  name: string
}

// --------------------
// Safe Unified Request with Axios
// --------------------

const request = async <T = any>(endpoint: string, method: "GET" | "POST" = "POST", body?: any): Promise<T> => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`

  console.log(`API Request: ${method} ${url}`, body || {})

  try {
    let response

    if (method === "GET") {
      response = await axios.get(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    } else {
      response = await axios.post(url, body || {}, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    }

    // Log response status and headers for debugging
    console.log(`API Response Status: ${response.status}`)
    console.log(`API Response Content-Type:`, response.headers["content-type"])

    // Axios automatically throws errors for non-2xx responses
    // and automatically parses JSON, so we can just return the data
    return response.data
  } catch (err) {
    // Axios specific error handling
    if (axios.isAxiosError(err)) {
      console.error(`API request failed for ${url}:`, err)

      // Get response data if available
      const responseData = err.response?.data
      const statusCode = err.response?.status
      const errorMessage = responseData?.error || responseData?.message || err.message

      // Special handling for ngrok connection issues
      if (err.code === "ECONNABORTED" || err.message.includes("Network Error")) {
        throw new Error(
          `API connection failed. If using ngrok, check that your tunnel is active and the URL is correct.`,
        )
      }

      throw new Error(`API ${statusCode || "request"} failed: ${errorMessage}`)
    } else {
      // Generic error handling
      console.error(`API request failed for ${url}:`, err)
      throw new Error(`API request failed: ${(err as Error).message}`)
    }
  }
}

// --------------------
// API Methods
// --------------------

export const api = {
  // ✅ Wallet
  saveWallet: async (user: string) => request(API_CONFIG.endpoints.wallet.save, "POST", { user }),

  // ✅ Token Operations
  approveTokens: async (
    user: string,
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
  ): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.tokens.approve, "POST", {
      user,
      token_address: tokenAddress,
      spender_address: spenderAddress,
      amount,
    }).then((res) => ({ txHash: res.tx_hash })),

  mintTestWBTC: async (user: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.tokens.mintWBTC, "POST", { user, amount }).then((res) => ({ txHash: res.tx_hash })),

  mintTestWETH: async (user: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.tokens.mintWETH, "POST", { user, amount }).then((res) => ({ txHash: res.tx_hash })),

  // ✅ Collateral Management
  depositCollateral: async (user: string, token: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.collateral.deposit, "POST", {
      user,
      token_address: token,
      amount,
    }).then((res) => ({ txHash: res.tx_hash })),

  redeemCollateral: async (user: string, token: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.collateral.redeem, "POST", {
      user,
      token_address: token,
      amount,
    }).then((res) => ({ txHash: res.tx_hash })),

  depositAndMint: async (user: string, token: string, depositAmount: string, mintAmount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.collateral.depositAndMint, "POST", {
      user,
      token_address: token,
      amount: depositAmount,
      amount_dsc_to_mint: mintAmount,
    }).then((res) => ({ txHash: res.tx_hash })),

  redeemForDSC: async (user: string, token: string, amount: string, burnAmount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.collateral.redeemForDSC, "POST", {
      user,
      token_address: token,
      amount,
      amount_dsc_to_burn: burnAmount,
    }).then((res) => ({ txHash: res.tx_hash })),

  // ✅ DSC Operations
  mintDSC: async (user: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.dsc.mint, "POST", { user, amount }).then((res) => ({ txHash: res.tx_hash })),

  burnDSC: async (user: string, amount: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.dsc.burn, "POST", { user, amount }).then((res) => ({ txHash: res.tx_hash })),

  // ✅ Liquidation
  liquidate: async (user: string, collateral: string, debtToCover: string): Promise<TxResponse> =>
    request(API_CONFIG.endpoints.liquidation, "POST", {
      user,
      collateral,
      debt_to_cover: debtToCover,
    }).then((res) => ({ txHash: res.tx_hash })),

  // ✅ Read-Only Queries - Now all using axios
  getAccountInfo: async (user: string): Promise<AccountInfoResponse> =>
    request(API_CONFIG.endpoints.readOnly.accountInfo, "POST", { user }).then((res) => ({
      totalDscMinted: res.total_dsc_minted,
      collateralValueUSD: res.collateral_value_in_usd,
    })),

  getCollateralBalance: async (user: string, token: string): Promise<BalanceResponse> =>
    request(API_CONFIG.endpoints.readOnly.collateralBalance, "POST", { user, token }),

  getHealthFactor: async (user: string): Promise<HealthFactorResponse> =>
    request(API_CONFIG.endpoints.readOnly.healthFactor, "POST", { user }),

  getUSDValue: async (user: string, token: string): Promise<USDValueResponse> =>
    request(API_CONFIG.endpoints.readOnly.usdValue, "POST", { user, token }).then((res) => ({ value: res.usd_value })),

  // Using the server action for collateral tokens as specified
  getCollateralTokens: async (): Promise<{ tokens: TokenInfo[] }> => {
    try {
      console.log("Fetching collateral tokens using server action...")
      const data = await getCollateralTokens()
      console.log("Collateral tokens response from server action:", data)

      const tokens: TokenInfo[] = data.collateral_tokens.map((address: string) => {
        let symbol = "UNKNOWN",
          name = "Unknown Token"

        if (address.toLowerCase() === API_CONFIG.contracts.WBTC.toLowerCase()) {
          symbol = "WBTC"
          name = "Wrapped Bitcoin"
        } else if (address.toLowerCase() === API_CONFIG.contracts.WETH.toLowerCase()) {
          symbol = "WETH"
          name = "Wrapped Ether"
        }

        return { address, symbol, name }
      })

      return { tokens }
    } catch (error) {
      console.error("Failed to fetch collateral tokens from server action:", error)

      // Fallback to hardcoded tokens if server action fails
      console.log("Using hardcoded collateral tokens as fallback")

      // Hardcoded default tokens based on environment variables
      const tokens: TokenInfo[] = [
        {
          address: API_CONFIG.contracts.WBTC,
          symbol: "WBTC",
          name: "Wrapped Bitcoin",
        },
        {
          address: API_CONFIG.contracts.WETH,
          symbol: "WETH",
          name: "Wrapped Ether",
        },
      ]

      return { tokens }
    }
  },
}

// --------------------
// Web3 Helpers
// --------------------

const web3 = new Web3()

export const toWei = (amount: string, unit = "ether") => web3.utils.toWei(amount, unit as any)

export const fromWei = (amount: string, unit = "ether") => web3.utils.fromWei(amount, unit as any)

export const formatAddress = (address: string) =>
  `${address.substring(0, 6)}...${address.substring(address.length - 4)}`

export const getExplorerUrl = (txHash: string) => `${API_CONFIG.network.explorerUrl}/tx/${txHash}`

export const DSC_ENGINE_ADDRESS = API_CONFIG.contracts.DSC_ENGINE
