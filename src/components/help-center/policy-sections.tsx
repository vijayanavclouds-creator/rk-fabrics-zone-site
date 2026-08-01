"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PolicySections() {
  const [openPolicyId, setOpenPolicyId] = useState<string | null>(null);

  useEffect(() => {
    // Open accordion and scroll based on hash
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setOpenPolicyId(hash);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const policies = [
    {
      id: "size-guide",
      title: "Size Guide",
      content: (
        <div className="space-y-4">
          <p className="text-slate leading-relaxed">
            Finding the perfect fit is essential. Below are general sizing guidelines for our most popular categories. Since many of our products are unstitched fabrics, sizing primarily applies to our ready-to-wear or semi-stitched collections.
          </p>
          <div className="overflow-x-auto rounded-xl border border-charcoal/10 mt-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-charcoal font-bold">
                <tr>
                  <th className="px-6 py-4 border-b border-charcoal/10">Size</th>
                  <th className="px-6 py-4 border-b border-charcoal/10">Bust (inches)</th>
                  <th className="px-6 py-4 border-b border-charcoal/10">Waist (inches)</th>
                  <th className="px-6 py-4 border-b border-charcoal/10">Hip (inches)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                <tr><td className="px-6 py-4 font-medium">XS</td><td className="px-6 py-4 text-slate">32</td><td className="px-6 py-4 text-slate">26</td><td className="px-6 py-4 text-slate">34</td></tr>
                <tr><td className="px-6 py-4 font-medium">S</td><td className="px-6 py-4 text-slate">34</td><td className="px-6 py-4 text-slate">28</td><td className="px-6 py-4 text-slate">36</td></tr>
                <tr><td className="px-6 py-4 font-medium">M</td><td className="px-6 py-4 text-slate">36</td><td className="px-6 py-4 text-slate">30</td><td className="px-6 py-4 text-slate">38</td></tr>
                <tr><td className="px-6 py-4 font-medium">L</td><td className="px-6 py-4 text-slate">38</td><td className="px-6 py-4 text-slate">32</td><td className="px-6 py-4 text-slate">40</td></tr>
                <tr><td className="px-6 py-4 font-medium">XL</td><td className="px-6 py-4 text-slate">40</td><td className="px-6 py-4 text-slate">34</td><td className="px-6 py-4 text-slate">42</td></tr>
                <tr><td className="px-6 py-4 font-medium">XXL</td><td className="px-6 py-4 text-slate">42</td><td className="px-6 py-4 text-slate">36</td><td className="px-6 py-4 text-slate">44</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: "shipping-policy",
      title: "Shipping Policy",
      content: (
        <div className="space-y-4 text-slate leading-relaxed">
          <p>We partner with premium logistics providers to ensure your fabrics reach you safely and swiftly.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Processing Time:</strong> Orders are typically processed and dispatched within 1-2 business days.</li>
            <li><strong>Delivery Time:</strong> Standard delivery within India takes 3-7 business days depending on your location.</li>
            <li><strong>Shipping Charges:</strong> Free shipping is available on all prepaid orders above ₹1,000. For orders below this amount, a standard shipping fee of ₹99 applies.</li>
            <li><strong>Tracking:</strong> Once your order is shipped, you will receive a tracking link via email and SMS.</li>
          </ul>
        </div>
      )
    },
    {
      id: "returns",
      title: "Returns & Exchange",
      content: (
        <div className="space-y-4 text-slate leading-relaxed">
          <p>We want you to love your purchase. If you are not completely satisfied, we offer a hassle-free return and exchange process.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Eligibility:</strong> Returns must be initiated within 7 days of delivery. Items must be unused, unwashed, and in their original packaging with all tags attached.</li>
            <li><strong>Cut Fabrics:</strong> Please note that fabrics cut to specific length measurements (e.g., exactly 2.5 meters as per custom request) may not be eligible for returns unless defective.</li>
            <li><strong>Process:</strong> You can initiate a return through the 'Orders' section in your account. A pickup will be arranged within 2-3 business days.</li>
            <li><strong>Refunds:</strong> Once the returned item is received and inspected, refunds are processed within 5-7 business days to the original payment method.</li>
          </ul>
        </div>
      )
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      content: (
        <div className="space-y-6 text-slate leading-relaxed text-sm">
          <p>This Privacy Policy describes how RK Fabrics Zone and its affiliates collect, use, share, and protect personal information about you during your visit to our website and your use of our services.</p>

          <div>
            <h4 className="font-bold text-charcoal mb-2">1. Collection of Personally Identifiable Information</h4>
            <p>When you use our Platform, we collect and store your personal information provided by you from time to time. Our primary goal in doing so is to provide you a safe, efficient, smooth, and customized experience. This allows us to provide services and features that most likely meet your needs. We collect information such as your name, delivery address, phone number, email ID, billing information, and payment details.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-charcoal mb-2">2. Use of Demographic / Profile Data / Your Information</h4>
            <p>We use personal information to provide the services you request. To the extent we use your personal information to market to you, we will provide you the ability to opt-out of such uses. We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Resolve disputes and troubleshoot problems.</li>
              <li>Help promote a safe service and collect money.</li>
              <li>Measure consumer interest in our products and services.</li>
              <li>Inform you about online and offline offers, products, services, and updates.</li>
              <li>Customize and enhance your shopping experience.</li>
              <li>Detect and protect us against error, fraud, and other criminal activity.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">3. Cookies</h4>
            <p>A "cookie" is a small piece of information stored by a web server on a web browser so it can be later read back from that browser. RK Fabrics Zone uses cookie and tracking technology depending on the features offered. No personal information will be collected via cookies and other tracking technology; however, if you previously provided personally identifiable information, cookies may be tied to such information.</p>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">4. Sharing of Personal Information</h4>
            <p>We may share personal information with our other corporate entities and affiliates. These entities and affiliates may market to you as a result of such sharing unless you explicitly opt-out. We may disclose personal information to third parties, such as courier services and payment gateways, to provide you access to our Services, to comply with our legal obligations, to enforce our User Agreement, or to prevent, detect, mitigate, and investigate fraudulent or illegal activities related to our Services.</p>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">5. Security Precautions</h4>
            <p>Our Website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server. Once your information is in our possession, we adhere to strict security guidelines, protecting it against unauthorized access.</p>
          </div>
        </div>
      )
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      content: (
        <div className="space-y-6 text-slate leading-relaxed text-sm">
          <p>Welcome to RK Fabrics Zone. This document is an electronic record in terms of the Information Technology Act and rules there under as applicable. This electronic record is generated by a computer system and does not require any physical or digital signatures.</p>

          <div>
            <h4 className="font-bold text-charcoal mb-2">1. Membership Eligibility</h4>
            <p>Use of the Website is available only to persons who can form legally binding contracts under the Indian Contract Act, 1872. Persons who are "incompetent to contract" within the meaning of the Indian Contract Act, 1872 including minors, un-discharged insolvents, etc., are not eligible to use the Website. If you are a minor i.e., under the age of 18 years, you shall not register as a User of the RK Fabrics Zone website and shall not transact on or use the website.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-charcoal mb-2">2. Your Account and Registration Obligations</h4>
            <p>If you use the Website, you shall be responsible for maintaining the confidentiality of your Display Name and Password and you shall be responsible for all activities that occur under your Display Name and Password. You agree that if you provide any information that is untrue, inaccurate, not current, or incomplete, we shall have the right to indefinitely suspend or terminate or block access of your membership on the Website.</p>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">3. Product Description and Color Accuracy</h4>
            <p>RK Fabrics Zone attempts to be as accurate as possible. However, we do not warrant that product descriptions or other content of this site is completely accurate, complete, reliable, current, or error-free. Specifically for clothing and fabrics:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Color Disclaimer:</strong> Due to differences in monitor settings, the colors of products shown on the website may differ slightly from the actual product. We cannot guarantee that your monitor's display of any color will be accurate.</li>
              <li><strong>Fabric Variations:</strong> Handwoven or hand-dyed fabrics may have slight irregularities in the weave or color, which are characteristic of the natural process and should not be considered defects.</li>
              <li><strong>Measurement Tolerance:</strong> All measurements provided for unstitched fabrics or garments are approximate and subject to a marginal tolerance of +/- 5%.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">4. Payment and Pricing</h4>
            <p>While RK Fabrics Zone strives to provide accurate product and pricing information, pricing or typographical errors may occur. In the event that a product is listed at an incorrect price or with incorrect information, we shall have the right, at our sole discretion, to refuse or cancel any orders placed for that product, unless the product has already been dispatched.</p>
          </div>

          <div>
            <h4 className="font-bold text-charcoal mb-2">5. Returns, Refunds, and Cancellations</h4>
            <p>Our Returns Policy specifically tailored for clothing and fabrics dictates that items must be returned in their original condition, unwashed, unaltered, and with all tags intact. Fabrics that have been custom cut or tailored according to user specifications are strictly non-returnable unless a manufacturing defect is verified by our quality control team. For detailed timelines, please refer to our full Returns & Exchange policy.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="mt-16 space-y-4">
      <h3 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">
        Store Policies
      </h3>
      
      {policies.map((policy) => (
        <div 
          key={policy.id} 
          id={policy.id} 
          className="scroll-mt-32 border border-charcoal/10 rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <button
            onClick={() => setOpenPolicyId(openPolicyId === policy.id ? null : policy.id)}
            className="w-full px-6 py-5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <h4 className="font-[family-name:var(--font-playfair)] font-bold text-lg text-charcoal">
              {policy.title}
            </h4>
            <ChevronDown 
              size={20} 
              className={cn(
                "text-slate transition-transform duration-300", 
                openPolicyId === policy.id && "rotate-180"
              )} 
            />
          </button>
          
          <div 
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              openPolicyId === policy.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="p-6 md:p-8 bg-white border-t border-charcoal/5">
                {policy.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
