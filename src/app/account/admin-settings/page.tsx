import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminSettingsForm from "./admin-settings-form"
import { PortalHeader } from "@/components/layout/portal-header"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/account")
  }

  // Get current threshold
  const settings = await prisma.adminSettings.findFirst()
  const threshold = settings?.lateShippingThresholdHours || 6

  return (
    <>
      <PortalHeader 
        title="Admin Dashboard" 
        description="Configure system alerts and thresholds." 
      />
      <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">
          Alert Settings
        </h2>
        <AdminSettingsForm initialThreshold={threshold} />
      </div>
    </>
  )
}
