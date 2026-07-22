"use client";

import { useEffect, useState, useRef } from "react";
import { getDashboardAnalytics } from "@/actions/analytics";
import { BarChart3, Users, Tags, ShoppingBag, Smartphone, ExternalLink, Download, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from "recharts";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<"all" | "sales" | "orders" | "delivered" | "cancelled" | "returned">("all");

  useEffect(() => {
    async function loadData() {
      const res = await getDashboardAnalytics();
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { title: "Total Sales", value: `₹${data.totalSales.toLocaleString()}`, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Users", value: data.totalUsers, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Categories", value: data.totalCategories, icon: Tags, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-charcoal">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <ActivityIcon />
              Performance (Last 30 Days)
            </h3>
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
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#0d9488'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#0d9488'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => activeMetric === 'sales' ? `₹${val}` : val} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [
                    name === 'sales' || (activeMetric === 'sales') ? `₹${value}` : value, 
                    name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
                  ]}
                />
                
                {activeMetric === 'all' ? (
                  <>
                    <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2} dot={false} name="Sales" />
                    <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} name="Orders" />
                    <Line type="monotone" dataKey="delivered" stroke="#16a34a" strokeWidth={2} dot={false} name="Delivered" />
                    <Line type="monotone" dataKey="cancelled" stroke="#e11d48" strokeWidth={2} dot={false} name="Cancelled" />
                    <Line type="monotone" dataKey="returned" stroke="#d97706" strokeWidth={2} dot={false} name="Returned" />
                  </>
                ) : (
                  <Area type="monotone" dataKey={activeMetric} stroke={activeMetric === 'cancelled' || activeMetric === 'returned' ? '#e11d48' : '#0d9488'} strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
            <ActivityIcon />
            30-Day Summary
          </h3>
          <p className="text-sm text-slate mb-6">
            An overview of your store's performance over the last 30 days.
          </p>
          
          <div className="space-y-4 flex-grow">
            {(() => {
              const summary = data.chartData.reduce((acc: any, curr: any) => ({
                sales: acc.sales + curr.sales,
                orders: acc.orders + curr.orders,
                delivered: acc.delivered + curr.delivered,
                cancelled: acc.cancelled + curr.cancelled,
                returned: acc.returned + curr.returned,
              }), { sales: 0, orders: 0, delivered: 0, cancelled: 0, returned: 0 });

              return (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <span className="text-sm font-semibold text-teal-800">Total Sales</span>
                    <span className="text-sm font-black text-teal-700">₹{summary.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-sm font-semibold text-blue-800">Total Orders</span>
                    <span className="text-sm font-black text-blue-700">{summary.orders}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-sm font-semibold text-emerald-800">Delivered</span>
                    <span className="text-sm font-black text-emerald-700">{summary.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <span className="text-sm font-semibold text-rose-800">Cancelled</span>
                    <span className="text-sm font-black text-rose-700">{summary.cancelled}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-sm font-semibold text-amber-800">Returned</span>
                    <span className="text-sm font-black text-amber-700">{summary.returned}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
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
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="min-w-[200px] bg-white border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm flex justify-between items-center shadow-sm">
        <span className="text-charcoal font-semibold">{selectedLabel}</span>
        <ChevronDown size={16} className={cn("text-slate transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-2 min-w-full w-max max-h-64 overflow-y-auto no-scrollbar">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0", value === opt.value ? "border-teal-600" : "border-charcoal/20 group-hover:border-teal-600")}>
                {value === opt.value && <div className="w-2 h-2 rounded-full bg-teal-600" /> }
              </div>
              <span className={cn("text-sm transition-colors", value === opt.value ? "text-teal-700 font-bold" : "text-charcoal font-medium group-hover:text-charcoal")}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
