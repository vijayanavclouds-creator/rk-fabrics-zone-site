import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { getCompanyProfile } from "@/actions/system";
import { ContactForm } from "./contact-form";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | RK Fabrics",
  description: "Get in touch with RK Fabrics for any inquiries.",
};

export default async function ContactPage() {
  const companyProfile = await getCompanyProfile();
  const session = await getServerSession(authOptions);
  
  let deliveredOrders: any[] = [];
  if (session?.user?.id) {
    deliveredOrders = await prisma.order.findMany({
      where: { 
        userId: session.user.id,
        status: "DELIVERED"
      },
      select: {
        id: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            isReturnable: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-16">
 <div className="text-center mb-4 md:mb-12">
 <span className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.3em] text-gold-dark uppercase">
 Get In Touch
 </span>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-charcoal mt-2">
 Contact Us
 </h1>
 <p className="text-slate mt-3 max-w-lg mx-auto">
 Questions about fabrics? Need help with an order? We&apos;re here for you.
 </p>
 </div>

  <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
  {/* Contact Info */}
  <div className="bg-white rounded-2xl border border-charcoal/5 p-6 flex flex-col h-full order-last md:order-first">
    <div className="space-y-5 flex-1">
      {[
        { icon: MapPin, label: "Visit Our Store", value: companyProfile?.address || "Johari Bazaar, Jaipur, Rajasthan 302003, India", color: "text-teal-600" },
        { icon: Phone, label: "Call Us", value: companyProfile?.contactNumber || "+91 98765 43210", color: "text-teal-600" },
        { icon: Mail, label: "Email", value: companyProfile?.supportEmail || "hello@rkfabricszone.com", color: "text-teal-600" },
        { icon: Clock, label: "Working Hours", value: "Mon — Sat: 10:00 AM — 8:00 PM", color: "text-gold-dark" },
      ].map((item) => (
        <div key={item.label} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
            <item.icon size={18} className={item.color} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-medium text-charcoal mt-0.5">{item.value}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8 pt-6 border-t border-charcoal/5">
      <a
        href={`https://wa.me/${(companyProfile?.contactNumber || '+919876543210').replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary !bg-green-500 hover:!bg-green-600 !text-white flex items-center justify-center gap-2 w-full md:w-3/4 mx-auto shadow-neo-btn"
      >
        <MessageCircle size={20} /> Chat on WhatsApp
      </a>
      
      <div className="mt-3 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
          Please note: Response times on WhatsApp may vary during peak hours. For faster automated help, use the message form.
        </p>
      </div>
    </div>
  </div>

        {/* Contact Form */}
        <Suspense fallback={null}>
          <ContactForm 
            deliveredOrders={deliveredOrders} 
            userName={session?.user?.name || ""}
            userEmail={session?.user?.email || ""}
          />
        </Suspense>
      </div>
 </div>
 );
}
