"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Mail, KeyRound } from "lucide-react"
import { sendReactivationOtp, reactivateAccount } from "@/actions/user"

function ReactivateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(defaultEmail)
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL")
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    const res = await sendReactivationOtp(email)
    setLoading(false)

    if (res.success) {
      toast.success("Verification code sent to your email")
      setStep("OTP")
    } else {
      toast.error(res.error || "Failed to send code")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      toast.error("Please enter the verification code")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("email", email)
    formData.append("otp", otp)

    const res = await reactivateAccount(formData)
    setLoading(false)

    if (res.success) {
      toast.success("Account reactivated! Please log in.")
      router.push("/login")
    } else {
      toast.error(res.error || "Invalid or expired code")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-2">Reactivate Account</h1>
            <p className="text-slate">
              {step === "EMAIL" ? "Your account was deactivated. Verify your email to reactivate it." : "Enter the verification code sent to your email."}
            </p>
          </div>

          {step === "EMAIL" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-charcoal text-white font-bold rounded-xl shadow-neo-btn hover:bg-black hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Reactivating..." : "Reactivate Account"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-sm font-bold text-teal-600 hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-8 text-slate text-sm">
            <Link href="/login" className="font-bold text-charcoal hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ReactivateAccount() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReactivateContent />
    </Suspense>
  )
}
