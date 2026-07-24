"use client"

import { toast } from "sonner"

export default function TwoFactorAuth() {
  const handleEnable2FA = () => {
    toast.info("Two-Factor Authentication setup will be available in a future update.")
  }

  return (
    <div className="max-w-lg">
      <p className="text-sm text-slate mb-4">
        Add an extra layer of security to your account. We will ask for a verification code when you sign in.
      </p>
      <div className="pt-2">
        <button 
          type="button" 
          onClick={handleEnable2FA}
          className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-2 w-fit bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors"
        >
          Enable 2FA
        </button>
      </div>
    </div>
  )
}
