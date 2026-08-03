"use client";

import { useEffect, useState } from "react";
import { getFinancialAnalytics } from "@/actions/finance";
import { DollarSign, Truck, Tags, Activity, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function FinanceManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txnPage, setTxnPage] = useState(1);

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

  const txnsPerPage = 10;
  const totalTxnPages = Math.ceil((data.transactions?.length || 0) / txnsPerPage);
  const paginatedTxns = (data.transactions || []).slice((txnPage - 1) * txnsPerPage, txnPage * txnsPerPage);

  return (
    <div className="space-y-3 md:space-y-4 animate-in fade-in duration-300">
      <div className="border-b border-charcoal/10 pb-4 mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
          Finance Overview
        </h2>
        <p className="text-slate mt-1 text-sm">Monitor revenue, fees, and transactions.</p>
      </div>

      <div className="grid grid-cols-11 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className={`bg-white pl-3 pr-2 py-2 md:p-6 rounded-full md:rounded-2xl border border-charcoal/10 shadow-sm flex items-center justify-start gap-2 md:gap-4 ${
              idx === 0 ? 'col-span-6 md:col-span-1' : 
              idx === 1 ? 'col-span-5 md:col-span-1' : 
              idx === 2 ? 'col-span-5 md:col-span-1' : 
              'col-span-6 md:col-span-1'
            }`}
          >
            <div className={`w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-[9.5px] md:text-sm font-bold text-slate uppercase tracking-wide md:tracking-wider truncate">{stat.title}</p>
              <h3 className="text-xs md:text-2xl font-black text-charcoal truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="-mx-4 md:mx-0 bg-white rounded-none md:rounded-3xl border-y md:border border-charcoal/10 shadow-sm overflow-hidden">
        <div className="p-3 md:px-6 md:py-3 border-b border-charcoal/10">
          <h3 className="text-base md:text-lg font-bold text-charcoal">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-dark/30 border-b border-charcoal/10">
                <th className="p-2 md:px-5 md:py-2.5 font-bold text-charcoal text-[9px] md:text-xs uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th className="p-2 md:px-5 md:py-2.5 font-bold text-charcoal text-[9px] md:text-xs uppercase tracking-wider">Date & Time</th>
                <th className="p-2 md:px-5 md:py-2.5 font-bold text-charcoal text-[9px] md:text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="p-2 md:px-5 md:py-2.5 font-bold text-charcoal text-[9px] md:text-xs uppercase tracking-wider">Txn ID</th>
                <th className="p-2 md:px-5 md:py-2.5 font-bold text-charcoal text-[9px] md:text-xs uppercase tracking-wider text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTxns.map((tx: any) => (
                <tr key={tx.id} className="border-b border-charcoal/5 hover:bg-slate-50 transition-colors">
                  <td className="p-2 md:px-5 md:py-2.5 align-middle">
                    <Link href={`/admin/orders/user/${tx.userId}?expanded=${tx.id}`} className="font-mono text-[10px] md:text-sm text-[#1e5b7c] font-semibold hover:underline whitespace-nowrap block">
                      #{tx.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="p-2 md:px-5 md:py-2.5 align-middle">
                    <span className="text-[9px] md:text-sm text-slate block leading-tight">
                      {new Date(tx.date).toLocaleDateString('en-GB')} <br className="md:hidden" /> {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="p-2 md:px-5 md:py-2.5 align-middle">
                    <span className="text-[8px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-slate-100 text-slate-600 whitespace-nowrap">
                      {tx.transactionStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-2 md:px-5 md:py-2.5 align-middle max-w-[60px] md:max-w-none">
                    <span className="font-mono text-[9px] md:text-sm text-charcoal truncate block">
                      {tx.transactionId || 'N/A'}
                    </span>
                  </td>
                  <td className="p-2 md:px-5 md:py-2.5 align-middle text-right">
                    <span className="text-[10px] md:text-sm font-medium text-emerald-600 whitespace-nowrap">₹{tx.amount.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalTxnPages > 1 && (
          <div className="p-4 flex items-center justify-center gap-2 bg-white border-t border-charcoal/10">
            <button 
              onClick={() => setTxnPage(p => Math.max(1, p - 1))}
              disabled={txnPage === 1}
              className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center px-3 font-medium text-xs text-charcoal">
              Page {txnPage} of {totalTxnPages}
            </div>
            <button 
              onClick={() => setTxnPage(p => Math.min(totalTxnPages, p + 1))}
              disabled={txnPage === totalTxnPages}
              className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
