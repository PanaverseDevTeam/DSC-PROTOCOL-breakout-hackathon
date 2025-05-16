"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { fromWei } from "@/services/api"
import getAccountInfo from "@/app/actions/get-account-info"

export function TotalValueCard() {
  const { address, isConnected } = useWallet()
  const [totalUsdValue, setTotalUsdValue] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTotalValue = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // Get account info which includes total collateral value using server action
      const accountInfo = await getAccountInfo(address)
      setTotalUsdValue(accountInfo.collateralValueUSD)
    } catch (err) {
      console.error("Error fetching total USD value:", err)
      setError("Failed to fetch total value. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchTotalValue()
    }
  }, [isConnected, address])

  if (!isConnected) {
    return null
  }

  return (
    <Card className="glass-card-accent">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Total Asset Value
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchTotalValue} disabled={isLoading} className="h-8 w-8 p-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>Total value of all your assets in USD</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-1 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            <div className="text-2xl font-bold">{fromWei(totalUsdValue)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
