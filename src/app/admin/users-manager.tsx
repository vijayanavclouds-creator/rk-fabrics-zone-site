"use client"

import { useState, useEffect, useTransition } from "react"
import { getUsers, promoteToAdmin, demoteAdmin } from "@/actions/auth"
import { toast } from "sonner"
import { Shield, User, ShieldAlert, Loader2, ChevronDown, ChevronUp } from "lucide-react"

export function UsersManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Accordion state
  const [showAdmins, setShowAdmins] = useState(true)
  const [showCustomers, setShowCustomers] = useState(false)

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

  const adminUsers = users.filter(u => u.role === "ADMIN")
  const customerUsers = users.filter(u => u.role === "CUSTOMER")

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Account Management</h2>
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate">
            Admin Accounts: <span className={adminUsers.length >= 5 ? "text-rose-600" : "text-teal-600"}>{adminUsers.length}/5</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Admins Accordion */}
          <div className="border border-charcoal/10 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowAdmins(!showAdmins)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-teal-600" />
                <h3 className="font-bold text-charcoal">Administrators ({adminUsers.length})</h3>
              </div>
              {showAdmins ? <ChevronUp size={20} className="text-slate" /> : <ChevronDown size={20} className="text-slate" />}
            </button>
            
            {showAdmins && (
              <div className="p-4 space-y-3 bg-white">
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No admin users found.</p>
                ) : (
                  adminUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
                          <Shield size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal">{user.name}</h3>
                          <p className="text-sm text-slate">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDemote(user.id)}
                          disabled={isPending || adminUsers.length <= 1}
                          className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          Demote
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Customers Accordion */}
          <div className="border border-charcoal/10 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowCustomers(!showCustomers)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-slate-500" />
                <h3 className="font-bold text-charcoal">Customers ({customerUsers.length})</h3>
              </div>
              {showCustomers ? <ChevronUp size={20} className="text-slate" /> : <ChevronDown size={20} className="text-slate" />}
            </button>
            
            {showCustomers && (
              <div className="p-4 space-y-3 bg-white">
                {customerUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No customers found.</p>
                ) : (
                  customerUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-200 text-slate-500">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal">{user.name}</h3>
                          <p className="text-sm text-slate">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => handlePromote(user.id)}
                          disabled={isPending || adminUsers.length >= 5}
                          className="px-4 py-2 bg-charcoal text-white text-sm font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <ShieldAlert size={16} /> Promote to Admin
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
