"use client"

import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

export default function PasswordForm() {
  const router = useRouter()

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-slate mb-4">
        For security reasons, updating your password requires email verification.
      </p>
      <div className="pt-2">
        <button 
          onClick={() => router.push("/account/profile/verify-update")}
          className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2 w-fit"
        >
          <Lock size={16} />
          Update Password
        </button>
      </div>
    </div>
  )
}
