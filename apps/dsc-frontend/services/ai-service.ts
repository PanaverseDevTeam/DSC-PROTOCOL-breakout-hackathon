import axios from "axios"
import { api } from "./api"
import { fromWei, toWei } from "./api"

// Define function types that our AI can call
export type FunctionName =
  | "mintWETH"
  | "mintWBTC"
  | "approveToken"
  | "depositCollateral"
  | "mintDSC"
  | "burnDSC"
  | "redeemCollateral"
  | "depositAndMint"
  | "getBalance"
  | "getHealthFactor"

// Categorize functions as read-only or transaction functions
export const isReadOnlyFunction = (functionName: FunctionName): boolean => {
  const readOnlyFunctions: FunctionName[] = ["getBalance", "getHealthFactor"]
  return readOnlyFunctions.includes(functionName)
}

// Define the function schema for Gemini
export const functionSchemas = [
  {
    name: "mintWETH",
    description: "Mint test WETH tokens to the user's wallet",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: {
          type: "STRING",
          description: "Amount of WETH to mint",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "mintWBTC",
    description: "Mint test WBTC tokens to the user's wallet",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: {
          type: "STRING",
          description: "Amount of WBTC to mint",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "approveToken",
    description: "Approve tokens to be used by the DSC contract",
    parameters: {
      type: "OBJECT",
      properties: {
        tokenAddress: {
          type: "STRING",
          description: "Address of the token to approve",
        },
        amount: {
          type: "STRING",
          description: "Amount to approve",
        },
      },
      required: ["tokenAddress", "amount"],
    },
  },
  {
    name: "depositCollateral",
    description: "Deposit collateral to the DSC contract",
    parameters: {
      type: "OBJECT",
      properties: {
        tokenAddress: {
          type: "STRING",
          description: "Address of the token to deposit",
        },
        amount: {
          type: "STRING",
          description: "Amount to deposit",
        },
      },
      required: ["tokenAddress", "amount"],
    },
  },
  {
    name: "mintDSC",
    description: "Mint DSC stablecoin",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: {
          type: "STRING",
          description: "Amount of DSC to mint",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "burnDSC",
    description: "Burn DSC stablecoin",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: {
          type: "STRING",
          description: "Amount of DSC to burn",
        },
      },
      required: ["amount"],
    },
  },
  {
    name: "redeemCollateral",
    description: "Redeem collateral from the DSC contract",
    parameters: {
      type: "OBJECT",
      properties: {
        tokenAddress: {
          type: "STRING",
          description: "Address of the token to redeem",
        },
        amount: {
          type: "STRING",
          description: "Amount to redeem",
        },
      },
      required: ["tokenAddress", "amount"],
    },
  },
  {
    name: "depositAndMint",
    description: "Deposit collateral and mint DSC in one transaction",
    parameters: {
      type: "OBJECT",
      properties: {
        tokenAddress: {
          type: "STRING",
          description: "Address of the token to deposit",
        },
        depositAmount: {
          type: "STRING",
          description: "Amount to deposit",
        },
        mintAmount: {
          type: "STRING",
          description: "Amount of DSC to mint",
        },
      },
      required: ["tokenAddress", "depositAmount", "mintAmount"],
    },
  },
  {
    name: "getBalance",
    description: "Get the balance of a token for the user",
    parameters: {
      type: "OBJECT",
      properties: {
        tokenAddress: {
          type: "STRING",
          description: "Address of the token to check balance for",
        },
      },
      required: ["tokenAddress"],
    },
  },
  {
    name: "getHealthFactor",
    description: "Get the health factor of the user's position",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: [],
    },
  },
]

// Define the function implementations
export const functionImplementations: Record<
  FunctionName,
  (params: any, userAddress: string) => Promise<{ success: boolean; result: string; txHash?: string }>
> = {
  mintWETH: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.mintTestWETH(userAddress, amountInWei)
      return {
        success: true,
        result: `Successfully minted ${params.amount} WETH`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error minting WETH:", error)
      return {
        success: false,
        result: `Failed to mint WETH: ${(error as Error).message}`,
      }
    }
  },
  mintWBTC: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.mintTestWBTC(userAddress, amountInWei)
      return {
        success: true,
        result: `Successfully minted ${params.amount} WBTC`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error minting WBTC:", error)
      return {
        success: false,
        result: `Failed to mint WBTC: ${(error as Error).message}`,
      }
    }
  },
  approveToken: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.approveTokens(
        userAddress,
        params.tokenAddress,
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        amountInWei,
      )
      return {
        success: true,
        result: `Successfully approved ${params.amount} tokens`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error approving tokens:", error)
      return {
        success: false,
        result: `Failed to approve tokens: ${(error as Error).message}`,
      }
    }
  },
  depositCollateral: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.depositCollateral(userAddress, params.tokenAddress, amountInWei)
      return {
        success: true,
        result: `Successfully deposited ${params.amount} collateral`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error depositing collateral:", error)
      return {
        success: false,
        result: `Failed to deposit collateral: ${(error as Error).message}`,
      }
    }
  },
  mintDSC: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.mintDSC(userAddress, amountInWei)
      return {
        success: true,
        result: `Successfully minted ${params.amount} DSC`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error minting DSC:", error)
      return {
        success: false,
        result: `Failed to mint DSC: ${(error as Error).message}`,
      }
    }
  },
  burnDSC: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.burnDSC(userAddress, amountInWei)
      return {
        success: true,
        result: `Successfully burned ${params.amount} DSC`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error burning DSC:", error)
      return {
        success: false,
        result: `Failed to burn DSC: ${(error as Error).message}`,
      }
    }
  },
  redeemCollateral: async (params, userAddress) => {
    try {
      const amountInWei = toWei(params.amount)
      const response = await api.redeemCollateral(userAddress, params.tokenAddress, amountInWei)
      return {
        success: true,
        result: `Successfully redeemed ${params.amount} collateral`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error redeeming collateral:", error)
      return {
        success: false,
        result: `Failed to redeem collateral: ${(error as Error).message}`,
      }
    }
  },
  depositAndMint: async (params, userAddress) => {
    try {
      const depositAmountInWei = toWei(params.depositAmount)
      const mintAmountInWei = toWei(params.mintAmount)
      const response = await api.depositAndMint(userAddress, params.tokenAddress, depositAmountInWei, mintAmountInWei)
      return {
        success: true,
        result: `Successfully deposited ${params.depositAmount} collateral and minted ${params.mintAmount} DSC`,
        txHash: response.txHash,
      }
    } catch (error) {
      console.error("Error in deposit and mint:", error)
      return {
        success: false,
        result: `Failed to deposit collateral and mint DSC: ${(error as Error).message}`,
      }
    }
  },
  getBalance: async (params, userAddress) => {
    try {
      const response = await api.getCollateralBalance(userAddress, params.tokenAddress)
      return {
        success: true,
        result: `Your balance is ${fromWei(response.balance)}`,
      }
    } catch (error) {
      console.error("Error getting balance:", error)
      return {
        success: false,
        result: `Failed to get balance: ${(error as Error).message}`,
      }
    }
  },
  getHealthFactor: async (_params, userAddress) => {
    try {
      const response = await api.getHealthFactor(userAddress)
      return {
        success: true,
        result: `Your health factor is ${fromWei(response.healthFactor)}`,
      }
    } catch (error) {
      console.error("Error getting health factor:", error)
      return {
        success: false,
        result: `Failed to get health factor: ${(error as Error).message}`,
      }
    }
  },
}

// Gemini API service
export const geminiService = {
  generateResponse: async (
    messages: { role: string; content: string }[],
    userAddress: string | null,
  ): Promise<{
    text: string
    functionCall?: { name: string; args: any } | null
  }> => {
    try {
      // Prepare the system message
      const systemPrompt = `You are a helpful DSC (Decentralized Stablecoin) assistant. You can help users with minting tokens, 
    approving tokens, depositing collateral, minting DSC, and other operations. 
    When users ask about these operations, guide them step by step and offer to perform these actions for them.
    
    For token addresses, use these references:
    - WETH: ${process.env.NEXT_PUBLIC_WETH_ADDRESS}
    - WBTC: ${process.env.NEXT_PUBLIC_WBTC_ADDRESS}
    - DSC: ${process.env.NEXT_PUBLIC_DSC_ADDRESS}
    
    Always provide clear, step-by-step guidance and offer to help with specific operations.
    
    For security reasons, you should always inform users that they will need to approve any transaction before it's executed.
    You can directly check balances and provide information, but for any operation that changes state (minting, depositing, etc.),
    the user will need to explicitly approve the transaction.`

      // Format messages for Gemini API
      const formattedMessages = messages.map((msg) => {
        // Convert 'assistant' role to 'model' as expected by Gemini
        const role = msg.role === "assistant" ? "model" : msg.role
        return {
          role,
          parts: [{ text: msg.content }],
        }
      })

      // Add system prompt as the first message
      formattedMessages.unshift({
        role: "model",
        parts: [{ text: systemPrompt }],
      })

      // Prepare the request payload according to Gemini API specs
      const payload = {
        contents: formattedMessages,
        tools: [
          {
            functionDeclarations: functionSchemas.map((schema) => ({
              name: schema.name,
              description: schema.description,
              parameters: schema.parameters,
            })),
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }

      console.log("Sending request to Gemini API:", JSON.stringify(payload, null, 2))

      // Make the API request
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAYhOUTyLTLZknkApQkI62KSmzEbrmAf4Q",
        payload,
      )

      console.log("Gemini API response:", JSON.stringify(response.data, null, 2))

      // Extract the response text
      let text = ""
      let functionCall = null

      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0]

        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          // Get text from the first part
          const part = candidate.content.parts[0]
          if (part.text) {
            text = part.text
          }

          // Check for function call
          if (candidate.content.parts.some((part) => part.functionCall)) {
            const functionCallPart = candidate.content.parts.find((part) => part.functionCall)
            if (functionCallPart && functionCallPart.functionCall) {
              functionCall = {
                name: functionCallPart.functionCall.name,
                args: functionCallPart.functionCall.args || {},
              }
            }
          }
        }
      }

      return { text, functionCall }
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data)
      }
      return {
        text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      }
    }
  },

  // Execute a function call
  executeFunction: async (
    functionName: FunctionName,
    args: any,
    userAddress: string,
  ): Promise<{ success: boolean; result: string; txHash?: string }> => {
    if (!functionImplementations[functionName]) {
      return {
        success: false,
        result: `Function ${functionName} not implemented`,
      }
    }

    return await functionImplementations[functionName](args, userAddress)
  },
}
