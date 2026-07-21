"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updatePassword } from "@/actions/user"

export default function PasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)

    if (result.success) {
      toast.success("Password updated successfully!")
      setPassword("")
      setConfirmPassword("")
    } else {
      toast.error(result.error || "Failed to update password")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">New Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-charcoal transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-charcoal transition-all" />
      </div>
      <div className="pt-2">
        <button type="submit" disabled={loading} className="px-6 py-3 bg-charcoal text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  )
}
