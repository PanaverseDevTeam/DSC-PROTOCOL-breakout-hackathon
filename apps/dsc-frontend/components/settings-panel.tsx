"use client"

import { useState } from "react"
import { Mail, Shield, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function SettingsPanel() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [email, setEmail] = useState("user@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const { toast } = useToast()

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked)

    toast({
      title: checked ? "2FA Enabled" : "2FA Disabled",
      description: checked
        ? "Two-factor authentication has been enabled"
        : "Two-factor authentication has been disabled",
      variant: "default",
    })
  }

  const handleEmailUpdate = () => {
    toast({
      title: "Email Updated",
      description: `Your email has been updated to ${email}`,
      variant: "default",
    })
  }

  const handlePhoneUpdate = () => {
    toast({
      title: "Phone Number Updated",
      description: `Your phone number has been updated to ${phone}`,
      variant: "default",
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic">Settings</h2>
        <p className="text-muted-foreground">Manage your wallet preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Settings */}
        <Card className="glass-card-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Manage your wallet security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your wallet</p>
              </div>
              <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for important wallet activities</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message alerts for important wallet activities
                </p>
              </div>
              <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="glass-card-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Manage your contact details for notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={handleEmailUpdate}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={handlePhoneUpdate}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
