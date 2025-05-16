"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  MessageSquareText,
  SendHorizonal,
  BarChart3,
  Settings,
  Menu,
  X,
  Wallet,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { useWallet } from "@/contexts/wallet-context"
import { formatAddress } from "@/services/api"

// Update the NavItemProps interface to include the collapsed prop
interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  collapsed?: boolean
}

// Update the NavItem component to handle collapsed state
const NavItem = ({ href, icon: Icon, label, active, collapsed }: NavItemProps & { collapsed?: boolean }) => {
  return (
    <Link href={href} className={cn("sidebar-item", active && "active", collapsed && "justify-center")}>
      <Icon className="h-5 w-5" />
      {!collapsed && <span>{label}</span>}
      {collapsed && <div className="sidebar-tooltip">{label}</div>}
    </Link>
  )
}

// Add the wallet connection state and functions
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Add a state for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  // Use our wallet context
  const { address, isConnecting, isConnected, connectWallet, disconnectWallet } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/assistant", icon: MessageSquareText, label: "AI Assistant" },
    { href: "/transfer", icon: SendHorizonal, label: "Transfer & Utility" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  // Add a function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 right-4 z-50 rounded-full p-2 bg-secondary md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out glass-card border-r md:relative",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-20 items-center px-6 justify-between">
          <h1
            className={cn(
              "font-bold italic tracking-tight transition-all duration-300",
              isSidebarCollapsed ? "text-xl" : "text-2xl",
            )}
          >
            <span className="glow-text-purple">DSC</span>
            {!isSidebarCollapsed && <span className="glow-text-white"> Wallet</span>}
          </h1>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              collapsed={isSidebarCollapsed}
            />
          ))}
        </nav>
      </aside>

      {/* Main content with header */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-0",
        )}
      >
        {/* Header with wallet connection */}
        <header className="sticky top-0 z-30 h-16 md:h-20 w-full glass-card border-b px-4 md:px-8 flex items-center justify-between">
          {/* Theme toggle button */}
          <ThemeToggle />

          {/* Hidden button for programmatic wallet connection */}
          <button data-wallet-connect className="hidden" onClick={connectWallet} />

          {/* Wallet connection */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/10">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-sm font-medium">MetaMask</span>
                <span className="text-xs text-muted-foreground">{formatAddress(address)}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-primary/5 border-primary/10 hover:bg-primary/10"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden md:inline">Connected</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-medium">MetaMask</span>
                    <span className="text-xs text-muted-foreground">{formatAddress(address)}</span>
                  </div>
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-500/10"
                  >
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-primary/5 border-primary/10 hover:bg-primary/10 btn-glow"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </Button>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
