"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import { DashboardOverview } from "@/app/admin/dashboard-overview"
import { OrdersManager } from "@/app/admin/orders-manager"
import { QueriesManager } from "@/app/admin/queries-manager"
import { AdminProfile } from "@/app/admin/admin-profile"
import { PortalHeader } from "@/components/layout/portal-header"

export function SupportDashboard({ 
  queries = [],
  analyticsData = null
}: { 
  queries?: any[],
  analyticsData?: any
}) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as any
  const targetView = ["overview", "orders", "queries", "profile"].includes(tabParam) ? tabParam : "overview"
  
  const [activeView, setActiveView] = useState<any>(targetView)
  const [prevTabParam, setPrevTabParam] = useState(tabParam)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sync state synchronously during render when URL changes to prevent flashing old tab
  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam)
    setActiveView(targetView)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-[85px] md:pt-[105px]">
      <PortalHeader 
        title="Support Portal" 
        onMenuClick={() => setSidebarOpen(true)} 
        basePath="/support"
      />

      <div className="flex flex-1 w-full max-w-[1920px] mx-auto overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-charcoal/20 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative top-[85px] md:top-0 left-0 h-[calc(100vh-85px)] md:h-auto 
          w-[280px] bg-white border-r border-charcoal/10 flex-shrink-0 z-50
          transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="p-4 md:p-6 space-y-2 h-full overflow-y-auto custom-scrollbar">
            <h2 className="text-xs font-bold text-slate uppercase tracking-wider mb-4 px-4 hidden md:block">Support Panel</h2>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveView("overview"); window.history.pushState(null, '', '/support?tab=overview'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === "overview" ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" : "text-slate hover:bg-slate-50 hover:text-charcoal"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setActiveView("orders"); window.history.pushState(null, '', '/support?tab=orders'); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === "orders" ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" : "text-slate hover:bg-slate-50 hover:text-charcoal"
                }`}
              >
                Orders Directory
              </button>
              <button
                onClick={() => { setActiveView("queries"); window.history.pushState(null, '', '/support?tab=queries'); setSidebarOpen(false) }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === "queries" ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" : "text-slate hover:bg-slate-50 hover:text-charcoal"
                }`}
              >
                <div className="flex items-center gap-3">
                  Customer Queries
                </div>
                {queries && queries.filter(q => q.status !== 'RESOLVED').length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeView === 'queries' ? 'bg-white text-teal-600' : 'bg-rose-100 text-rose-700'}`}>
                    {queries.filter(q => q.status !== 'RESOLVED').length}
                  </span>
                )}
              </button>
            </div>

            <div className="pt-4 mt-4 border-t border-charcoal/10">
              <button
                onClick={() => signOut({ callbackUrl: "/portal/rk-service-desk" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-all"
              >
                <LogOut size={18} />
                <span>Log Out of Desk</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeView === "overview" && (
              <DashboardOverview 
                initialData={analyticsData}
                isSupport={true}
              />
            )}
            
            {activeView === "orders" && (
              <OrdersManager readOnly={true} basePath="/support" />
            )}

            {activeView === "queries" && (
              <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal">Customer Queries</h2>
                  <p className="text-slate mt-2">Manage customer support tickets.</p>
                </div>
                <QueriesManager initialQueries={queries} basePath="/support" />
              </div>
            )}

            {activeView === "profile" && <AdminProfile />}
          </div>
        </main>
      </div>
    </div>
  )
}
