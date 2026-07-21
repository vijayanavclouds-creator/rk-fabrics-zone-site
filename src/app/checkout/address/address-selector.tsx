"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCheckoutStore, CheckoutAddress } from "@/store/checkout"
import { saveAddress, deleteAddress } from "@/actions/address"
import { toast } from "sonner"
import Link from "next/link"
import { MapPin, Plus, Edit2, Trash2, ArrowRight, ArrowLeft } from "lucide-react"

export default function AddressSelector({ initialAddresses }: { initialAddresses: any[] }) {
  const router = useRouter()
  const { selectedAddress, setAddress } = useCheckoutStore()
  
  const [addresses, setAddresses] = useState(initialAddresses)
  const [activeAddressId, setActiveAddressId] = useState<string | null>(
    selectedAddress?.id || (initialAddresses.find(a => a.isDefault)?.id) || (initialAddresses.length > 0 ? initialAddresses[0].id : null)
  )
  
  const [showForm, setShowForm] = useState(initialAddresses.length === 0)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  })

  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleEdit = (addr: any) => {
    setEditingAddress(addr)
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const res = await deleteAddress(id)
      if (res.success) {
        toast.success("Address deleted")
        setAddresses(addresses.filter(a => a.id !== id))
        if (activeAddressId === id) {
          setActiveAddressId(null)
        }
      } else {
        toast.error("Failed to delete address")
      }
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const dataToSave = editingAddress ? { ...formData, id: editingAddress.id } : formData
    const res = await saveAddress(dataToSave)

    if (res.success && res.address) {
      toast.success(editingAddress ? "Address updated" : "Address saved")
      
      // Update local state
      if (editingAddress) {
        setAddresses(addresses.map(a => a.id === res.address.id ? res.address : a))
      } else {
        setAddresses([res.address, ...addresses])
      }
      
      setActiveAddressId(res.address.id)
      setShowForm(false)
      setEditingAddress(null)
      // Reset form
      setFormData({
        firstName: "", lastName: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false
      })
    } else {
      toast.error(res.error || "Failed to save address")
    }
    setLoading(false)
  }

  const handleContinue = () => {
    if (!activeAddressId) {
      toast.error("Please select a shipping address")
      return
    }

    const selected = addresses.find(a => a.id === activeAddressId)
    if (selected) {
      setAddress(selected)
      router.push("/checkout/payment")
    }
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          {editingAddress ? "Edit Address" : "Add New Address"}
        </h2>
        
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">First Name</label>
              <input type="text" name="firstName" required onChange={handleInputChange} value={formData.firstName} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Last Name</label>
              <input type="text" name="lastName" required onChange={handleInputChange} value={formData.lastName} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Phone Number</label>
            <input type="tel" name="phone" required onChange={handleInputChange} value={formData.phone} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Full Address</label>
            <input type="text" name="address" required onChange={handleInputChange} value={formData.address} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" placeholder="House no, Building, Street, Area" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-bold text-charcoal mb-2">City</label>
              <input type="text" name="city" required onChange={handleInputChange} value={formData.city} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-bold text-charcoal mb-2">State</label>
              <input type="text" name="state" required onChange={handleInputChange} value={formData.state} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-bold text-charcoal mb-2">PIN Code</label>
              <input type="text" name="pincode" required onChange={handleInputChange} value={formData.pincode} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-600" />
            <label htmlFor="isDefault" className="text-sm text-slate">Set as default shipping address</label>
          </div>

          <div className="flex gap-4 pt-4">
            {addresses.length > 0 && (
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false)
                  setEditingAddress(null)
                  setFormData({ firstName: "", lastName: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false })
                }}
                className="px-6 py-3 bg-white border border-charcoal/20 text-charcoal font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 transition-all disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((addr) => (
          <label 
            key={addr.id} 
            className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
              activeAddressId === addr.id ? "border-teal-600 bg-teal-50/30" : "border-charcoal/10 bg-white hover:border-charcoal/20"
            }`}
          >
            <div className="absolute top-4 right-4">
              <input 
                type="radio" 
                name="selectedAddress" 
                value={addr.id}
                checked={activeAddressId === addr.id}
                onChange={() => setActiveAddressId(addr.id)}
                className="w-5 h-5 text-teal-600 focus:ring-teal-600 border-gray-300"
              />
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="text-teal-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-charcoal">{addr.firstName} {addr.lastName}</h4>
                  {addr.isDefault && <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                </div>
                <p className="text-sm text-slate mt-1">{addr.address}</p>
                <p className="text-sm text-slate">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-sm font-medium text-charcoal mt-2">Ph: {addr.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-charcoal/5">
              <button type="button" onClick={() => handleEdit(addr)} className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:text-teal-800">
                <Edit2 size={12} /> Edit
              </button>
              <button type="button" onClick={() => handleDelete(addr.id)} className="text-xs font-bold text-rose-600 flex items-center gap-1 hover:text-rose-800">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </label>
        ))}

        <button 
          onClick={() => setShowForm(true)}
          className="h-full min-h-[200px] border-2 border-dashed border-charcoal/20 rounded-2xl flex flex-col items-center justify-center text-slate hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50/30 transition-all"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-charcoal/5">
            <Plus size={24} />
          </div>
          <span className="font-bold">Add New Address</span>
        </button>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-charcoal/10 mt-8">
        <Link 
          href="/cart" 
          className="btn-primary hidden sm:inline-flex items-center justify-center !px-4"
          aria-label="Back to Cart"
        >
          <ArrowLeft size={18} />
        </Link>
        
        <div className="flex w-full sm:w-auto justify-end gap-4">
          
          <button
            onClick={handleContinue}
            className="btn-teal flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            Continue to Payment <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
