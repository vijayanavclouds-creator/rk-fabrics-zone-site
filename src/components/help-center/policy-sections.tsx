export function PolicySections() {
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
        <div className="space-y-4 text-slate leading-relaxed">
          <p>At RK Fabrics Zone, your privacy is our priority. We are committed to protecting your personal data.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>We collect only the necessary information required to process your orders and improve your shopping experience (e.g., name, address, email, phone number).</li>
            <li>Your payment information is securely processed by our payment gateway partners and is never stored on our servers.</li>
            <li>We do not sell, trade, or rent your personal identification information to others.</li>
            <li>We may use your email to send updates pertaining to your order, as well as occasional company news, updates, related product or service information.</li>
          </ul>
        </div>
      )
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      content: (
        <div className="space-y-4 text-slate leading-relaxed">
          <p>By using the RK Fabrics Zone website, you agree to comply with and be bound by the following terms and conditions:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</li>
            <li>Colors of fabrics may vary slightly from the images shown due to photographic lighting sources or your monitor settings.</li>
            <li>All prices are inclusive of GST. We reserve the right to modify prices without prior notice.</li>
            <li>Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="mt-16 space-y-12">
      {policies.map((policy) => (
        <section 
          key={policy.id} 
          id={policy.id} 
          className="scroll-mt-32 border-t border-charcoal/10 pt-12"
        >
          <h3 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
            {policy.title}
          </h3>
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-charcoal/5">
            {policy.content}
          </div>
        </section>
      ))}
    </div>
  );
}
