"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCheckoutStore, CheckoutAddress } from "@/store/checkout"
import { saveAddress, deleteAddress } from "@/actions/address"
import { toast } from "sonner"
import Link from "next/link"
import { MapPin, Plus, Edit2, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react"

export default function AddressSelector({ initialAddresses, isCheckout = true }: { initialAddresses: any[], isCheckout?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { selectedAddress, setAddress } = useCheckoutStore()
  
  const [addresses, setAddresses] = useState(initialAddresses)
  const [activeAddressId, setActiveAddressId] = useState<string | null>(
    selectedAddress?.id || (initialAddresses.find(a => a.isDefault)?.id) || (initialAddresses.length > 0 ? initialAddresses[0].id : null)
  )
  
  const [showForm, setShowForm] = useState(initialAddresses.length === 0)
  
  useEffect(() => {
    if (!isCheckout) {
      const isFormOpen = searchParams.get("form") === "true"
      setShowForm(isFormOpen || addresses.length === 0)
    }
  }, [searchParams, isCheckout, addresses.length])

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
    if (!isCheckout) {
      router.push(`${pathname}?form=true`)
    } else {
      setShowForm(true)
    }
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
      if (!isCheckout) {
        router.push(pathname)
      } else {
        setShowForm(false)
      }
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
    const formContent = (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm h-full w-full">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          {!isCheckout ? (editingAddress ? "Edit Address Details" : "Add New Address Details") : (editingAddress ? "Edit Address" : "Add New Address")}
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

          <div className="flex justify-end gap-4 pt-4 mt-6">
            {addresses.length > 0 && (
              <button 
                type="button" 
                onClick={() => {
                  if (!isCheckout) {
                    router.push(pathname)
                  } else {
                    setShowForm(false)
                  }
                  setEditingAddress(null)
                  setFormData({ firstName: "", lastName: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false })
                }}
                className="btn-primary px-8 py-3.5 flex items-center justify-center text-center min-w-[160px]"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary px-8 py-3.5 flex items-center justify-center text-center disabled:opacity-70 min-w-[160px]"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    );

    if (isCheckout) {
      return formContent;
    }

    return (
      <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-2">
            {formContent}
          </div>
          <div className="bg-teal-50/30 rounded-3xl p-6 md:p-8 border border-teal-100 shadow-sm space-y-6 h-full">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-2">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">Secure Address Saving</h3>
          <p className="text-slate text-sm leading-relaxed">
            Your address details are securely stored and encrypted. We only use this information to ensure accurate and timely delivery of your orders.
          </p>
          <ul className="space-y-3 text-sm text-charcoal font-medium mt-6">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span> 100% Secure & Encrypted
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span> Fast 1-Click Checkout
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span> Easy Returns & Pickup
            </li>
          </ul>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className={!isCheckout ? "bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm w-full" : ""}>
      {!isCheckout && (
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          Your Saved Addresses
        </h2>
      )}
      <div className={!isCheckout ? "space-y-6 w-full" : "space-y-6"}>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {addresses.map((addr) => (
          <label 
            key={addr.id} 
            className={`w-full sm:w-[340px] block p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
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
          onClick={() => {
            if (!isCheckout) {
              router.push(`${pathname}?form=true`)
            } else {
              setShowForm(true)
            }
          }}
          className="w-full sm:w-[340px] h-full min-h-[200px] border-2 border-dashed border-charcoal/20 rounded-2xl flex flex-col items-center justify-center text-slate hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50/30 transition-all"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-charcoal/5">
            <Plus size={24} />
          </div>
          <span className="font-bold">Add New Address</span>
        </button>
      </div>

      {isCheckout && (
        <div className="flex justify-center items-center pt-6 border-t border-charcoal/10 mt-8">
          <button
            onClick={handleContinue}
            className="btn-teal w-full sm:w-auto flex items-center justify-center gap-2 px-8"
          >
            Continue to Payment <ArrowRight size={18} />
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
