import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsPanel } from "@/components/settings-panel"
import { ApiUrlForm } from "@/components/api-url-form"
import { TestTokenMinting } from "@/components/test-token-minting"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SettingsPanel />
        <TestTokenMinting />
        <ApiUrlForm />
      </div>
    </DashboardLayout>
  )
}
