"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import { useState } from "react"
import { ReviewModal } from "./review-modal"

export function OrderItemsList({ items, status }: { items: any[], status: string }) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  const handleReviewClick = (item: any) => {
    setSelectedItem(item)
    setReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    setReviewModalOpen(false)
    setSelectedItem(null)
  }

  return (
    <>
      <div className="divide-y divide-charcoal/5 border border-charcoal/10 rounded-2xl overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 hover:bg-slate-50 transition-colors bg-white">
            <div className="flex gap-4 flex-1">
              <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-charcoal/5">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.productName} 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate">
                    <Package size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-charcoal line-clamp-1">{item.productName}</h4>
                <p className="text-sm text-slate mt-1">{item.variantName}</p>
                
                {status === "DELIVERED" && !item.review && (
                  <div className="mt-2 md:hidden">
                    <button 
                      onClick={() => handleReviewClick(item)}
                      className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors inline-block w-max"
                    >
                      Rate & Review
                    </button>
                  </div>
                )}
                {status === "DELIVERED" && item.review && (
                  <div className="mt-2 md:hidden text-xs font-bold text-slate bg-slate-100 px-3 py-1.5 rounded-lg inline-block w-max">
                    Reviewed ⭐ {item.review.rating}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-3 md:mt-0">
              <div className="flex flex-col items-start md:items-end">
                <p className="font-bold text-charcoal">₹{item.price.toLocaleString()}</p>
                <p className="text-sm text-slate font-medium mt-1">Qty: {item.quantity}</p>
              </div>
              
              {status === "DELIVERED" && !item.review && (
                <div className="hidden md:block mt-2">
                  <button 
                    onClick={() => handleReviewClick(item)}
                    className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap"
                  >
                    Rate & Review
                  </button>
                </div>
              )}
              {status === "DELIVERED" && item.review && (
                <div className="hidden md:block mt-2 text-xs font-bold text-slate bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  Reviewed ⭐ {item.review.rating}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
          productId={selectedItem.productId}
          orderItemId={selectedItem.id}
          productName={selectedItem.productName}
        />
      )}
    </>
  )
}
