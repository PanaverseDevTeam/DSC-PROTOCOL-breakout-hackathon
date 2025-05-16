"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import Web3 from "web3"
import { useToast } from "@/components/ui/use-toast"
import { api, formatAddress } from "@/services/api"
import { API_CONFIG } from "@/config/api-config"

interface WalletContextType {
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  web3: Web3 | null
  accountInfo: AccountInfo | null
  isLoading: boolean
  refreshAccountInfo: () => Promise<void>
  apiError: string | null
}

interface AccountInfo {
  totalDscMinted: string
  collateralValueUSD: string
  healthFactor: string
  collateralTokens: CollateralToken[]
}

interface CollateralToken {
  address: string
  symbol: string
  name: string
  balance: string
  usdValue: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize web3 when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Create Web3 instance with the RPC URL from config
      const web3Instance = new Web3(window.ethereum)
      setWeb3(web3Instance)

      // Check if we have a stored address in localStorage
      const storedAddress = localStorage.getItem("walletAddress")
      if (storedAddress) {
        setAddress(storedAddress)
        setIsConnected(true)
        fetchAccountInfo(storedAddress)
      }

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          handleDisconnect()
        } else {
          // User switched accounts
          handleAccountChange(accounts[0])
        }
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        // Reload the page when the chain changes
        window.location.reload()
      })
    }

    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  // Update the fetchAccountInfo function to handle hardcoded tokens

  const fetchAccountInfo = async (walletAddress: string) => {
    if (!walletAddress) return

    setIsLoading(true)
    setApiError(null)

    try {
      console.log("Fetching account information for:", walletAddress)

      // Get collateral tokens first - now using hardcoded values if API fails
      let tokensData
      try {
        tokensData = await api.getCollateralTokens()
        console.log("Tokens data received:", tokensData)

        if (!tokensData.tokens || tokensData.tokens.length === 0) {
          throw new Error("No collateral tokens found. Please check your backend configuration.")
        }
      } catch (error: any) {
        console.error("Error fetching collateral tokens:", error)
        throw new Error(`Failed to fetch collateral tokens: ${error.message}`)
      }

      // Get account information
      let accountData
      try {
        accountData = await api.getAccountInfo(walletAddress)
        console.log("Account data received:", accountData)
      } catch (error: any) {
        console.error("Error fetching account info:", error)
        throw new Error(`Failed to fetch account information: ${error.message}`)
      }

      // Get health factor
      let healthData
      try {
        healthData = await api.getHealthFactor(walletAddress)
        console.log("Health factor data received:", healthData)
      } catch (error: any) {
        console.error("Error fetching health factor:", error)
        throw new Error(`Failed to fetch health factor: ${error.message}`)
      }

      // For each token, get balance and USD value
      const collateralTokens = await Promise.all(
        tokensData.tokens.map(async (token: any) => {
          try {
            const balanceData = await api.getCollateralBalance(walletAddress, token.address)
            const usdValueData = await api.getUSDValue(walletAddress, token.address)

            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: balanceData.balance,
              usdValue: usdValueData.value,
            }
          } catch (error) {
            console.error(`Error fetching data for token ${token.symbol}:`, error)
            // Return token with zero balance/value instead of failing
            return {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              balance: "0",
              usdValue: "0",
            }
          }
        }),
      )

      setAccountInfo({
        totalDscMinted: accountData.totalDscMinted,
        collateralValueUSD: accountData.collateralValueUSD,
        healthFactor: healthData.healthFactor,
        collateralTokens,
      })
    } catch (error: any) {
      console.error("Error fetching account info:", error)

      // Set the API error message
      setApiError(error.message || "Failed to fetch account information")

      toast({
        title: "API Error",
        description: error.message || "Failed to fetch account information. Please check your API configuration.",
        variant: "destructive",
      })

      // Set default account info to prevent UI errors
      setAccountInfo({
        totalDscMinted: "0",
        collateralValueUSD: "0",
        healthFactor: "0",
        collateralTokens: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle account change
  const handleAccountChange = async (newAddress: string) => {
    setAddress(newAddress)
    localStorage.setItem("walletAddress", newAddress)
    setIsConnected(true)

    // Just fetch account information for the new address
    try {
      await fetchAccountInfo(newAddress)
    } catch (error) {
      console.error("Failed to fetch account information:", error)
      toast({
        title: "Error",
        description: "Failed to fetch account information. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    if (!web3) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask extension and refresh the page.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const account = accounts[0]

      // Check if we're on the correct network (Base Sepolia)
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      if (chainId !== "0x14a34") {
        // 0x14a34 is 84532 in hex (Base Sepolia)
        try {
          // Try to switch to Base Sepolia
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x14a34" }],
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x14a34",
                    chainName: "Base Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: [API_CONFIG.network.rpcUrl],
                    blockExplorerUrls: [API_CONFIG.network.explorerUrl],
                  },
                ],
              })
            } catch (addError) {
              console.error("Error adding Base Sepolia network:", addError)
              toast({
                title: "Network Error",
                description: "Failed to add Base Sepolia network. Please add it manually in MetaMask.",
                variant: "destructive",
              })
              setIsConnecting(false)
              return
            }
          } else {
            console.error("Error switching to Base Sepolia network:", switchError)
            toast({
              title: "Network Error",
              description: "Failed to switch to Base Sepolia network. Please switch manually in MetaMask.",
              variant: "destructive",
            })
            setIsConnecting(false)
            return
          }
        }
      }

      // Save the address
      setAddress(account)
      localStorage.setItem("walletAddress", account)
      setIsConnected(true)

      // Fetch account information
      await fetchAccountInfo(account)

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to MetaMask. Address: ${formatAddress(account)}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const handleDisconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setAccountInfo(null)
    setApiError(null)
    localStorage.removeItem("walletAddress")
  }

  const disconnectWallet = () => {
    handleDisconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      variant: "default",
    })
  }

  // Refresh account information
  const refreshAccountInfo = async () => {
    if (address) {
      await fetchAccountInfo(address)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        web3,
        accountInfo,
        isLoading,
        refreshAccountInfo,
        apiError,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
