"use client"
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react"
import { getSystemUsage } from "@/actions/admin"
import { HardDrive, Cloud, Server, Activity, AlertCircle, RefreshCw, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SystemStatus() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSystemUsage()
      if (res.success) {
        setData(res.data)
      } else {
        setError(res.error || "Failed to load system usage")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
   
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-bold text-charcoal flex items-center gap-2 sm:gap-3">
          <Activity className="text-teal-600 shrink-0" /> System Status & Usage
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={async () => {
              toast.loading("Purging Vercel memory cache...", { id: "purgeCache" })
              try {
                const res = await fetch("/api/revalidate?secret=purge123")
                if (res.ok) {
                  toast.success("Cache completely wiped! Fetching fresh data.", { id: "purgeCache" })
                  fetchData()
                  // Reload the page to grab fresh data across the whole dashboard
                  window.location.reload()
                } else {
                  toast.error("Failed to purge cache", { id: "purgeCache" })
                }
              } catch (e) {
                toast.error("Error purging cache", { id: "purgeCache" })
              }
            }} 
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-100 text-rose-700 font-bold rounded-lg sm:rounded-xl hover:bg-rose-200 transition-colors text-xs sm:text-base"
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Purge Server Cache</span>
            <span className="sm:hidden">Purge Cache</span>
          </button>
          
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 text-charcoal font-bold rounded-lg sm:rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 text-xs sm:text-base"
          >
            <RefreshCw size={14} className={cn("sm:w-4 sm:h-4", loading ? "animate-spin" : "")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cloudinary Card */}
        <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Cloudinary Storage</h3>
              <p className="text-sm text-slate">Media & Image Hosting</p>
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          ) : data?.cloudinary ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-charcoal">Monthly Credits Used</span>
                  <span className="font-bold text-teal-600">
                    {data.cloudinary.creditsUsage} / {data.cloudinary.creditsLimit}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (data.cloudinary.creditsUsage / data.cloudinary.creditsLimit) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate mt-2">
                  1 credit = 1GB Storage, or 1GB Bandwidth, or 1000 Transformations. Plan: <strong className="text-charcoal">{data.cloudinary.plan}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm text-slate mb-1">Storage Usage</p>
                  <p className="text-xl font-bold text-charcoal">{formatBytes(data.cloudinary.storageUsage)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate mb-1">Bandwidth Usage</p>
                  <p className="text-xl font-bold text-charcoal">{formatBytes(data.cloudinary.bandwidthUsage)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Vercel Card */}
        <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <Server size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-charcoal">Vercel Hosting</h3>
                <p className="text-sm text-slate">Compute & Edge Networking</p>
              </div>
            </div>
            <a 
              href="https://vercel.com/dashboard/usage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 text-center py-3 px-6"
            >
              Open Vercel <ArrowRight size={16} />
            </a>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          ) : data?.vercel ? (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate mb-4">
                  Account connected as <strong className="text-charcoal">{data.vercel.username}</strong> ({data.vercel.email})
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate mb-1">Plan</p>
                    <p className="text-xl font-bold text-charcoal capitalize">{data.vercel.plan}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate">
                <p className="font-bold text-charcoal mb-2">Vercel {data.vercel.plan} Limits (per month):</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>100 GB</strong> Bandwidth limit</li>
                  <li><strong>100 Hours</strong> of Serverless Compute</li>
                  <li><strong>1,000,000</strong> Edge Middleware invocations</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 mt-auto">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-amber-900">
                <p className="font-bold mb-1">Vercel Token Required</p>
                <p>
                  To view Vercel limits here, you must generate a Personal Access Token in your Vercel Dashboard and add it to your <code>.env</code> file as <code>API_VERCEL_ACCESS_TOKEN</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
