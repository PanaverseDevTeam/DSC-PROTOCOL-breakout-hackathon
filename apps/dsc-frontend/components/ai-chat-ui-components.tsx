"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bitcoin, ArrowRight } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"

// Token Minting UI Component
export function TokenMintingUI({
  onMintWETH,
  onMintWBTC,
}: {
  onMintWETH: (amount: string) => void
  onMintWBTC: (amount: string) => void
}) {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMintWETH = () => {
    setIsProcessing(true)
    onMintWETH(amount)
    // Note: We don't reset isProcessing here as the parent component will re-render this component
  }

  const handleMintWBTC = () => {
    setIsProcessing(true)
    onMintWBTC(amount)
    // Note: We don't reset isProcessing here as the parent component will re-render this component
  }

  return (
    <Card className="w-full max-w-md mx-auto my-2 glass-card-accent">
      <CardHeader>
        <CardTitle className="text-sm">Mint Test Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleMintWETH}
          disabled={!amount || isProcessing}
          className="flex-1 bg-[#627EEA]/20 border-[#627EEA]/30 hover:bg-[#627EEA]/30 text-foreground"
        >
          {isProcessing ? (
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
        <Button
          onClick={handleMintWBTC}
          disabled={!amount || isProcessing}
          className="flex-1 bg-[#F7931A]/20 border-[#F7931A]/30 hover:bg-[#F7931A]/30 text-foreground"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bitcoin className="mr-2 h-4 w-4 text-[#F7931A]" />
          )}
          Mint WBTC
        </Button>
      </CardFooter>
    </Card>
  )
}

// Token Approval UI Component
export function TokenApprovalUI({
  onApprove,
  tokenOptions,
}: {
  onApprove: (tokenAddress: string, amount: string) => void
  tokenOptions: { address: string; symbol: string }[]
}) {
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]?.address || "")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = () => {
    setIsProcessing(true)
    onApprove(selectedToken, amount)
  }

  return (
    <Card className="w-full max-w-md mx-auto my-2 glass-card-accent">
      <CardHeader>
        <CardTitle className="text-sm">Approve Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {tokenOptions.map((token) => (
            <Button
              key={token.address}
              variant={selectedToken === token.address ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedToken(token.address)}
            >
              {token.symbol}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-background/50"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleApprove}
          disabled={!selectedToken || !amount || isProcessing}
          className="w-full bg-primary/5 border-primary/30 hover:bg-primary/10"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Approve Tokens
        </Button>
      </CardFooter>
    </Card>
  )
}

// Deposit Collateral UI Component
export function DepositCollateralUI({
  onDeposit,
  tokenOptions,
}: {
  onDeposit: (tokenAddress: string, amount: string) => void
  tokenOptions: { address: string; symbol: string }[]
}) {
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]?.address || "")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDeposit = () => {
    setIsProcessing(true)
    onDeposit(selectedToken, amount)
  }

  return (
    <Card className="w-full max-w-md mx-auto my-2 glass-card-accent">
      <CardHeader>
        <CardTitle className="text-sm">Deposit Collateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {tokenOptions.map((token) => (
            <Button
              key={token.address}
              variant={selectedToken === token.address ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedToken(token.address)}
            >
              {token.symbol}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-background/50"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleDeposit} disabled={!selectedToken || !amount || isProcessing} className="w-full">
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Deposit Collateral
        </Button>
      </CardFooter>
    </Card>
  )
}

// Mint DSC UI Component
export function MintDSCUI({ onMint }: { onMint: (amount: string) => void }) {
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMint = () => {
    setIsProcessing(true)
    onMint(amount)
  }

  return (
    <Card className="w-full max-w-md mx-auto my-2 glass-card-accent">
      <CardHeader>
        <CardTitle className="text-sm">Mint DSC</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-background/50"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleMint}
          disabled={!amount || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Mint DSC
        </Button>
      </CardFooter>
    </Card>
  )
}

// Deposit and Mint UI Component
export function DepositAndMintUI({
  onDepositAndMint,
  tokenOptions,
}: {
  onDepositAndMint: (tokenAddress: string, depositAmount: string, mintAmount: string) => void
  tokenOptions: { address: string; symbol: string }[]
}) {
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]?.address || "")
  const [depositAmount, setDepositAmount] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDepositAndMint = () => {
    setIsProcessing(true)
    onDepositAndMint(selectedToken, depositAmount, mintAmount)
  }

  return (
    <Card className="w-full max-w-md mx-auto my-2 glass-card-accent">
      <CardHeader>
        <CardTitle className="text-sm">Deposit Collateral & Mint DSC</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {tokenOptions.map((token) => (
            <Button
              key={token.address}
              variant={selectedToken === token.address ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedToken(token.address)}
            >
              {token.symbol}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Deposit amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-background/50"
          />
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="number"
            placeholder="Mint amount (DSC)"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="bg-background/50"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDepositAndMint}
          disabled={!selectedToken || !depositAmount || !mintAmount || isProcessing}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Deposit & Mint
        </Button>
      </CardFooter>
    </Card>
  )
}

// Transaction Result UI Component
export function TransactionResultUI({
  success,
  message,
  txHash,
}: {
  success: boolean
  message: string
  txHash?: string
}) {
  return (
    <Card
      className={`w-full max-w-md mx-auto my-2 ${success ? "glass-card-accent" : "border-red-500/30 bg-red-500/5"}`}
    >
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2">
          <div className={`text-sm ${success ? "text-green-500" : "text-red-500"}`}>{message}</div>
          {txHash && (
            <div className="text-xs bg-background/50 p-2 rounded overflow-hidden text-ellipsis">
              <span className="font-medium">TX Hash:</span>{" "}
              <a
                href={`${API_CONFIG.network.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
