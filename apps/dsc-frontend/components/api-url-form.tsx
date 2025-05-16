"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Globe, Save, RefreshCw } from "lucide-react"
import { API_CONFIG } from "@/services/config"

export function ApiUrlForm() {
  const [apiUrl, setApiUrl] = useState(API_CONFIG.baseUrl)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load from localStorage if available
    const savedUrl = localStorage.getItem("api_base_url")
    if (savedUrl) {
      setApiUrl(savedUrl)
    }
  }, [])

  const handleSave = () => {
    setIsSaving(true)

    try {
      // Save to localStorage
      localStorage.setItem("api_base_url", apiUrl)

      toast({
        title: "API URL Saved",
        description: "The API URL has been updated. Refresh the page to apply changes.",
        variant: "default",
      })

      // Offer to refresh the page
      if (confirm("API URL saved. Refresh the page to apply changes?")) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error saving API URL:", error)
      toast({
        title: "Error",
        description: "Failed to save API URL. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = () => {
    window.open(apiUrl, "_blank")
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>Configure your backend API URL (useful for ngrok)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">API Base URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://your-ngrok-url.ngrok.io"
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Current environment variable: <code>{process.env.NEXT_PUBLIC_API_BASE_URL || "not set"}</code>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save & Apply
        </Button>
        <Button variant="outline" onClick={handleTest} className="flex-1">
          <Globe className="mr-2 h-4 w-4" />
          Test URL
        </Button>
      </CardFooter>
    </Card>
  )
}
