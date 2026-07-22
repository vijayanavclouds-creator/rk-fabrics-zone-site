"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Types
type FAQItem = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  title: string;
  subtitle?: string;
  type: "faqs" | "subcategories";
  items?: FAQItem[];
  subcategories?: FAQCategory[];
  actionText?: string;
  actionButtonText?: string;
  actionLink?: string;
};

const faqData: FAQCategory[] = [
  {
    id: "gst",
    title: "I want help with new GST changes",
    type: "faqs",
    items: [
      { question: "What are the new GST rates in India?", answer: "GST rates for textile and apparel vary between 5% and 12% depending on the product type and price." },
      { question: "When will I be able to buy products with the new GST rates?", answer: "All prices on RK Fabrics Zone are already inclusive of the applicable GST." },
      { question: "How do I check the GST rate for different products?", answer: "The exact GST amount is calculated and shown at checkout before you make the payment." },
      { question: "Will the upcoming GST rate changes affect the speed of deliveries?", answer: "No, tax rate changes do not affect our delivery timelines." },
      { question: "Will there be any changes to the returns/cancellation policy?", answer: "No, our return and cancellation policies remain unaffected by GST changes." },
      { question: "Can I cancel my order because the GST rate has changed?", answer: "Yes, you can cancel any unfulfilled order through the Order Management section." }
    ]
  },
  {
    id: "manage-order",
    title: "I want to manage my order",
    subtitle: "View, cancel or return an order",
    type: "faqs",
    items: [
      { question: "I want to change the address for delivery of my order. Is it possible now?", answer: "You can change the delivery address only before the order is shipped. Please contact support immediately." },
      { question: "How can I modify/add an alternate number for the order delivery?", answer: "You can update your contact number in your profile settings, or contact support if the order is already placed." },
      { question: "Can I get my orders delivered at a specific time?", answer: "Delivery times depend on our courier partners. Specific time slots are not guaranteed at the moment." },
      { question: "Where can I get the delivery executive's contact details?", answer: "Contact details of the delivery executive will be shared via SMS once the order is out for delivery." },
      { question: "Can I get my order delivered faster?", answer: "We process all orders as quickly as possible. Expedited shipping options are available at checkout for selected pin codes." },
      { question: "Can I reinstate a cancelled order?", answer: "Once cancelled, an order cannot be reinstated. You will need to place a new order." }
    ]
  },
  {
    id: "returns-refunds",
    title: "I want help with returns & refunds",
    subtitle: "Manage and track returns",
    type: "faqs",
    items: [
      { question: "How do I return my order on RK Fabrics Zone?", answer: "Go to the 'Orders' section, select the order you wish to return, and click on the 'Return' button if it is within the return window." },
      { question: "How do I place a request for order replacement?", answer: "We currently offer returns and refunds. For a replacement, please return the item and place a new order." },
      { question: "What is the return policy for cash on delivery?", answer: "For COD orders, refunds will be initiated to your provided bank account or original payment method after the returned item is received." },
      { question: "Can I ask the delivery executive to reschedule the pickup date?", answer: "Yes, our courier partner will call you before pickup. You can request them to reschedule if needed." },
      { question: "What if I miss my order pickup?", answer: "The courier partner will attempt the pickup up to 3 times before cancelling the return request." }
    ]
  },
  {
    id: "other-issues",
    title: "I want help with other issues",
    subtitle: "Offers, payment, & all other issues",
    type: "subcategories",
    subcategories: [
      {
        id: "account-queries",
        title: "Account Related Queries",
        type: "faqs",
        items: [
          { question: "How do I reset my password?", answer: "Click on 'Forgot Password' on the login screen to receive a reset link on your registered email." },
          { question: "How can I delete my account?", answer: "Please contact our support team from your registered email address to request account deletion." }
        ]
      },
      {
        id: "payment-queries",
        title: "Payment Related Queries",
        type: "faqs",
        items: [
          { question: "What payment methods are accepted?", answer: "We accept Credit/Debit cards, UPI, Net Banking, and Cash on Delivery (COD) for eligible orders." },
          { question: "My payment failed but money was deducted.", answer: "The amount will automatically be refunded to your source account within 5-7 business days." }
        ]
      }
    ]
  },
  {
    id: "contact-seller",
    title: "I want to contact the seller",
    type: "faqs",
    items: [
      { question: "How can I contact RK Fabrics Zone?", answer: "You can email us at {{SUPPORT_EMAIL}} or call us at {{HELP_NUMBER}} during business hours (9 AM - 6 PM)." }
    ]
  }
];

export function InteractiveFaq({ companyProfile }: { companyProfile?: any }) {
  const [history, setHistory] = useState<FAQCategory[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currentCategory = history.length > 0 ? history[history.length - 1] : null;

  const handleNavigate = (category: FAQCategory) => {
    setHistory([...history, category]);
    setOpenFaqIndex(null); // Reset open accordion
  };

  const handleBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    setOpenFaqIndex(null);
  };

  const currentItems = currentCategory 
    ? (currentCategory.type === "faqs" ? currentCategory.items : currentCategory.subcategories)
    : faqData;

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-charcoal/10 flex items-center gap-4 bg-slate-50">
        {currentCategory && (
          <button onClick={handleBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-charcoal">
            <ArrowLeft size={20} />
          </button>
        )}
        <h3 className="text-xl font-bold text-charcoal">
          {currentCategory 
            ? (currentCategory.type === "subcategories" ? "Select Non-Order Related Issue" : currentCategory.title) 
            : "What issue are you facing?"}
        </h3>
      </div>

      {/* Action Block */}
      {currentCategory?.actionText && (
        <div className="px-6 py-4 border-b border-charcoal/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <p className="text-sm font-medium text-charcoal">{currentCategory.actionText}</p>
          {currentCategory.actionLink && currentCategory.actionButtonText && (
            <Link 
              href={currentCategory.actionLink}
              className="px-6 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white text-sm font-bold rounded shadow-sm transition-colors whitespace-nowrap"
            >
              {currentCategory.actionButtonText}
            </Link>
          )}
        </div>
      )}

      {currentCategory && currentCategory.type === "faqs" && (
         <div className="px-6 pt-6 pb-2 bg-white">
           <h4 className="font-bold text-charcoal text-lg">Frequently asked questions</h4>
         </div>
      )}

      {/* List Items */}
      <div className="divide-y divide-charcoal/10">
        {!currentCategory || currentCategory.type === "subcategories" ? (
          // Render categories or subcategories
          (currentItems as FAQCategory[])?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleNavigate(cat)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left bg-white"
            >
              <div>
                <h4 className="font-medium text-charcoal text-base">{cat.title}</h4>
                {cat.subtitle && <p className="text-xs text-slate mt-1">{cat.subtitle}</p>}
              </div>
              <ChevronRight size={18} className="text-charcoal" />
            </button>
          ))
        ) : (
          // Render FAQs as accordion
          (currentItems as FAQItem[])?.map((faq, idx) => (
            <div key={idx} className="bg-white">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <span className="font-medium text-charcoal text-sm pr-4">{faq.question}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp size={18} className="text-charcoal flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-charcoal flex-shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-slate leading-relaxed bg-white">
                  {faq.answer
                    .replace("{{SUPPORT_EMAIL}}", companyProfile?.supportEmail || "support@rkfabricszone.com")
                    .replace("{{HELP_NUMBER}}", companyProfile?.helpCenterNumber || "+91 98765 43210")}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
