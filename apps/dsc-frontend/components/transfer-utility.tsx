"use client"

import { useState } from "react"
import { SendHorizonal, Receipt, Home, Phone, CreditCard, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function TransferUtility() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [billCountry, setBillCountry] = useState("")
  const [billProvider, setBillProvider] = useState("")
  const [billAmount, setBillAmount] = useState("")
  const [rentAmount, setRentAmount] = useState("")
  const [mobileProvider, setMobileProvider] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [mobileAmount, setMobileAmount] = useState("")
  const { toast } = useToast()

  const handleTransfer = () => {
    if (!transferAmount || !recipientAddress) return

    setIsProcessing(true)

    setTimeout(() => {
      const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)

      toast({
        title: "Transfer Simulated",
        description: `Sent ${transferAmount} DSC to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}. Tx: ${txHash}`,
        variant: "default",
      })

      setTransferAmount("")
      setRecipientAddress("")
      setIsProcessing(false)
    }, 2000)
  }

  const handleBillPayment = () => {
    if (!billAmount || !billProvider || !billCountry) return

    setIsProcessing(true)

    setTimeout(() => {
      const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)

      toast({
        title: "Bill Payment Simulated",
        description: `Paid ${billAmount} DSC to ${billProvider}. Tx: ${txHash}`,
        variant: "default",
      })

      setBillAmount("")
      setBillProvider("")
      setBillCountry("")
      setIsProcessing(false)
    }, 2000)
  }

  const handleRentPayment = () => {
    if (!rentAmount) return

    setIsProcessing(true)

    setTimeout(() => {
      const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)

      toast({
        title: "Rent Payment Simulated",
        description: `Paid ${rentAmount} DSC for rent. Tx: ${txHash}`,
        variant: "default",
      })

      setRentAmount("")
      setIsProcessing(false)
    }, 2000)
  }

  const handleMobileTopup = () => {
    if (!mobileAmount || !mobileProvider || !mobileNumber) return

    setIsProcessing(true)

    setTimeout(() => {
      const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)

      toast({
        title: "Mobile Top-up Simulated",
        description: `Topped up ${mobileNumber} with ${mobileAmount} DSC. Tx: ${txHash}`,
        variant: "default",
      })

      setMobileAmount("")
      setMobileProvider("")
      setMobileNumber("")
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic">Transfer & Utility</h2>
        <p className="text-muted-foreground">Send DSC or pay for services</p>
      </div>

      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <SendHorizonal className="h-4 w-4" />
            <span className="hidden sm:inline">Transfer</span>
          </TabsTrigger>
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Bills</span>
          </TabsTrigger>
          <TabsTrigger value="rent" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Rent</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
        </TabsList>

        {/* Transfer Tab */}
        <TabsContent value="transfer">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SendHorizonal className="h-5 w-5" />
                Send DSC
              </CardTitle>
              <CardDescription>Transfer DSC to another wallet address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (DSC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Network</Label>
                <RadioGroup defaultValue="auto" className="flex">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto">Auto (Optimal)</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="ethereum" id="ethereum" />
                    <Label htmlFor="ethereum">Ethereum</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="solana" id="solana" />
                    <Label htmlFor="solana">Solana</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleTransfer}
                disabled={isProcessing || !transferAmount || !recipientAddress}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Send DSC
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Pay Utility Bill
              </CardTitle>
              <CardDescription>Pay electricity, water, gas, or internet bills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={billCountry} onValueChange={setBillCountry}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Service Provider</Label>
                <Select value={billProvider} onValueChange={setBillProvider}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electric">Pacific Electric Co.</SelectItem>
                    <SelectItem value="water">City Water Services</SelectItem>
                    <SelectItem value="gas">National Gas</SelectItem>
                    <SelectItem value="internet">Fiber Internet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-amount">Amount (DSC)</Label>
                <Input
                  id="bill-amount"
                  type="number"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleBillPayment}
                disabled={isProcessing || !billAmount || !billProvider || !billCountry}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Bill
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Rent Tab */}
        <TabsContent value="rent">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Pay Rent
              </CardTitle>
              <CardDescription>Pay your monthly rent or mortgage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rent-amount">Amount (DSC)</Label>
                <Input
                  id="rent-amount"
                  type="number"
                  placeholder="0.00"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <RadioGroup defaultValue="rent" className="flex">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rent" id="rent-type" />
                    <Label htmlFor="rent-type">Rent</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="mortgage" id="mortgage" />
                    <Label htmlFor="mortgage">Mortgage</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Recurring Payment</Label>
                <RadioGroup defaultValue="no" className="flex">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-recurring" />
                    <Label htmlFor="no-recurring">One-time</Label>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <RadioGroupItem value="yes" id="yes-recurring" />
                    <Label htmlFor="yes-recurring">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRentPayment} disabled={isProcessing || !rentAmount} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Pay Rent
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Mobile Top-up
              </CardTitle>
              <CardDescription>Add credit to your mobile phone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-provider">Service Provider</Label>
                <Select value={mobileProvider} onValueChange={setMobileProvider}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verizon">Verizon</SelectItem>
                    <SelectItem value="att">AT&T</SelectItem>
                    <SelectItem value="tmobile">T-Mobile</SelectItem>
                    <SelectItem value="sprint">Sprint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-number">Phone Number</Label>
                <Input
                  id="mobile-number"
                  placeholder="(123) 456-7890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-amount">Amount (DSC)</Label>
                <Input
                  id="mobile-amount"
                  type="number"
                  placeholder="0.00"
                  value={mobileAmount}
                  onChange={(e) => setMobileAmount(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleMobileTopup}
                disabled={isProcessing || !mobileAmount || !mobileProvider || !mobileNumber}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Top-up
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
