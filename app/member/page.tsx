"use client";

import { LogOut, User, Activity, CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";

export default function MemberDashboard() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("userAuth");
    if (auth !== "true") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    router.push("/login");
  };

  const handlePayment = () => {
    setIsProcessing(true);
    const options = {
      key: "rzp_test_mock_key_12345", 
      amount: "5000", // $50.00
      currency: "USD",
      name: "New Fitness Point Gym",
      description: "Monthly Basic Renewal",
      image: "/logo.jpg",
      handler: function (response: any) {
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        setIsProcessing(false);
      },
      prefill: {
        name: "Member User",
        email: "member@example.com",
      },
      theme: { color: "#dc2626" },
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
      alert("Failed to load payment gateway.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-logo">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center p-1">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <span className="font-black uppercase tracking-tighter text-xl">Member Portal</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-8 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Profile Card */}
          <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 relative overflow-hidden group">
            
            <div className="w-20 h-20 bg-logo rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-gray-900" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Welcome, Member</h2>
            <p className="text-gray-500 font-medium mt-1">ID: NP-9921</p>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Current Plan</div>
              <div className="text-xl font-black text-gray-900">Monthly Basic</div>
              <div className="inline-block mt-2 px-3 py-1 bg-logo/90/10 border border-logo/90/20 text-logo/90 text-xs font-bold uppercase tracking-widest rounded-full">
                Expires in 3 Days
              </div>
            </div>
          </div>

          {/* Quick Actions / Payment */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2"><Activity className="text-logo/90"/> Scan To Enter</h3>
                <p className="text-gray-500 mt-2 text-sm">Present this QR code at the front desk scanner.</p>
              </div>
              <button className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg">
                Show QR Pass
              </button>
            </div>

            <div className="bg-gradient-to-br from-logo/40/40 to-black border border-logo/90/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none">
                 <ShieldCheck className="w-48 h-48" />
               </div>
               <div className="relative z-10 max-w-sm">
                 <div className="flex items-center gap-3 mb-4 text-logo/70">
                   <CreditCard className="w-6 h-6" />
                   <span className="font-bold uppercase tracking-widest text-xs">Payment Required Soon</span>
                 </div>
                 <h3 className="text-3xl font-black tracking-tight mb-2">Renew Membership</h3>
                 <p className="text-gray-600 font-medium mb-8">Your basic plan expires shortly. Renew now to maintain uninterrupted facility access.</p>
                 <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-logo hover:bg-logo/90 text-gray-900 w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-lg transition-all disabled:opacity-50"
                 >
                   {isProcessing ? "Connecting..." : "Pay $50.00 via Razorpay"}
                 </button>
               </div>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
