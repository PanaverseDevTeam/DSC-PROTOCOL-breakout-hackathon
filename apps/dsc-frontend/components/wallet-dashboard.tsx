"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Bitcoin,
  Coins,
  Loader2,
  ExternalLink,
  RefreshCw,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/wallet-context"
import { api, toWei, fromWei, getExplorerUrl } from "@/services/api"
import { TokenSelector } from "@/components/token-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { API_CONFIG } from "@/config/api-config"
import { TotalValueCard } from "@/components/total-value-card"

export function WalletDashboard() {
  const [mintAmount, setMintAmount] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [selectedCollateralToken, setSelectedCollateralToken] = useState("")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [redeemToken, setRedeemToken] = useState("")
  const [redeemAmount, setRedeemAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("mint")
  const { toast } = useToast()

  // Get the apiError from the wallet context
  const { address, isConnected, accountInfo, isLoading, refreshAccountInfo, apiError } = useWallet()

  // Handle token selection for collateral
  const handleCollateralTokenSelect = (token: string, amount: string) => {
    setSelectedCollateralToken(token)
    setCollateralAmount(amount)
  }

  // Handle token selection for redeem
  const handleRedeemTokenSelect = (token: string, amount: string) => {
    setRedeemToken(token)
    setRedeemAmount(amount)
  }

  // Handle deposit collateral
  const handleDepositCollateral = async () => {
    if (!selectedCollateralToken || !collateralAmount || !isConnected || !address) return

    setIsProcessing(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(collateralAmount)
      const response = await api.depositCollateral(address, selectedCollateralToken, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "Collateral Deposited",
        description: `Successfully deposited ${collateralAmount} of collateral`,
        variant: "default",
      })

      // Refresh account info after deposit
      await refreshAccountInfo()

      // Reset form
      setCollateralAmount("")
    } catch (error) {
      console.error("Error depositing collateral:", error)
      toast({
        title: "Deposit Failed",
        description: "Failed to deposit collateral. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle mint DSC
  const handleMintDSC = async () => {
    if (!mintAmount || !isConnected || !address) return

    setIsProcessing(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(mintAmount)
      const response = await api.mintDSC(address, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "DSC Minted",
        description: `Successfully minted ${mintAmount} DSC`,
        variant: "default",
      })

      // Refresh account info after mint
      await refreshAccountInfo()

      // Reset form
      setMintAmount("")
    } catch (error) {
      console.error("Error minting DSC:", error)
      toast({
        title: "Mint Failed",
        description: "Failed to mint DSC. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle deposit and mint in one transaction
  const handleDepositAndMint = async () => {
    if (!selectedCollateralToken || !collateralAmount || !mintAmount || !isConnected || !address) return

    setIsProcessing(true)
    setTxHash(null)
    try {
      const collateralAmountInWei = toWei(collateralAmount)
      const mintAmountInWei = toWei(mintAmount)

      const response = await api.depositAndMint(
        address,
        selectedCollateralToken,
        collateralAmountInWei,
        mintAmountInWei,
      )

      setTxHash(response.txHash)

      toast({
        title: "Operation Successful",
        description: `Deposited ${collateralAmount} collateral and minted ${mintAmount} DSC`,
        variant: "default",
      })

      // Refresh account info
      await refreshAccountInfo()

      // Reset form
      setCollateralAmount("")
      setMintAmount("")
    } catch (error) {
      console.error("Error in deposit and mint:", error)
      toast({
        title: "Operation Failed",
        description: "Failed to deposit collateral and mint DSC. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle redeem collateral
  const handleRedeemCollateral = async () => {
    if (!redeemToken || !redeemAmount || !isConnected || !address) return

    setIsProcessing(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(redeemAmount)
      const response = await api.redeemCollateral(address, redeemToken, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "Collateral Redeemed",
        description: `Successfully redeemed ${redeemAmount} of collateral`,
        variant: "default",
      })

      // Refresh account info
      await refreshAccountInfo()

      // Reset form
      setRedeemAmount("")
    } catch (error) {
      console.error("Error redeeming collateral:", error)
      toast({
        title: "Redemption Failed",
        description: "Failed to redeem collateral. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle burn DSC
  const handleBurnDSC = async () => {
    if (!burnAmount || !isConnected || !address) return

    setIsProcessing(true)
    setTxHash(null)
    try {
      const amountInWei = toWei(burnAmount)
      const response = await api.burnDSC(address, amountInWei)

      setTxHash(response.txHash)

      toast({
        title: "DSC Burned",
        description: `Successfully burned ${burnAmount} DSC`,
        variant: "default",
      })

      // Refresh account info
      await refreshAccountInfo()

      // Reset form
      setBurnAmount("")
    } catch (error) {
      console.error("Error burning DSC:", error)
      toast({
        title: "Burn Failed",
        description: "Failed to burn DSC. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Get health factor status
  const getHealthFactorStatus = (healthFactor: string) => {
    const healthFactorNum = Number.parseFloat(fromWei(healthFactor))
    if (healthFactorNum < 1) return "critical"
    if (healthFactorNum < 1.5) return "warning"
    return "healthy"
  }

  // Get status indicator
  const getStatusIndicator = (status: string) => {
    return <div className={`chain-status-indicator ${status}`} />
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <Card className="w-full max-w-md glass-card-accent text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>Connect your MetaMask wallet to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="mb-4">You need to connect your wallet to view your balance and perform actions.</p>
            <Button
              onClick={() => document.querySelector("[data-wallet-connect]")?.click()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 btn-glow"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Update the API error state UI to be more helpful for ngrok users
  // Show API error state
  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <Card className="w-full max-w-md glass-card-accent text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              API Connection Error
            </CardTitle>
            <CardDescription>There was an error connecting to the backend API</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="mb-4 text-red-500">{apiError}</p>
            <div className="p-4 bg-red-500/10 rounded-md border border-red-500/20 text-left mb-4">
              <p className="text-sm mb-2 font-medium">Troubleshooting steps:</p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>
                  Current API URL: <code className="bg-background/50 px-1 rounded">{API_CONFIG.baseUrl}</code>
                </li>
                <li>
                  <strong>Ngrok specific:</strong> Make sure your ngrok tunnel is active and the URL is correct
                </li>
                <li>Verify all endpoints are configured to accept POST requests</li>
                <li>Ensure your backend is returning proper JSON responses with Content-Type header</li>
                <li>Check that CORS is properly configured on your backend to allow requests from this origin</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={refreshAccountInfo}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(API_CONFIG.baseUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Test API URL in Browser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (isLoading || !accountInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading wallet data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic glow-text-purple">Wallet Dashboard</h2>
        <p className="text-muted-foreground">Manage your DSC stablecoin and collateral</p>
      </div>

      {/* Main Balance Card */}
      <Card className="glass-card-accent gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            DSC Balance
          </CardTitle>
          <CardDescription>Your decentralized stablecoin balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold glow-text-purple">${fromWei(accountInfo.totalDscMinted || "0")}</span>
            <span className="ml-2 text-sm text-muted-foreground">DSC</span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Health Factor</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) >= 1.5
                    ? "text-green-500 dark:text-green-400"
                    : Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) >= 1
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-red-500 dark:text-red-400",
                )}
              >
                {Number.parseFloat(fromWei(accountInfo.healthFactor || "0")).toFixed(2)}
              </span>
            </div>
            <Progress
              value={Math.min(Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) * 50, 100)}
              max={100}
              className="h-2 bg-secondary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Critical: &lt;1.0</span>
              <span>Safe: &gt;1.5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <TotalValueCard />
        {/* You can add more summary cards here if needed */}
      </div>

      {/* Action Tabs */}
      <Tabs defaultValue="mint" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mint" className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4" />
            <span>Deposit & Mint</span>
          </TabsTrigger>
          <TabsTrigger value="redeem" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            <span>Redeem & Burn</span>
          </TabsTrigger>
        </TabsList>

        {/* Mint Tab */}
        <TabsContent value="mint">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Deposit Collateral & Mint DSC</CardTitle>
              <CardDescription>Deposit collateral and mint DSC stablecoin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collateral Token Selector */}
              <TokenSelector onTokenSelect={handleCollateralTokenSelect} label="Collateral Token" />

              {/* DSC Amount */}
              <div className="space-y-2">
                <Label htmlFor="mint-amount">Amount to Mint (DSC)</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="bg-background/50"
                />
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
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDepositCollateral}
                disabled={!selectedCollateralToken || !collateralAmount || isProcessing}
                className="w-full sm:flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Deposit Collateral
                  </>
                )}
              </Button>
              <Button
                onClick={handleMintDSC}
                disabled={!mintAmount || isProcessing}
                className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Mint DSC
                  </>
                )}
              </Button>
            </CardFooter>
            <CardFooter className="pt-0">
              <Button
                onClick={handleDepositAndMint}
                disabled={!selectedCollateralToken || !collateralAmount || !mintAmount || isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    One-Click Deposit & Mint
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Redeem Tab */}
        <TabsContent value="redeem">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Redeem Collateral & Burn DSC</CardTitle>
              <CardDescription>Redeem your collateral or burn DSC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Redeem Collateral */}
              <TokenSelector
                onTokenSelect={handleRedeemTokenSelect}
                label="Redeem Collateral"
                showApproveButton={false}
              />

              {/* Burn DSC */}
              <div className="space-y-2">
                <Label htmlFor="burn-amount">Amount to Burn (DSC)</Label>
                <Input
                  id="burn-amount"
                  type="number"
                  placeholder="0.00"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="bg-background/50"
                />
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
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleRedeemCollateral}
                disabled={!redeemToken || !redeemAmount || isProcessing}
                className="w-full sm:flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Redeem Collateral
                  </>
                )}
              </Button>
              <Button
                onClick={handleBurnDSC}
                disabled={!burnAmount || isProcessing}
                variant="outline"
                className="w-full sm:flex-1 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Burn DSC
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collateral and Health */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Collateral Card */}
        <Card className="glass-card-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Collateral Assets
            </CardTitle>
            <CardDescription>Your locked collateral assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountInfo.collateralTokens && accountInfo.collateralTokens.length > 0 ? (
              accountInfo.collateralTokens.map((token) => (
                <div key={token.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      {token.symbol === "WBTC" ? (
                        <Bitcoin className="h-5 w-5 text-[#F7931A]" />
                      ) : token.symbol === "WETH" ? (
                        <svg className="h-5 w-5" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#627EEA" d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75z" />
                          <path fill="#3C3C3B" d="M392.07 0L0 650.54l392.07 231.75V472.33z" />
                          <path fill="#343434" d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49z" />
                          <path fill="#8C8C8C" d="M392.07 1277.38V956.52L0 724.89z" />
                          <path fill="#141414" d="M392.07 882.29l392.06-231.75-392.06-178.21z" />
                          <path fill="#393939" d="M0 650.54l392.07 231.75V472.33z" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{token.symbol.substring(0, 1)}</span>
                      )}
                    </div>
                    <span>{token.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {fromWei(token.balance)} {token.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">${fromWei(token.usdValue)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No collateral deposited yet</p>
            )}

            <div className="mt-2 pt-2 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Value</span>
                <span className="font-bold glow-text-purple">${fromWei(accountInfo.collateralValueUSD || "0")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Factor Card */}
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Health Status
            </CardTitle>
            <CardDescription>Your position health and risk level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Factor</span>
              <div className="flex items-center gap-2">
                {getStatusIndicator(getHealthFactorStatus(accountInfo.healthFactor || "0"))}
                <span
                  className={cn(
                    "text-sm font-medium",
                    Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) >= 1.5
                      ? "text-green-500 dark:text-green-400"
                      : Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) >= 1
                        ? "text-yellow-500 dark:text-yellow-400"
                        : "text-red-500 dark:text-red-400",
                  )}
                >
                  {Number.parseFloat(fromWei(accountInfo.healthFactor || "0")).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total DSC Minted</span>
              <span className="font-medium">${fromWei(accountInfo.totalDscMinted || "0")}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collateral Value</span>
              <span className="font-medium">${fromWei(accountInfo.collateralValueUSD || "0")}</span>
            </div>

            <div className="mt-2 pt-2 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Position Status</span>
                <div className="flex items-center gap-2">
                  {Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) < 1 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                      <span className="text-sm text-red-500 dark:text-red-400">Liquidation Risk</span>
                    </>
                  ) : Number.parseFloat(fromWei(accountInfo.healthFactor || "0")) < 1.5 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                      <span className="text-sm text-yellow-500 dark:text-yellow-400">Warning</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm text-green-500 dark:text-green-400">Healthy</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to conditionally join class names
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ")
}
