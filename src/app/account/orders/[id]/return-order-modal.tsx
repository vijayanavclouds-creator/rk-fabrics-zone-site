"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, CheckCircle2, ChevronDown, Package } from "lucide-react";
import Image from "next/image";

type OrderItem = {
  id: string;
  productName: string;
  variantName: string;
  price: number;
  image?: string | null;
  isReturnable: boolean;
};

type ReturnOrderModalProps = {
  orderId: string;
  paymentMethod: string;
  items: OrderItem[];
};

export default function ReturnOrderModal({ orderId, paymentMethod, items }: ReturnOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"SELECT_ITEMS" | "SELECT_REASON" | "REFUND_DETAILS" | "SUCCESS">("SELECT_ITEMS");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState<string>("");
  const [refundDetails, setRefundDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const returnableItems = items.filter((i) => i.isReturnable);

  const REASON_OPTIONS = [
    "Size Issue",
    "Defective Product",
    "Not as expected",
    "Different from picture",
    "Other"
  ];

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleToggleReason = (reason: string) => {
    setReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === "SUCCESS") {
      router.refresh();
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: selectedItems,
          reasons,
          description,
          refundMethod: paymentMethod === 'COD' ? refundMethod : 'ORIGINAL_METHOD',
          refundDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit return request");
      }

      setStep("SUCCESS");
      // Refresh router immediately so the page updates behind the modal
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedToReason = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item to return.");
      return;
    }
    setError(null);
    setStep("SELECT_REASON");
  };

  const proceedToRefund = () => {
    if (reasons.length === 0) {
      setError("Please select a reason for returning.");
      return;
    }
    if (reasons.includes("Other") && !description.trim()) {
      setError("Please provide a description for 'Other' reason.");
      return;
    }
    setError(null);
    if (paymentMethod === 'COD') {
      setStep("REFUND_DETAILS");
    } else {
      handleSubmit();
    }
  };

  const handleFinalSubmit = () => {
    if (paymentMethod === 'COD') {
      if (!refundMethod) {
        setError("Please select a refund method.");
        return;
      }
      if ((refundMethod === 'UPI' || refundMethod === 'BANK_TRANSFER') && !refundDetails.trim()) {
        setError("Please provide your refund details.");
        return;
      }
    }
    handleSubmit();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3.5 text-sm whitespace-nowrap bg-white text-charcoal border-2 border-charcoal/20 hover:bg-charcoal/5"
      >
        Return Order
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">
                {step === "SUCCESS" ? "Return Requested" : "Return Order"}
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-error/10 text-error rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {step === "SELECT_ITEMS" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-charcoal mb-2">Which items do you want to return?</h3>
                    <p className="text-sm text-slate">Select one or more items from your order.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {returnableItems.map(item => (
                      <label key={item.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-teal-600/50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                          className="mt-1 shrink-0 w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <div className="flex gap-3">
                          {item.image ? (
                            <Image src={item.image} alt={item.productName} width={60} height={60} className="rounded-lg object-cover bg-slate-100" />
                          ) : (
                            <div className="w-[60px] h-[60px] rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package size={24} className="text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-charcoal text-sm line-clamp-2">{item.productName}</p>
                            <p className="text-xs text-slate mt-1">{item.variantName}</p>
                            <p className="text-sm font-bold text-charcoal mt-1">₹{item.price}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={proceedToReason}
                      className="w-full btn-primary py-4 rounded-xl"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {step === "SELECT_REASON" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-charcoal mb-2">Why are you returning?</h3>
                    <p className="text-sm text-slate">Please let us know the reason for your return. This helps us improve!</p>
                  </div>

                  <div className="space-y-3">
                    {REASON_OPTIONS.map(reason => (
                      <label key={reason} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-teal-600/50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={reasons.includes(reason)}
                          onChange={() => handleToggleReason(reason)}
                          className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <span className="text-charcoal font-medium text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>

                  {reasons.includes("Other") && (
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-charcoal mb-2">Additional Details</label>
                      <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Please describe the issue..."
                        className="w-full border border-slate-200 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-teal-600 text-sm"
                      />
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setStep("SELECT_ITEMS")}
                      className="flex-1 py-4 bg-slate-100 text-charcoal font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={proceedToRefund}
                      className="flex-[2] btn-primary py-4 rounded-xl"
                    >
                      {paymentMethod === 'COD' ? "Next Step" : "Submit Return Request"}
                    </button>
                  </div>
                </div>
              )}

              {step === "REFUND_DETAILS" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-charcoal mb-2">Refund Method</h3>
                    <p className="text-sm text-slate">Since you paid via Cash on Delivery, how would you like to receive your refund?</p>
                  </div>

                  <div className="space-y-3">
                    {["UPI", "BANK_TRANSFER", "STORE_CREDIT"].map(method => (
                      <label key={method} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${refundMethod === method ? 'border-teal-600 bg-teal-50/30' : 'border-slate-200 hover:border-teal-600/50'}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="refundMethod"
                            checked={refundMethod === method}
                            onChange={() => setRefundMethod(method)}
                            className="w-5 h-5 text-teal-600 border-slate-300 focus:ring-teal-500"
                          />
                          <span className="text-charcoal font-bold text-sm">
                            {method === "UPI" ? "UPI Transfer" : method === "BANK_TRANSFER" ? "Bank Transfer (NEFT/IMPS)" : "Store Credit (Coupon)"}
                          </span>
                        </div>
                        
                        {refundMethod === method && method === "UPI" && (
                          <div className="mt-4 ml-8">
                            <input 
                              type="text" 
                              value={refundDetails}
                              onChange={e => setRefundDetails(e.target.value)}
                              placeholder="Enter your UPI ID (e.g. number@upi)"
                              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-teal-600"
                            />
                          </div>
                        )}
                        
                        {refundMethod === method && method === "BANK_TRANSFER" && (
                          <div className="mt-4 ml-8">
                            <textarea 
                              value={refundDetails}
                              onChange={e => setRefundDetails(e.target.value)}
                              placeholder="Account Holder Name:\nAccount Number:\nIFSC Code:\nBank Name:"
                              className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:border-teal-600"
                            />
                          </div>
                        )}
                        
                        {refundMethod === method && method === "STORE_CREDIT" && (
                          <div className="mt-2 ml-8">
                            <p className="text-xs text-slate">We will issue a coupon code for the exact amount to your email address.</p>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setStep("SELECT_REASON")}
                      className="flex-1 py-4 bg-slate-100 text-charcoal font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="flex-[2] btn-primary py-4 rounded-xl disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          Processing...
                        </>
                      ) : "Submit Return Request"}
                    </button>
                  </div>
                </div>
              )}

              {step === "SUCCESS" && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">
                    Return Request Submitted!
                  </h3>
                  <p className="text-slate mb-8 max-w-sm mx-auto">
                    We're sorry things didn't work out. We have received your request and our support team will get in touch with you shortly. 
                    Your order status has been updated.
                  </p>
                  <button 
                    onClick={handleClose}
                    className="w-full btn-primary py-4 rounded-xl"
                  >
                    Close & Go to My Orders
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
