"use client";

import { useEffect, useState } from "react";
import { getFinancialAnalytics } from "@/actions/finance";
import { DollarSign, Truck, Tags, Activity, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function FinanceManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getFinancialAnalytics();
      if (res.success) {
        setData(res.data);
      } else {
        toast.error("Failed to load financial data");
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
    { title: "Net Revenue", value: `₹${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Platform Fees", value: `₹${data.totalPlatformFees.toLocaleString()}`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Shipping Costs", value: `₹${data.totalShipping.toLocaleString()}`, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Discounts Given", value: `₹${data.totalDiscounts.toLocaleString()}`, icon: Tags, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-charcoal/10 pb-4 mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
          Finance Overview
        </h2>
        <p className="text-slate mt-1 text-sm">Monitor revenue, fees, and transactions.</p>
      </div>

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

      <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-charcoal/10">
          <h3 className="text-lg font-bold text-charcoal">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-dark/30 border-b border-charcoal/10">
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider">Transaction ID</th>
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider">Date</th>
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider">Status</th>
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider text-right">Revenue</th>
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider text-right">Shipping</th>
                <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider text-right">Fee</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-charcoal/5 hover:bg-slate-50 transition-colors">
                  <td className="p-5 align-middle">
                    <span className="font-mono text-sm text-charcoal">#{tx.id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="p-5 align-middle">
                    <span className="text-slate">{new Date(tx.date).toLocaleDateString()}</span>
                  </td>
                  <td className="p-5 align-middle">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{tx.status}</span>
                  </td>
                  <td className="p-5 align-middle text-right">
                    <span className="font-medium text-emerald-600">₹{tx.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-5 align-middle text-right">
                    <span className="font-medium text-amber-600">₹{tx.shipping.toLocaleString()}</span>
                  </td>
                  <td className="p-5 align-middle text-right">
                    <span className="font-medium text-blue-600">₹{tx.fee.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
