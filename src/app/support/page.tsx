import { SupportDashboard } from "@/app/support/support-dashboard"
import { getContactQueries } from "@/actions/contact"
import { getDashboardAnalytics } from "@/actions/analytics"
import { Suspense } from "react"
import { AdminMobileHeader } from "@/components/layout/admin-mobile-header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support Portal | RK Fabrics",
  description: "RK Fabrics Support Administration",
};

export default async function SupportPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "SUPPORT" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const queries = await getContactQueries()
  const analyticsRes = await getDashboardAnalytics()
  const analyticsData = analyticsRes.success ? analyticsRes.data : null

  return (
    <>
      <AdminMobileHeader />
      <Suspense fallback={null}>
        <SupportDashboard 
          queries={queries}
          analyticsData={analyticsData}
        />
      </Suspense>
    </>
  )
}
