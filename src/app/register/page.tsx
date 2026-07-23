"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { ArrowRight, Lock, Mail, User, KeyRound, Phone, Calendar } from "lucide-react"
import { registerUser, sendSignupOtp } from "@/actions/auth"

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS")
  const [formDataState, setFormDataState] = useState<FormData | null>(null)

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const dob = formData.get("dob") as string

    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      setLoading(false)
      return
    }

    const dobDate = new Date(dob)
    const age = new Date().getFullYear() - dobDate.getFullYear()
    if (age < 13 || isNaN(dobDate.getTime())) {
      toast.error("You must be at least 13 years old to register")
      setLoading(false)
      return
    }

    setFormDataState(formData)

    try {
      const res = await sendSignupOtp(email)
      
      if (!res.success) {
        toast.error(res.error)
      } else {
        toast.success("Verification code sent to your email")
        setStep("OTP")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const otpData = new FormData(e.currentTarget)
    const otp = otpData.get("otp") as string

    if (formDataState) {
      formDataState.append("otp", otp)
      
      try {
        const res = await registerUser(formDataState)

        if (!res.success) {
          toast.error(res.error)
        } else {
          toast.success("Account created successfully! Please sign in.")
          router.push("/login")
        }
      } catch (error) {
        toast.error("Something went wrong")
      }
    }
    
    setLoading(false)
  }

  const googleCallbackUrl = `/auth-success?to=/account`

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">

      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-2">Create Account</h1>
            <p className="text-slate">Join RK Fabrics Zone today</p>
          </div>

          {step === "DETAILS" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    name="dob"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-charcoal text-white font-bold rounded-xl shadow-neo-btn hover:bg-black hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Sending Code..." : "Continue"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-slate">
                  We've sent a verification code to <br/>
                  <strong className="text-charcoal">{formDataState?.get("email") as string}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    required
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
                {loading ? "Verifying..." : "Verify & Sign Up"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep("DETAILS")}
                  disabled={loading}
                  className="text-sm font-bold text-teal-600 hover:underline"
                >
                  Change Email or Details
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-charcoal/10 lg:w-1/4"></span>
            <span className="text-xs text-center text-slate uppercase font-bold tracking-wider">or sign in with</span>
            <span className="w-1/5 border-b border-charcoal/10 lg:w-1/4"></span>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: googleCallbackUrl })}
            className="w-full mt-6 py-3 px-4 bg-white border border-charcoal/20 text-charcoal font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center mt-6 text-slate text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-teal-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
