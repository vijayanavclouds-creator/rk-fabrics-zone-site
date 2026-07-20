"use client"

import { useState, useEffect, useTransition } from "react"
import { getUsers, promoteToAdmin, demoteAdmin } from "@/actions/auth"
import { toast } from "sonner"
import { Shield, User, ShieldAlert, Loader2 } from "lucide-react"

export function UsersManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      if (res.success) {
        setUsers(res.users || [])
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handlePromote = (userId: string) => {
    if (!confirm("Are you sure you want to make this user an Admin?")) return
    
    startTransition(async () => {
      const res = await promoteToAdmin(userId)
      if (res.success) {
        toast.success("User promoted to Admin!")
        fetchUsers()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDemote = (userId: string) => {
    if (!confirm("Are you sure you want to demote this Admin to a Customer?")) return
    
    startTransition(async () => {
      const res = await demoteAdmin(userId)
      if (res.success) {
        toast.success("Admin demoted to Customer.")
        fetchUsers()
      } else {
        toast.error(res.error)
      }
    })
  }

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-charcoal" /></div>
  }

  const adminCount = users.filter(u => u.role === "ADMIN").length

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Account Management</h2>
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate">
            Admin Accounts: <span className={adminCount >= 5 ? "text-rose-600" : "text-teal-600"}>{adminCount}/5</span>
          </div>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>
                  {user.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-charcoal">{user.name}</h3>
                  <p className="text-sm text-slate">{user.email}</p>
                </div>
              </div>
              
              <div>
                {user.role === 'CUSTOMER' ? (
                  <button
                    onClick={() => handlePromote(user.id)}
                    disabled={isPending || adminCount >= 5}
                    className="px-4 py-2 bg-charcoal text-white text-sm font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <ShieldAlert size={16} /> Promote to Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleDemote(user.id)}
                    disabled={isPending || adminCount <= 1}
                    className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    Demote
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
