"use client"

import { useState, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Lock, Mail } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const callbackUrl = searchParams.get("from") || "/shop"
  const googleCallbackUrl = `/auth-success?to=${encodeURIComponent(callbackUrl)}`

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      })

      if (res?.error) {
        if (res.error === "AccountDeactivated") {
          router.push(`/reactivate?email=${encodeURIComponent(email)}`)
        } else {
          setError("Invalid email or password")
          setLoading(false)
        }
      } else {
        const session = await getSession()
        const url = session?.user?.role === "ADMIN" ? "/admin" : callbackUrl
        router.push(url)
        router.refresh()
      }
    } catch (err) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">

      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-2">Welcome Back</h1>
            <p className="text-slate">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm font-bold text-charcoal mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <Link href="/forgot-password" className="text-xs font-bold text-teal-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-charcoal text-white font-bold rounded-xl shadow-neo-btn hover:bg-black hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
            {error && (
              <p className="text-error text-sm font-bold text-center mt-2">{error}</p>
            )}
          </form>

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
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-teal-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
