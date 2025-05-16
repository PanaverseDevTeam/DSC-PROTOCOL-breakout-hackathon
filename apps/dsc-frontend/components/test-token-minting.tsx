"use client"

import { useState } from "react"
import { Bitcoin, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { api, toWei, getExplorerUrl } from "@/services/api"

export function TestTokenMinting() {
  const [wethAmount, setWethAmount] = useState("")
  const [wbtcAmount, setWbtcAmount] = useState("")
  const [isMintingWeth, setIsMintingWeth] = useState(false)
  const [isMintingWbtc, setIsMintingWbtc] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { address, isConnected, refreshAccountInfo } = useWallet()
  const { toast } = useToast()

  // Handle minting WETH
  const handleMintWeth = async () => {
    if (!wethAmount || !isConnected || !address) return

    setIsMintingWeth(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(wethAmount)
      const response = await api.mintTestWETH(address, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "WETH Minted",
        description: `Successfully minted ${wethAmount} WETH`,
        variant: "default",
      })

      // Refresh account info after minting
      await refreshAccountInfo()

      // Reset form
      setWethAmount("")
    } catch (error) {
      console.error("Error minting WETH:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint WETH. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMintingWeth(false)
    }
  }

  // Handle minting WBTC
  const handleMintWbtc = async () => {
    if (!wbtcAmount || !isConnected || !address) return

    setIsMintingWbtc(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(wbtcAmount)
      const response = await api.mintTestWBTC(address, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "WBTC Minted",
        description: `Successfully minted ${wbtcAmount} WBTC`,
        variant: "default",
      })

      // Refresh account info after minting
      await refreshAccountInfo()

      // Reset form
      setWbtcAmount("")
    } catch (error) {
      console.error("Error minting WBTC:", error)
      toast({
        title: "Minting Failed",
        description: "Failed to mint WBTC. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMintingWbtc(false)
    }
  }

  return (
    <Card className="glass-card-purple">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Test Token Minting
        </CardTitle>
        <CardDescription>Mint test tokens for development and testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weth-amount">WETH Amount</Label>
          <div className="flex gap-2">
            <Input
              id="weth-amount"
              type="number"
              placeholder="0.00"
              value={wethAmount}
              onChange={(e) => setWethAmount(e.target.value)}
              className="bg-background/50 flex-1"
            />
            <Button
              onClick={handleMintWeth}
              disabled={!wethAmount || isMintingWeth}
              className="bg-[#627EEA]/20 border-[#627EEA]/30 hover:bg-[#627EEA]/30 text-foreground"
            >
              {isMintingWeth ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#627EEA" d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75z" />
                  <path fill="#3C3C3B" d="M392.07 0L0 650.54l392.07 231.75V472.33z" />
                  <path fill="#343434" d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49z" />
                  <path fill="#8C8C8C" d="M392.07 1277.38V956.52L0 724.89z" />
                  <path fill="#141414" d="M392.07 882.29l392.06-231.75-392.06-178.21z" />
                  <path fill="#393939" d="M0 650.54l392.07 231.75V472.33z" />
                </svg>
              )}
              Mint WETH
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wbtc-amount">WBTC Amount</Label>
          <div className="flex gap-2">
            <Input
              id="wbtc-amount"
              type="number"
              placeholder="0.00"
              value={wbtcAmount}
              onChange={(e) => setWbtcAmount(e.target.value)}
              className="bg-background/50 flex-1"
            />
            <Button
              onClick={handleMintWbtc}
              disabled={!wbtcAmount || isMintingWbtc}
              className="bg-[#F7931A]/20 border-[#F7931A]/30 hover:bg-[#F7931A]/30 text-foreground"
            >
              {isMintingWbtc ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bitcoin className="mr-2 h-4 w-4 text-[#F7931A]" />
              )}
              Mint WBTC
            </Button>
          </div>
        </div>

        {/* Transaction Hash Display */}
        {txHash && (
          <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
            <p className="text-sm font-medium mb-1">Transaction Hash:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background/50 p-1 rounded flex-1 overflow-hidden text-ellipsis">
                {txHash}
              </code>
              <a
                href={getExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          These are test tokens for development purposes only. They have no real value.
        </p>
      </CardFooter>
    </Card>
  )
}
