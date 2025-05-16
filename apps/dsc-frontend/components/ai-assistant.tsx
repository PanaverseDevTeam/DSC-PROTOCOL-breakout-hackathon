"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { geminiService, type FunctionName, isReadOnlyFunction } from "@/services/ai-service"
import { API_CONFIG } from "@/config/api-config"
import {
  TokenMintingUI,
  TokenApprovalUI,
  DepositCollateralUI,
  MintDSCUI,
  DepositAndMintUI,
  TransactionResultUI,
} from "./ai-chat-ui-components"
import { TransactionConfirmation } from "./transaction-confirmation"
import axios from "axios"

type MessageRole = "user" | "assistant" | "system" | "function"

type Message = {
  role: MessageRole
  content: string
  timestamp: Date
  isTyping?: boolean
  functionCall?: {
    name: FunctionName
    args: any
  }
  functionResult?: {
    success: boolean
    result: string
    txHash?: string
  }
  uiComponent?: React.ReactNode
}

// Type for pending transaction
type PendingTransaction = {
  functionName: FunctionName
  args: any
  description: string
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your DSC AI assistant. How can I help you with your decentralized stablecoin today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { address, isConnected, refreshAccountInfo } = useWallet()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Add system message
    setMessages((prev) => [
      ...prev,
      {
        role: "system",
        content: "Processing your request...",
        timestamp: new Date(),
      },
    ])

    try {
      // Format messages for the Gemini API
      const formattedMessages = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Add the new user message
      formattedMessages.push({
        role: "user",
        content: input,
      })

      console.log("Sending messages to Gemini:", formattedMessages)

      // Call the Gemini API
      const response = await geminiService.generateResponse(formattedMessages, address)

      console.log("Received response from Gemini:", response)

      // Replace system message with assistant response
      setMessages((prev) => {
        const newMessages = [...prev.slice(0, prev.length - 1)]
        const assistantMessage: Message = {
          role: "assistant",
          content: response.text || "I'm sorry, I couldn't generate a proper response. Please try again.",
          timestamp: new Date(),
          functionCall: response.functionCall as any,
        }
        return [...newMessages, assistantMessage]
      })

      // If there's a function call, handle it
      if (response.functionCall && address) {
        const { name, args } = response.functionCall
        console.log("Function call detected:", name, args)

        // For read-only functions, execute directly
        if (isReadOnlyFunction(name as FunctionName)) {
          await handleFunctionExecution(name as FunctionName, args)
        } else {
          // For transaction functions, add UI component based on function call
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            const updatedMessage = { ...lastMessage }

            // Add appropriate UI component based on function name
            if (name === "mintWETH" || name === "mintWBTC") {
              updatedMessage.uiComponent = (
                <TokenMintingUI
                  onMintWETH={(amount) => handleTransactionRequest("mintWETH", { amount })}
                  onMintWBTC={(amount) => handleTransactionRequest("mintWBTC", { amount })}
                />
              )
            } else if (name === "approveToken") {
              updatedMessage.uiComponent = (
                <TokenApprovalUI
                  onApprove={(tokenAddress, amount) =>
                    handleTransactionRequest("approveToken", { tokenAddress, amount })
                  }
                  tokenOptions={[
                    { address: API_CONFIG.contracts.WETH, symbol: "WETH" },
                    { address: API_CONFIG.contracts.WBTC, symbol: "WBTC" },
                  ]}
                />
              )
            } else if (name === "depositCollateral") {
              updatedMessage.uiComponent = (
                <DepositCollateralUI
                  onDeposit={(tokenAddress, amount) =>
                    handleTransactionRequest("depositCollateral", { tokenAddress, amount })
                  }
                  tokenOptions={[
                    { address: API_CONFIG.contracts.WETH, symbol: "WETH" },
                    { address: API_CONFIG.contracts.WBTC, symbol: "WBTC" },
                  ]}
                />
              )
            } else if (name === "mintDSC") {
              updatedMessage.uiComponent = (
                <MintDSCUI onMint={(amount) => handleTransactionRequest("mintDSC", { amount })} />
              )
            } else if (name === "depositAndMint") {
              updatedMessage.uiComponent = (
                <DepositAndMintUI
                  onDepositAndMint={(tokenAddress, depositAmount, mintAmount) =>
                    handleTransactionRequest("depositAndMint", { tokenAddress, depositAmount, mintAmount })
                  }
                  tokenOptions={[
                    { address: API_CONFIG.contracts.WETH, symbol: "WETH" },
                    { address: API_CONFIG.contracts.WBTC, symbol: "WBTC" },
                  ]}
                />
              )
            }

            return [...prev.slice(0, prev.length - 1), updatedMessage]
          })

          // If args are provided directly, set up the transaction request
          if (Object.keys(args || {}).length > 0) {
            const description = getTransactionDescription(name as FunctionName, args)
            setPendingTransaction({
              functionName: name as FunctionName,
              args,
              description,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error)

      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data)
      }

      // Replace system message with error
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        },
      ])

      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle transaction request - this sets up the pending transaction for confirmation
  const handleTransactionRequest = (functionName: FunctionName, args: any) => {
    const description = getTransactionDescription(functionName, args)
    setPendingTransaction({
      functionName,
      args,
      description,
    })
  }

  // Get a human-readable description of the transaction
  const getTransactionDescription = (functionName: FunctionName, args: any): string => {
    switch (functionName) {
      case "mintWETH":
        return `Mint ${args.amount} WETH to your wallet`
      case "mintWBTC":
        return `Mint ${args.amount} WBTC to your wallet`
      case "approveToken":
        return `Approve ${args.amount} tokens for the DSC contract`
      case "depositCollateral":
        return `Deposit ${args.amount} as collateral`
      case "mintDSC":
        return `Mint ${args.amount} DSC stablecoin`
      case "burnDSC":
        return `Burn ${args.amount} DSC stablecoin`
      case "redeemCollateral":
        return `Redeem ${args.amount} collateral`
      case "depositAndMint":
        return `Deposit ${args.depositAmount} collateral and mint ${args.mintAmount} DSC`
      default:
        return `Execute ${functionName} operation`
    }
  }

  // Handle function execution after confirmation
  const handleFunctionExecution = async (name: FunctionName, args: any) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to perform this action.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Execute the function
      const result = await geminiService.executeFunction(name, args, address)

      // Add function result to messages
      setMessages((prev) => {
        const newMessages = [...prev]

        // Add a new message with the function result
        newMessages.push({
          role: "function",
          content: result.result,
          timestamp: new Date(),
          functionResult: result,
          uiComponent: <TransactionResultUI success={result.success} message={result.result} txHash={result.txHash} />,
        })

        return newMessages
      })

      // Refresh account info after successful function execution
      if (result.success) {
        await refreshAccountInfo()

        toast({
          title: "Success",
          description: result.result,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result.result,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing function:", error)

      setMessages((prev) => [
        ...prev,
        {
          role: "function",
          content: `Error executing function: ${(error as Error).message}`,
          timestamp: new Date(),
          functionResult: {
            success: false,
            result: `Error executing function: ${(error as Error).message}`,
          },
          uiComponent: (
            <TransactionResultUI success={false} message={`Error executing function: ${(error as Error).message}`} />
          ),
        },
      ])

      toast({
        title: "Error",
        description: `Failed to execute function: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle transaction confirmation
  const handleConfirmTransaction = async () => {
    if (!pendingTransaction) return

    const { functionName, args } = pendingTransaction
    setPendingTransaction(null)
    await handleFunctionExecution(functionName, args)
  }

  // Handle transaction cancellation
  const handleCancelTransaction = () => {
    setPendingTransaction(null)

    // Add a message indicating the transaction was cancelled
    setMessages((prev) => [
      ...prev,
      {
        role: "function",
        content: "Transaction cancelled by user.",
        timestamp: new Date(),
        functionResult: {
          success: false,
          result: "Transaction cancelled by user.",
        },
        uiComponent: <TransactionResultUI success={false} message="Transaction cancelled by user." />,
      },
    ])
  }

  const handleMicClick = () => {
    toast({
      title: "Voice Input",
      description: "Voice recognition would activate here in a real implementation",
      variant: "default",
    })
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic">AI Assistant</h2>
        <p className="text-muted-foreground">Your personal DSC financial assistant</p>
      </div>

      <Card className="mt-6 flex-1 flex flex-col glass-card-blue overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            DSC Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pr-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "system" ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {message.content}
                  </div>
                ) : message.role === "function" ? (
                  <div className="w-full max-w-[80%]">{message.uiComponent}</div>
                ) : (
                  <div
                    className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary/10 text-primary-foreground" : "glass-card"
                    } ${message.isTyping ? "typing-animation" : ""} ${
                      message.role === "assistant" ? "ai-message-animation" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user" ? "bg-primary/20" : "bg-blue-500/20"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="text-sm">{message.content}</div>
                      {message.uiComponent && <div className="mt-2 w-full">{message.uiComponent}</div>}
                      <div className="mt-1 text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Transaction Confirmation Dialog */}
          {pendingTransaction && (
            <div className="mb-4">
              <TransactionConfirmation
                title="Confirm Transaction"
                description={pendingTransaction.description}
                onConfirm={handleConfirmTransaction}
                onCancel={handleCancelTransaction}
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0" onClick={handleMicClick}>
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice Input</span>
            </Button>
            <Input
              placeholder="Ask me anything about your DSC wallet..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
              className="bg-background/50"
            />
            <Button
              variant="default"
              size="icon"
              className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
