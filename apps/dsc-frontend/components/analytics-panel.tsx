"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { BarChart3, LineChartIcon, PieChartIcon, TrendingUp } from "lucide-react"

// Mock data for charts
const dailySpendingData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Spending (DSC)",
      data: [21, 35, 18, 42, 15, 98, 32],
      backgroundColor: "rgba(16, 185, 129, 0.5)",
      borderColor: "rgb(16, 185, 129)",
      borderWidth: 2,
    },
  ],
}

const collateralGrowthData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Total Collateral Value (USD)",
      data: [1200, 1350, 1500, 1800, 2100, 2350],
      borderColor: "rgb(139, 92, 246)",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      borderWidth: 2,
      tension: 0.3,
      fill: true,
    },
  ],
}

const chainUsageData = {
  labels: ["Ethereum", "Bitcoin", "Solana"],
  datasets: [
    {
      label: "Chain Usage",
      data: [45, 25, 30],
      backgroundColor: ["rgba(97, 125, 234, 0.7)", "rgba(247, 147, 26, 0.7)", "rgba(20, 241, 149, 0.7)"],
      borderColor: ["rgb(97, 125, 234)", "rgb(247, 147, 26)", "rgb(20, 241, 149)"],
      borderWidth: 1,
    },
  ],
}

export function AnalyticsPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic">Analytics</h2>
        <p className="text-muted-foreground">Track your DSC wallet performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350.00</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">↑ 15.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card-purple">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Collateralization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">178%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">↑ 5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card-blue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              Monthly Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spending" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Spending</span>
          </TabsTrigger>
          <TabsTrigger value="collateral" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Collateral Growth</span>
          </TabsTrigger>
          <TabsTrigger value="chains" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Chain Usage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
              <CardDescription>Your DSC spending over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart
                  data={dailySpendingData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                      x: {
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collateral">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Collateral Growth</CardTitle>
              <CardDescription>Your collateral value over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LineChart
                  data={collateralGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                      x: {
                        grid: {
                          color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Chain Usage</CardTitle>
              <CardDescription>Distribution of transactions across chains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PieChart
                  data={chainUsageData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: "rgba(255, 255, 255, 0.7)",
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
