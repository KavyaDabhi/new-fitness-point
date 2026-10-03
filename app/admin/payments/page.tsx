"use client";

import { ShieldCheck, Search, User, Calendar, CheckCircle2, CreditCard, Wallet, Smartphone, X, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react"; // 👈 Added this import
import { supabase } from "@/lib/supabase";

// 🚨 REPLACE THIS WITH YOUR GYM'S ACTUAL UPI ID 🚨
const GYM_UPI_ID = "9824030321@okbizaxis"; 

export default function PaymentsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Search & Member State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Plans & Payment State
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState("Cash (Manual)");

  // UPI QR Code Modal State
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Load plans on mount
  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase.from("gym_plans").select("*").order("order_index", { ascending: true });
      if (data) setPlans(data);
    }
    loadPlans();
  }, []);

  // Handle Live Member Search
  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(5);

      if (!error && data) setSearchResults(data);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle Plan Selection Change
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.id.toString() === planId);
    if (plan) {
      setCustomAmount(plan.offer_active ? plan.offer_price : plan.regular_price);
    }
  };

  // Helper: Calculate new last_date
  const calculateNewDate = (planTitle: string, currentLastDate: string) => {
    const today = new Date();
    const currentEnd = currentLastDate ? new Date(currentLastDate) : today;
    
    const baseDate = currentEnd < today ? today : currentEnd;
    const newEnd = new Date(baseDate.getTime());

    const plan = planTitle.toLowerCase();
    if (plan.includes('year') || plan.includes('annual')) newEnd.setFullYear(newEnd.getFullYear() + 1);
    else if (plan.includes('6 month') || plan.includes('half')) newEnd.setMonth(newEnd.getMonth() + 6);
    else if (plan.includes('3 month') || plan.includes('quarter')) newEnd.setMonth(newEnd.getMonth() + 3);
    else if (plan.includes('1 month') || plan.includes('monthly')) newEnd.setMonth(newEnd.getMonth() + 1);

    return newEnd.toISOString().split('T')[0];
  };

  // Process the Payment & Update DB
  const handlePayment = async () => {
    if (!selectedMember || !selectedPlanId) {
      alert("Please select a member and a plan first.");
      return;
    }

    const plan = plans.find(p => p.id.toString() === selectedPlanId);
    if (!plan) return;

    // 🚨 IF UPI: Show QR code modal instead of submitting immediately
    if (selectedMethod === "UPI (Manual)") {
      setShowUpiModal(true);
      return;
    }

    // IF CASH: Show standard confirm dialog
    if (selectedMethod === "Cash (Manual)") {
      const confirmMsg = `Are you sure you want to log a Cash payment of ₹${customAmount} for ${selectedMember.name}?`;
      if (!window.confirm(confirmMsg)) return;
      await executeDatabaseRenewal(plan);
      return;
    }

    // IF RAZORPAY GATEWAY
    setIsProcessing(true);
    const options = {
      key: "rzp_test_TG32F5LsaeQnTH", 
      amount: (customAmount * 100).toString(), 
      currency: "INR", 
      name: "New Fitness Point Gym",
      description: `Admin Renewal - ${plan.title}`,
      image: "/logo.jpeg",
      handler: async function (response: any) {
        alert(`Gateway Success!\nPayment ID: ${response.razorpay_payment_id}`);
        await executeDatabaseRenewal(plan);
      },
      prefill: {
        name: selectedMember.name,
        email: selectedMember.email || "",
        contact: selectedMember.mobile_no || selectedMember.telephone || "",
      },
      theme: { color: "#e50100" },
      modal: { ondismiss: () => setIsProcessing(false) }
    };

    try {
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Razorpay SDK Error", error);
      alert("Failed to load Razorpay. Check connection.");
      setIsProcessing(false);
    }
  };

  // The actual Supabase Update Function
  const executeDatabaseRenewal = async (plan: any) => {
    setIsProcessing(true);
    try {
      const newLastDate = calculateNewDate(plan.title, selectedMember.last_date);
      
      const { error } = await supabase
        .from('members')
        .update({
          plan: plan.title,
          amount: customAmount,
          status: 'ACTIVE',
          duration: plan.title, 
          last_date: newLastDate,
        })
        .eq('id', selectedMember.id);

      if (error) throw error;
      
      alert(`Successfully renewed ${selectedMember.name} until ${newLastDate}!`);
      
      // Reset form
      setSelectedMember(null);
      setSearchQuery("");
      setSelectedPlanId("");
      setCustomAmount(0);
      setShowUpiModal(false); // Close QR modal if open
    } catch (error: any) {
      console.error("DB Update Error", error);
      alert("Payment noted, but failed to update member record: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate the standard UPI Intent URL
  const upiIntentUrl = `upi://pay?pa=${GYM_UPI_ID}&pn=New%20Fitness%20Point&am=${customAmount}&cu=INR`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* --- UPI QR CODE MODAL --- */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center"
            >
              <button 
                onClick={() => setShowUpiModal(false)}
                className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-logo/10 text-logo rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-1">Scan to Pay</h2>
              <p className="text-gray-500 text-sm font-medium mb-6">Ask {selectedMember?.name} to scan this code.</p>

              <div className="bg-white border-4 border-gray-100 p-4 rounded-3xl shadow-sm mb-6">
                <QRCodeSVG 
                  value={upiIntentUrl} 
                  size={200} 
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                />
              </div>

              <div className="bg-gray-50 w-full p-4 rounded-xl mb-6 border border-gray-200">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-gray-900">₹{customAmount}</p>
              </div>

              <button 
                onClick={() => executeDatabaseRenewal(plans.find(p => p.id.toString() === selectedPlanId))}
                disabled={isProcessing}
                className="w-full bg-black text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Payment Received</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <div className="w-14 h-14 bg-logo/10 border border-logo/20 text-logo rounded-2xl flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">ADMIN OVERRIDE</h1>
          <p className="text-gray-500 font-medium text-sm">Process manual payments and force renewals for members.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Search & Member Selection */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 relative z-20">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">1. Find Member</h3>
            
            {!selectedMember ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..." 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors placeholder:text-gray-400 shadow-sm" 
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchQuery.length > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(member => (
                          <div 
                            key={member.id}
                            onClick={() => {
                              setSelectedMember(member);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <div>
                              <p className="font-black text-gray-900 uppercase">{member.name}</p>
                              <p className="text-xs text-gray-500 font-medium">{member.mobile_no || member.email || "No contact info"}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {member.status || "UNKNOWN"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No members found</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Selected Member Card */
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-wide">{selectedMember.name}</h4>
                    <p className="text-xs font-medium text-gray-500">{selectedMember.email || selectedMember.mobile_no}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs border border-gray-100">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-widest mb-1">Current Plan</span>
                    <span className="font-black text-gray-700 uppercase">{selectedMember.plan || "None"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase tracking-widest mb-1">Due Date</span>
                    <span className={`font-black uppercase flex items-center gap-1 ${new Date(selectedMember.last_date) < new Date() ? 'text-logo' : 'text-green-600'}`}>
                      <Calendar className="w-3 h-3" />
                      {selectedMember.last_date ? new Date(selectedMember.last_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Details */}
        <div className={`space-y-6 transition-all duration-300 ${!selectedMember ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">2. Renewal Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <select 
                  value={selectedPlanId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-black uppercase focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo appearance-none cursor-pointer shadow-sm"
                >
                  <option value="" disabled>-- Select a Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-black">₹</span>
                <input 
                  type="number" 
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-black text-lg focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo shadow-sm"
                />
                <span className="absolute -top-2.5 right-4 bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-logo">Amount Override</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">3. Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Cash (Manual)', icon: Wallet },
                { name: 'UPI (Manual)', icon: Smartphone },
                { name: 'Razorpay Gateway', icon: CreditCard }
              ].map(method => (
                <div 
                  key={method.name} 
                  onClick={() => setSelectedMethod(method.name)}
                  className={`border rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    selectedMethod === method.name 
                      ? "border-logo bg-logo/5 shadow-md" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <method.icon className={`w-5 h-5 ${selectedMethod === method.name ? "text-logo" : "text-gray-400"}`} />
                  <span className={`font-bold text-[10px] uppercase tracking-wider ${selectedMethod === method.name ? "text-logo" : "text-gray-500"}`}>
                    {method.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={handlePayment}
              disabled={isProcessing || !selectedMember || !selectedPlanId}
              className={`w-full text-white font-black text-sm uppercase tracking-widest rounded-xl py-5 shadow-lg transition-all flex items-center justify-center gap-2 ${
                isProcessing || !selectedMember || !selectedPlanId
                  ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none" 
                  : "bg-logo hover:bg-red-700 hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> {selectedMethod === "UPI (Manual)" ? "Generate QR Code" : "Confirm & Renew"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}