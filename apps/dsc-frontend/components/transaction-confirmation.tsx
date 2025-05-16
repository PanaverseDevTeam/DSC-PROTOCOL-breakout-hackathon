"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface TransactionConfirmationProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function TransactionConfirmation({ title, description, onConfirm, onCancel }: TransactionConfirmationProps) {
  return (
    <Card className="w-full max-w-md mx-auto my-2 border-yellow-500/30 bg-yellow-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          Allow Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
