"use client";

import { useEffect, useState, useRef } from "react";
import { getDashboardAnalytics, getChartData } from "@/actions/analytics";
import { BarChart3, Users, Tags, ShoppingBag, Server, Settings, Image as ImageIcon, Mail, FileText, CheckCircle2, ChevronDown, Activity, Clock, Box, ShieldQuestion, Coins, Network, User as UserIcon, Ticket, Package, Truck, RotateCcw, XCircle, DollarSign, Pencil } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function DashboardOverview({ initialData, isSupport = false }: { initialData?: any; isSupport?: boolean }) {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<"all" | "sales" | "orders" | "delivered" | "cancelled" | "returned">("all");
  const [timeRange, setTimeRange] = useState<string>("30");
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    async function loadChartData() {
      const res = await getChartData(parseInt(timeRange));
      if (res.success && res.chartData) {
        setData((prev: any) => ({ ...prev, chartData: res.chartData }));
      }
    }
    loadChartData();
  }, [timeRange]);

  useEffect(() => {
    if (!initialData) {
      async function loadData() {
        const res = await getDashboardAnalytics();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "Failed to load dashboard data");
        }
      }
      loadData();
    }
  }, [initialData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <p className="text-rose-500 font-bold">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-charcoal text-white rounded-lg">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  // Derive some placeholder metrics for management cards based on existing data to make them feel alive
  const activeSKUs = data.totalProducts || 0;
  const outOfStock = data.outOfStockProducts || 0;
  
  const counts = data.orderStatusCounts || {};
  const pendingOrders = counts.pending || 0;
  const shippedOrders = counts.shipped || 0;
  const deliveredOrders = counts.delivered || 0;
  const returnedOrders = counts.returned || 0;
  const cancelledOrders = counts.cancelled || 0;

  const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300", className)}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-[#fdfaf6] to-blue-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Welcome Header */}
        <GlassCard className="flex items-center justify-between gap-4 bg-white/90">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h1 className="text-2xl font-black text-charcoal tracking-tight">Welcome, {session?.user?.name || "Admin"}</h1>
              <p className="text-slate">{session?.user?.email}</p>
            </div>
          </div>
          
          <Link href="/account/profile">
            <button title="Edit Profile" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-charcoal rounded-xl transition-colors border border-charcoal/5 shadow-sm group">
              <Pencil size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </Link>
        </GlassCard>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN */}
          {!isSupport && (
            <div className="xl:col-span-3 space-y-6">
              <Link href="/admin?tab=system" className="block">
              <GlassCard className="group cursor-pointer hover:bg-white/95">
                <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-4 flex items-center justify-between">
                  System Status <Activity size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 group-hover:bg-blue-100 transition-colors">
                      <Server size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal text-lg">99.9%</p>
                      <p className="text-xs text-slate">Uptime</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </GlassCard>
            </Link>

            <Link href="/admin?tab=navigation" className="block">
              <GlassCard className="flex items-center justify-between group cursor-pointer hover:bg-white/95">
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">Navigation Settings</h3>
                <div className="p-2 text-teal-600 group-hover:rotate-45 transition-transform duration-500">
                  <Settings size={22} />
                </div>
              </GlassCard>
            </Link>

            <Link href="/admin?tab=taxonomy" className="block mt-6">
              <GlassCard className="flex items-center justify-between group cursor-pointer hover:bg-white/95">
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">Taxonomy Settings</h3>
                <div className="p-2 text-purple-600 group-hover:rotate-45 transition-transform duration-500">
                  <Network size={22} />
                </div>
              </GlassCard>
            </Link>

            {/* System Activity Feed */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate uppercase tracking-wider">System Activity Feed</h3>
                <Clock size={16} className="text-slate/50" />
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {data.activities && data.activities.length > 0 ? (
                  <>
                    {data.activities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex gap-3 relative">
                        <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0 relative z-10 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                        <div className="absolute left-[3px] top-4 w-px h-full bg-slate-200 -z-0"></div>
                        <div className="pb-2 w-full">
                          <p className="text-sm text-charcoal">
                            <span className="font-bold">{activity.adminName}</span> <span dangerouslySetInnerHTML={{ __html: activity.action }} />
                          </p>
                          <p className="text-xs text-slate mt-0.5">
                            {new Date(activity.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} at {new Date(activity.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}
                          </p>
                          {activity.details && (
                            <div className="mt-2 text-xs text-slate-600 bg-cream-dark/30 p-2.5 rounded-lg border border-charcoal/5 whitespace-pre-wrap font-mono shadow-inner">
                              {activity.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {data.activities.length > 5 && (
                      <Link 
                        href="/admin?tab=activities"
                        className="block w-full text-center py-2.5 mt-2 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-100 transition-colors uppercase tracking-wider"
                      >
                        View All
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate text-center py-4">No recent activity logged.</p>
                )}
              </div>
            </GlassCard>
          </div>
          )}

          {/* CENTER COLUMN (Main Metrics & Graph) */}
          <div className={cn("space-y-6", isSupport ? "xl:col-span-12" : "xl:col-span-6")}>
            {/* 4 Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin?tab=orders" className="block cursor-pointer">
                <GlassCard className="bg-gradient-to-br from-blue-50/50 to-transparent border-blue-100/50 p-4 h-full hover:shadow-md hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                      <BarChart3 size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate uppercase">Total Sales</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-charcoal tracking-tight">₹{data.totalSales?.toLocaleString()}</h3>
                </GlassCard>
              </Link>
              
              <Link href="/admin?tab=newsletters" className="block cursor-pointer">
                <GlassCard className="bg-gradient-to-br from-emerald-50/50 to-transparent border-emerald-100/50 p-4 h-full hover:shadow-md hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Users size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate uppercase">Subscribers</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-charcoal tracking-tight">{data.totalSubscribers || 0}</h3>
                </GlassCard>
              </Link>

              <Link href="/admin?tab=finance" className="block cursor-pointer">
                <GlassCard className="bg-gradient-to-br from-amber-50/50 to-transparent border-amber-100/50 p-4 h-full hover:shadow-md hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                      <Ticket size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate uppercase">Discount Given</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-charcoal tracking-tight">₹{(data.totalDiscounts || 0).toLocaleString()}</h3>
                </GlassCard>
              </Link>

              <Link href="/admin?tab=taxonomy" className="block cursor-pointer">
                <GlassCard className="bg-gradient-to-br from-purple-50/50 to-transparent border-purple-100/50 p-4 h-full hover:shadow-md hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                      <Tags size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate uppercase">Categories</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-charcoal tracking-tight">{data.totalCategories}</h3>
                </GlassCard>
              </Link>
            </div>

            {/* Main Graph */}
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30 -z-10 pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-50">
                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                  <Activity size={20} className="text-teal-600" />
                  Performance ({timeRange === "365" ? "Last 1 Year" : timeRange === "730" ? "Last 2 Years" : timeRange === "1095" ? "Last 3 Years" : timeRange === "1460" ? "Last 4 Years" : timeRange === "1825" ? "Last 5 Years" : `Last ${timeRange} Days`})
                </h3>
                <div className="flex items-center gap-3">
                  <MetricSelect 
                    value={timeRange}
                    onChange={(val) => setTimeRange(val)}
                    options={[
                      { value: "30", label: "Last 30 Days" },
                      { value: "45", label: "Last 45 Days" },
                      { value: "60", label: "Last 60 Days" },
                      { value: "90", label: "Last 90 Days" },
                      { value: "365", label: "Last 1 Year" },
                      { value: "730", label: "Last 2 Years" },
                      { value: "1095", label: "Last 3 Years" },
                      { value: "1460", label: "Last 4 Years" },
                      { value: "1825", label: "Last 5 Years" },
                    ]}
                  />
                  <MetricSelect 
                    value={activeMetric}
                    onChange={(val) => setActiveMetric(val as any)}
                    options={[
                      { value: "all", label: "All Metrics" },
                      { value: "sales", label: "Sales (₹)" },
                      { value: "orders", label: "Orders" },
                      { value: "delivered", label: "Delivered Orders" },
                      { value: "cancelled", label: "Cancelled Orders" },
                      { value: "returned", label: "Returned Orders" },
                    ]}
                  />
                </div>
              </div>
              <div className="h-[280px] w-full relative z-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#3b82f6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#3b82f6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} minTickGap={20} />
                    
                    {/* Left Axis for Sales/Money */}
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
                    
                    {/* Right Axis for Counts (Orders, Users, etc) */}
                    {activeMetric === 'all' && (
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    )}

                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.15)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                      formatter={(value: any, name: any) => [
                        name === 'sales' || (activeMetric === 'sales') ? `₹${value.toLocaleString()}` : value, 
                        name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
                      ]}
                    />
                    
                    {activeMetric === 'all' ? (
                      <>
                        <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="sales" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={false} name="orders" />
                        <Line yAxisId="right" type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} dot={false} name="delivered" strokeDasharray="5 5" />
                        <Line yAxisId="right" type="monotone" dataKey="cancelled" stroke="#f43f5e" strokeWidth={2} dot={false} name="cancelled" strokeDasharray="5 5" />
                      </>
                    ) : (
                      <Area yAxisId="left" type="monotone" dataKey={activeMetric} stroke={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#0d9488'} strokeWidth={3} fillOpacity={1} fill={activeMetric === 'sales' ? "url(#colorSales)" : "url(#colorMetric)"} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Content & Promo and Finance */}
            {!isSupport && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Link href="/admin?tab=finance" className="block">
                  <GlassCard className="flex flex-col gap-4 items-center justify-center h-full group cursor-pointer hover:bg-white/95 transition-colors p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shrink-0 flex items-center justify-center text-white shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform duration-300">
                      <DollarSign size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-charcoal tracking-tight mb-1">Finance Management</h3>
                      <p className="text-xs text-slate">Track revenue, payouts, fees, and reports.</p>
                    </div>
                  </GlassCard>
                </Link>

                <GlassCard>
                  <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-4">Content & Promo</h3>
                  <div className="flex flex-col gap-3">
                    <Link href="/admin?tab=banners" className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white/95 rounded-xl border border-charcoal/5 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shrink-0 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <ImageIcon size={22} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-charcoal block">Banner Management</span>
                        <span className="text-[10px] text-slate">Manage homepage banners</span>
                      </div>
                    </Link>
                    <Link href="/admin?tab=newsletters" className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white/95 rounded-xl border border-charcoal/5 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shrink-0 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Mail size={22} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-charcoal block">Newsletter Studio</span>
                        <span className="text-[10px] text-slate">Manage subscribers</span>
                      </div>
                    </Link>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-3 space-y-6">
            {!isSupport && (
              <GlassCard className="group">
                <Link href="/admin?tab=list" className="block cursor-pointer hover:bg-white/50 transition-colors rounded-xl -m-2 p-2 mb-2">
                  <h3 className="text-xs font-bold text-slate uppercase tracking-wider flex items-center justify-between">
                    Product Management <Box size={16} className="text-teal-600 group-hover:scale-110 transition-transform" />
                  </h3>
                </Link>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <Link href="/admin?tab=list" className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Box size={14} className="text-slate/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Total</p>
                    </div>
                    <p className="text-lg font-black text-charcoal">{activeSKUs}</p>
                  </Link>
                  <Link href="/admin?tab=list" className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={14} className="text-slate/70" />
                      <p className="text-[9px] text-slate font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis">Recent</p>
                    </div>
                    <p className="text-lg font-black text-charcoal">{data.recentProducts || 0}</p>
                  </Link>
                  <Link href="/admin?tab=list" className="bg-rose-50 rounded-lg p-2 hover:bg-rose-100 transition-colors flex flex-col items-center border border-rose-100/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <XCircle size={14} className="text-rose-400" />
                      <p className="text-[9px] text-rose-600 font-bold uppercase whitespace-nowrap overflow-hidden text-ellipsis">Out of Stock</p>
                    </div>
                    <p className="text-lg font-black text-rose-600">{outOfStock}</p>
                  </Link>
                </div>
              </GlassCard>
            )}

            <Link href={isSupport ? "/support?tab=orders" : "/admin?tab=orders"} className="block">
              <GlassCard className="group cursor-pointer hover:bg-white/95 transition-colors">
                <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-4 flex items-center justify-between">
                  Order Management <ShoppingBag size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingBag size={14} className="text-emerald-600/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Orders</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{data.totalOrders}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={14} className="text-amber-500/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Pending</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{pendingOrders}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck size={14} className="text-blue-500/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Shipped</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{shippedOrders}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} className="text-teal-500/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Delivered</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{deliveredOrders}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <RotateCcw size={14} className="text-orange-500/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Returned</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{returnedOrders}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <XCircle size={14} className="text-rose-500/70" />
                      <p className="text-[9px] text-slate font-bold uppercase">Cancelled</p>
                    </div>
                    <p className="text-base font-black text-charcoal">{cancelledOrders}</p>
                  </div>
                </div>
              </GlassCard>
            </Link>

            {/* User Management */}
            <Link href={isSupport ? "/support?tab=users" : "/admin?tab=users"} className="block">
              <GlassCard className="group cursor-pointer hover:bg-white/95 transition-colors">
                <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-3 flex items-center justify-between">
                  User Management <Users size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors">
                    <p className="text-[10px] text-slate font-bold uppercase mb-1">Total Users</p>
                    <p className="text-xl font-black text-charcoal">{data.totalUsers}</p>
                  </div>
                  <div className="bg-charcoal/5 rounded-lg p-2 hover:bg-charcoal/10 transition-colors">
                    <p className="text-[10px] text-slate font-bold uppercase mb-1">New (7 Days)</p>
                    <p className="text-xl font-black text-charcoal">{data.newUsersLast7Days || 0}</p>
                  </div>
                </div>
              </GlassCard>
            </Link>

            {/* Query Management */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate uppercase tracking-wider">Recent Queries</h3>
                <ShieldQuestion size={16} className="text-amber-600" />
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {data.recentUnsolvedQueries && data.recentUnsolvedQueries.length > 0 ? (
                  <>
                    {data.recentUnsolvedQueries.map((query: any) => (
                      <Link href={isSupport ? `/support/queries/${query.id}` : `/admin/queries/${query.id}`} key={query.id} className="flex gap-3 relative group block">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 relative z-10 shadow-[0_0_8px_rgba(245,158,11,0.6)] group-hover:scale-150 transition-transform"></div>
                        <div className="absolute left-[3px] top-4 w-px h-full bg-slate-200 -z-0"></div>
                        <div className="pb-2 w-full">
                          <p className="text-sm text-charcoal font-bold">{query.name}</p>
                          <p className="text-xs text-slate line-clamp-1">{query.subject}</p>
                          <p className="text-[10px] text-slate/70 mt-1">
                            {new Date(query.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      href={isSupport ? "/support?tab=queries" : "/admin?tab=queries"}
                      className="block w-full text-center py-2.5 mt-2 bg-amber-50 text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors uppercase tracking-wider"
                    >
                      View All
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-slate text-center py-4">No open queries.</p>
                )}
              </div>
            </GlassCard>

            {!isSupport && (
              <>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const MetricSelect = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label || "Select metric..."

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-[180px] bg-white/60 backdrop-blur border border-white rounded-xl px-4 py-2 hover:bg-white/90 transition-colors outline-none text-sm flex justify-between items-center shadow-sm text-charcoal font-semibold">
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={cn("text-slate transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-xl border border-charcoal/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 p-2 w-full max-h-64 overflow-y-auto no-scrollbar">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }} className="w-full text-left flex items-center px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
              <span className={cn("text-sm transition-colors truncate", value === opt.value ? "text-teal-700 font-bold" : "text-charcoal font-medium group-hover:text-teal-600")}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
