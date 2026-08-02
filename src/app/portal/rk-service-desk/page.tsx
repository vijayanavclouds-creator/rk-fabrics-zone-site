"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Lock, Mail, KeyRound, Loader2, CheckCircle2, Sparkles, Headphones, Send } from "lucide-react"
import { sendStaffLoginOtp } from "@/actions/auth"

export default function ServiceDeskPage() {
  const router = useRouter()
  const [emailInput, setEmailInput] = useState("")
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleGenerateOtp = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid staff email address first.")
      return
    }

    setSendingOtp(true)
    setError(null)
    try {
      const res = await sendStaffLoginOtp(emailInput, "SUPPORT")
      if (!res.success) {
        toast.error(res.error || "Failed to send verification code.")
        setError(res.error || "Failed to send verification code.")
      } else {
        toast.success("Verification code sent to your staff email inbox!")
        setCooldown(60)
      }
    } catch (err: any) {
      console.error("OTP Generation Exception:", err)
      toast.error(err.message || String(err) || "Something went wrong generating OTP.")
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("verifying")
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const otp = formData.get("otp") as string

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp,
        portalType: "support",
      })

      if (res?.error) {
        setError(res.error)
        toast.error(res.error)
        setStatus("idle")
      } else {
        setStatus("success")
        toast.success("Staff Identity & OTP Verified!")
        window.location.href = "/support"
      }
    } catch (err) {
      setError("Authentication gateway error.")
      setStatus("idle")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white animate-in fade-in duration-700 relative overflow-hidden font-[family-name:var(--font-inter)]">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping duration-1000" />
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <CheckCircle2 size={36} className="animate-in zoom-in duration-500" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span>Staff Desk Access</span>
                <Sparkles size={20} className="text-blue-400 animate-pulse" />
              </h3>
              <p className="text-slate-300 text-sm font-medium">
                2FA OTP Verified. Opening Service Desk Portal...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
              <Loader2 size={14} className="animate-spin" />
              <span>Redirecting to Support Desk...</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center p-4 py-20 relative z-10">
        <div className="w-full max-w-md bg-slate-950/90 backdrop-blur-md rounded-3xl border border-slate-800 p-8 shadow-2xl shadow-black/80 relative">
          <div className="flex items-center justify-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest bg-blue-500/10 py-1.5 px-3 rounded-full border border-blue-500/20 w-fit mx-auto mb-6">
            <Headphones size={14} />
            <span>Authorized Service Desk</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-white tracking-wide mb-2">Support Portal</h1>
            <p className="text-slate-400 text-sm">Customer Helpdesk & Order Assistance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">Staff Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={status !== "idle"}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white disabled:opacity-50"
                  placeholder="support@rkfabricszone.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">Staff Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={status !== "idle"}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">2FA Verification Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength={6}
                    disabled={status !== "idle"}
                    className="w-full pl-11 pr-3 py-3 rounded-xl border border-slate-800 bg-slate-900/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white text-center tracking-widest font-bold disabled:opacity-50"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateOtp}
                  disabled={sendingOtp || status !== "idle" || cooldown > 0}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-blue-900/30 text-xs sm:text-sm"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <span>Resend in {cooldown}s</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Generate OTP</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Enter your email above and click Generate OTP to receive your 6-digit staff code.
              </p>
            </div>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed mt-4"
            >
              {status === "verifying" ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Verifying Credentials & OTP...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 size={18} className="text-white animate-in zoom-in" />
                  <span>Verified! Opening Desk...</span>
                </>
              ) : (
                <>
                  <span>Verify & Access Desk</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center mt-3 animate-in fade-in">
                {error}
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              🎧 Support Desk Activity Logged & Monitored
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
