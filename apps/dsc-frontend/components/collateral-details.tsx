"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { fromWei } from "@/services/api"
import { API_CONFIG } from "@/config/api-config"
import getCollateralTokens from "@/app/actions/get-collateral-tokens"
import getCollateralBalance from "@/app/actions/get-collateral-balance"
import getUsdValue from "@/app/actions/get-usd-value"

interface CollateralDetail {
  token: {
    address: string
    symbol: string
    name: string
  }
  balance: string
  usdValue: string
}

export function CollateralDetails() {
  const { address, isConnected } = useWallet()
  const [collateralDetails, setCollateralDetails] = useState<CollateralDetail[]>([])
  const [totalUsdValue, setTotalUsdValue] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCollateralDetails = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // Get available tokens first using the server action
      const tokensResponse = await getCollateralTokens()

      if (!tokensResponse.collateral_tokens || tokensResponse.collateral_tokens.length === 0) {
        throw new Error("No collateral tokens found")
      }

      // Process tokens to get symbol and name
      const tokens = tokensResponse.collateral_tokens.map((tokenAddress: string) => {
        let symbol = "UNKNOWN",
          name = "Unknown Token"

        if (tokenAddress.toLowerCase() === API_CONFIG.contracts.WBTC.toLowerCase()) {
          symbol = "WBTC"
          name = "Wrapped Bitcoin"
        } else if (tokenAddress.toLowerCase() === API_CONFIG.contracts.WETH.toLowerCase()) {
          symbol = "WETH"
          name = "Wrapped Ether"
        }

        return { address: tokenAddress, symbol, name }
      })

      // Fetch balance and USD value for each token using server actions
      const details = await Promise.all(
        tokens.map(async (token) => {
          try {
            const balanceResponse = await getCollateralBalance(address, token.address)
            const usdValueResponse = await getUsdValue(address, token.address)

            return {
              token,
              balance: balanceResponse.balance,
              usdValue: usdValueResponse.value,
            }
          } catch (err) {
            console.error(`Error fetching details for token ${token.symbol}:`, err)
            return {
              token,
              balance: "0",
              usdValue: "0",
            }
          }
        }),
      )

      setCollateralDetails(details)

      // Calculate total USD value from individual token values
      const calculatedTotal = details
        .reduce((sum, detail) => {
          const valueInEther = fromWei(detail.usdValue || "0")
          return sum + Number.parseFloat(valueInEther)
        }, 0)
        .toString()

      // Convert back to wei for consistency
      const totalInWei = (calculatedTotal * 10 ** 18).toString()
      setTotalUsdValue(totalInWei)
    } catch (err) {
      console.error("Error fetching collateral details:", err)
      setError("Failed to fetch collateral details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchCollateralDetails()
    }
  }, [isConnected, address])

  if (!isConnected) {
    return null
  }

  // Helper function to get token icon
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "WBTC":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7931A]/20">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                fill="#F7931A"
              />
              <path
                d="M17.0625 10.4531C17.3125 8.8125 16.0625 7.875 14.375 7.21875L14.9375 5.09375L13.6875 4.78125L13.1562 6.84375C12.8125 6.75 12.4688 6.65625 12.125 6.5625L12.6562 4.5L11.4062 4.1875L10.8438 6.3125C10.5625 6.25 10.2812 6.15625 10 6.09375V6.0625L8.3125 5.65625L8 7C8 7 8.9375 7.21875 8.9062 7.25C9.4688 7.375 9.5625 7.75 9.5625 8.0625L8.875 10.5625C8.9062 10.5625 8.9688 10.5938 9.0312 10.625L8.875 10.5938L7.9375 14C7.875 14.1875 7.6875 14.4688 7.3125 14.375C7.3438 14.4062 6.4062 14.125 6.4062 14.125L5.75 15.5625L7.3438 15.9375C7.6562 16.0312 7.9688 16.125 8.2812 16.2188L7.7188 18.375L8.9688 18.6875L9.5312 16.5625C9.875 16.6562 10.2188 16.75 10.5625 16.8438L10 18.9375L11.25 19.25L11.8125 17.0938C14.0625 17.5312 15.75 17.3438 16.5 15.3125C17.125 13.6875 16.5 12.75 15.3125 12.125C16.1875 11.9375 16.875 11.4375 17.0625 10.4531ZM14.0938 14.4375C13.625 16.0625 11.0625 15.1875 10.1875 14.9688L11 12.0312C11.875 12.25 14.5938 12.75 14.0938 14.4375ZM14.5625 10.4062C14.1562 11.875 11.9688 11.125 11.25 10.9375L12 8.25C12.75 8.4375 15 8.875 14.5625 10.4062Z"
                fill="white"
              />
            </svg>
          </div>
        )
      case "WETH":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#627EEA]/20">
            <svg className="h-5 w-5" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
              <path fill="#627EEA" d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75z" />
              <path fill="#3C3C3B" d="M392.07 0L0 650.54l392.07 231.75V472.33z" />
              <path fill="#343434" d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49z" />
              <path fill="#8C8C8C" d="M392.07 1277.38V956.52L0 724.89z" />
              <path fill="#141414" d="M392.07 882.29l392.06-231.75-392.06-178.21z" />
              <path fill="#393939" d="M0 650.54l392.07 231.75V472.33z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <span className="text-xs font-bold">{symbol.substring(0, 1)}</span>
          </div>
        )
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Collateral Details
            </CardTitle>
            <CardDescription>Detailed view of your collateral balances and values</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCollateralDetails} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <>
            <div className="space-y-4">
              {collateralDetails.length > 0 ? (
                collateralDetails.map((detail) => (
                  <div
                    key={detail.token.address}
                    className="flex items-center justify-between p-3 bg-primary/5 rounded-md border border-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      {getTokenIcon(detail.token.symbol)}
                      <div>
                        <div className="font-medium">{detail.token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{detail.token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {fromWei(detail.balance)} {detail.token.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">${fromWei(detail.usdValue)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No collateral tokens found</div>
              )}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-md border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total USD Value</span>
                <span className="text-xl font-bold glow-text-purple">${fromWei(totalUsdValue)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total value of all your collateral assets in USD</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Data from</span>
          <code className="bg-background/50 px-1 rounded">Server Actions</code>
          <span>using</span>
          <code className="bg-background/50 px-1 rounded">/collateral-balance</code>
          <span>and</span>
          <code className="bg-background/50 px-1 rounded">/usd-value</code>
        </div>
      </CardFooter>
    </Card>
  )
}
