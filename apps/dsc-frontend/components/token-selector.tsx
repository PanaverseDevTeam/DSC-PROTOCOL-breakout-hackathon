"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWallet } from "@/contexts/wallet-context"
import { api, DSC_ENGINE_ADDRESS, toWei } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface TokenSelectorProps {
  onTokenSelect: (token: string, amount: string) => void
  showApproveButton?: boolean
  label?: string
  placeholder?: string
}

interface Token {
  address: string
  symbol: string
  name: string
  logo?: string
}

export function TokenSelector({
  onTokenSelect,
  showApproveButton = true,
  label = "Select Token",
  placeholder = "0.00",
}: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const { address, isConnected, refreshAccountInfo } = useWallet()
  const { toast } = useToast()

  // Fetch available tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoadingTokens(true)
      try {
        const response = await api.getCollateralTokens()

        // Check if we got tokens back (either from API or hardcoded)
        if (!response.tokens || response.tokens.length === 0) {
          throw new Error("No tokens available")
        }

        setTokens(response.tokens)
        if (response.tokens.length > 0) {
          setSelectedToken(response.tokens[0])
        }
      } catch (error) {
        console.error("Error fetching tokens:", error)
        toast({
          title: "Error",
          description: "Failed to fetch available tokens. Please try again later.",
          variant: "destructive",
        })
        setTokens([]) // Set empty array instead of crashing
      } finally {
        setIsLoadingTokens(false)
      }
    }

    if (isConnected) {
      fetchTokens()
    }
  }, [isConnected, toast])

  // Handle token selection
  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token)
    if (amount) {
      onTokenSelect(token.address, amount)
    }
  }

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    if (selectedToken) {
      onTokenSelect(selectedToken.address, value)
    }
  }

  // Handle token approval
  const handleApprove = async () => {
    if (!selectedToken || !amount || !isConnected || !address) return

    setIsApproving(true)
    try {
      const amountInWei = toWei(amount)
      await api.approveTokens(address, selectedToken.address, DSC_ENGINE_ADDRESS, amountInWei)

      toast({
        title: "Approval Successful",
        description: `Successfully approved ${amount} ${selectedToken.symbol}`,
        variant: "default",
      })

      // Refresh account info after approval
      await refreshAccountInfo()
    } catch (error) {
      console.error("Error approving tokens:", error)
      toast({
        title: "Approval Failed",
        description: "Failed to approve tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Get token logo based on symbol
  const getTokenLogo = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "WBTC":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F7931A]/20">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#627EEA]/20">
            <svg className="h-4 w-4" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
              <path fill="#627EEA" d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75z" />
              <path fill="#3C3C3B" d="M392.07 0L0 650.54l392.07 231.75V472.33z" />
              <path fill="#343434" d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49z" />
              <path fill="#8C8C8C" d="M392.07 1277.38V956.52L0 724.89z" />
              <path fill="#141414" d="M392.07 882.29l392.06-231.75-392.06-178.21z" />
              <path fill="#393939" d="M0 650.54l392.07 231.75V472.33z" />
            </svg>
          </div>
        )
      case "DSC":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
            <span className="text-xs font-bold text-purple-500">DSC</span>
          </div>
        )
      default:
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <span className="text-xs font-bold">{symbol.substring(0, 1)}</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="token-amount">{label}</Label>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background/50 min-w-[120px] justify-between"
              disabled={isLoadingTokens}
            >
              {isLoadingTokens ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedToken ? (
                <>
                  {getTokenLogo(selectedToken.symbol)}
                  <span>{selectedToken.symbol}</span>
                </>
              ) : (
                "Select Token"
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {tokens.map((token) => (
              <DropdownMenuItem
                key={token.address}
                className="flex items-center gap-2"
                onClick={() => handleTokenSelect(token)}
              >
                {getTokenLogo(token.symbol)}
                <span>{token.symbol}</span>
                {selectedToken?.address === token.address && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          id="token-amount"
          type="number"
          placeholder={placeholder}
          value={amount}
          onChange={handleAmountChange}
          className="bg-background/50 flex-1"
        />
        {showApproveButton && (
          <Button
            variant="outline"
            onClick={handleApprove}
            disabled={!selectedToken || !amount || isApproving}
            className="bg-primary/5 border-primary/30 hover:bg-primary/10"
          >
            {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Approve
          </Button>
        )}
      </div>
    </div>
  )
}
