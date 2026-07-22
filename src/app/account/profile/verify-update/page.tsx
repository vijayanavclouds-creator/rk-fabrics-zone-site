"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { sendResetPasswordOtp, verifyResetOtp, resetPassword } from "@/actions/auth"
import { ArrowLeft, KeyRound, Lock, Send, CheckCircle2 } from "lucide-react"

export default function VerifyUpdatePassword() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState<"CAPTCHA" | "OTP" | "NEW_PASSWORD">("CAPTCHA")
  const [loading, setLoading] = useState(false)
  
  // Captcha state
  const [captchaText, setCaptchaText] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState<number>(0)
  const [userCaptcha, setUserCaptcha] = useState("")
  
  // Password state
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaText(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(num1 + num2)
    setUserCaptcha("")
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (parseInt(userCaptcha) !== captchaAnswer) {
      toast.error("Incorrect security question answer")
      generateCaptcha()
      return
    }

    if (!session?.user?.email) {
      toast.error("User email not found")
      return
    }

    setLoading(true)
    const res = await sendResetPasswordOtp(session.user.email)
    setLoading(false)

    if (res.success) {
      toast.success("Verification code sent to your email")
      setStep("OTP")
    } else {
      toast.error(res.error || "Failed to send OTP")
      generateCaptcha()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.email) {
      toast.error("User email not found")
      return
    }

    setLoading(true)
    const res = await verifyResetOtp(session.user.email, otp)
    setLoading(false)

    if (res.success) {
      toast.success("Code verified successfully")
      setStep("NEW_PASSWORD")
    } else {
      toast.error(res.error || "Invalid or expired OTP")
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (!session?.user?.email) {
      toast.error("User email not found")
      return
    }

    setLoading(true)
    
    const formData = new FormData()
    formData.append("email", session.user.email)
    formData.append("otp", otp)
    formData.append("password", password)

    const res = await resetPassword(formData)
    setLoading(false)

    if (res.success) {
      toast.success("Password updated successfully!")
      router.push("/account/profile")
    } else {
      toast.error(res.error || "Failed to update password")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm font-medium text-slate hover:text-charcoal mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-charcoal font-[family-name:var(--font-playfair)]">Update Password</h1>
          <p className="text-slate mt-2 text-sm">
            {step === "CAPTCHA" 
              ? "For security reasons, please complete the verification below." 
              : `We've sent a code to ${session?.user?.email}`}
          </p>
        </div>

        {step === "CAPTCHA" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Security Question: {captchaText}</label>
              <input 
                type="number" 
                required 
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                placeholder="Enter the result" 
                className="w-full px-4 py-3 bg-slate-50 border border-charcoal/10 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-charcoal transition-all text-center text-lg font-medium tracking-wider" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-charcoal text-white font-bold rounded-xl shadow-neo-btn hover:bg-black hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Send size={18} /> {loading ? "Sending Code..." : "Send OTP to Email"}
            </button>
          </form>
        )}

        {step === "OTP" && (
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
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal text-center tracking-widest text-lg font-bold"
                  placeholder="000000"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  generateCaptcha();
                  setStep("CAPTCHA");
                }}
                disabled={loading}
                className="text-sm font-bold text-slate hover:text-charcoal underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {step === "NEW_PASSWORD" && (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="flex items-center justify-center gap-2 mb-6 text-teal-600 bg-teal-50 py-3 rounded-xl border border-teal-100">
              <CheckCircle2 size={18} />
              <span className="font-medium text-sm">Code verified successfully</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                  placeholder="Must match password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
