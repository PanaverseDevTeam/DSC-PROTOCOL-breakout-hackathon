import { DashboardLayout } from "@/components/dashboard-layout"
import { WalletDashboard } from "@/components/wallet-dashboard"
import { CollateralDetails } from "@/components/collateral-details"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <WalletDashboard />
        <CollateralDetails />
      </div>
    </DashboardLayout>
  )
}
