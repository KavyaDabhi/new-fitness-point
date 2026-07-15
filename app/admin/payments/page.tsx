"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function PaymentsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Razorpay (UPI/Cards)");

  const handlePayment = () => {
    if (selectedMethod !== "Razorpay (UPI/Cards)") {
      alert(`Processing via ${selectedMethod}...`);
      return;
    }

    setIsProcessing(true);

    const options = {
      key: "rzp_test_mock_key_12345", // Replace with actual Razorpay Key ID
      amount: "120000", // Amount in paise (e.g. 1200.00)
      currency: "USD", // Or INR
      name: "New Fitness Point Gym",
      description: "Premium Yearly Membership",
      image: "/logo.jpg",
      handler: function (response: any) {
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        setIsProcessing(false);
      },
      prefill: {
        name: "Yagna Bhatt",
        email: "yagna@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#dc2626", // logo
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Razorpay SDK not loaded", error);
      alert("Failed to load payment gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col items-center justify-center min-h-[70vh]"
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-2xl w-full bg-gray-100 border border-gray-200 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-logo/20 border border-logo/90/30 text-logo/90 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Process Payment</h2>
          <p className="text-gray-500 mt-2 font-medium">Log a new payment or renew an existing membership securely.</p>
        </div>
        
        <form className="space-y-8 relative z-10" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Member ID</label>
              <input type="text" placeholder="e.g. NP-1042" className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-100 text-gray-900 focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Plan Selection</label>
              <select className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-[#121212] text-gray-900 focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo appearance-none font-medium transition-colors">
                <option>Premium Yearly ($1200)</option>
                <option>Monthly Basic ($50)</option>
                <option>Cardio Special ($30)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Payment Method</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Razorpay (UPI/Cards)', 'Cash', 'Bank Transfer'].map(method => (
                <div 
                  key={method} 
                  onClick={() => setSelectedMethod(method)}
                  className={`border rounded-xl p-5 text-center cursor-pointer transition-all ${
                    selectedMethod === method 
                      ? "border-logo bg-logo/10 shadow-lg" 
                      : "border-gray-200 bg-gray-100 hover:border-white/30"
                  }`}
                >
                  <span className={`font-bold text-sm ${selectedMethod === method ? "text-logo/90" : "text-gray-600"}`}>
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <button 
              type="submit"
              disabled={isProcessing}
              className={`w-full text-gray-900 font-black text-lg uppercase tracking-widest rounded-xl py-5 shadow-lg transition-all ${
                isProcessing 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-logo hover:bg-logo/80 shadow-lg hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {isProcessing ? "Processing..." : `Pay Securely via ${selectedMethod.split(' ')[0]}`}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
