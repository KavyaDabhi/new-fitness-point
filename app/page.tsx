"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Users, Star, MapPin, Phone, Mail, X, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

// --- PERMANENT STANDARD PLANS (ALWAYS VISIBLE) ---
const standardPlans = [
  {
    title: '3 Months Plan',
    subtitle: 'Perfect for getting started.',
    price: 4500,
    features: ['All Gym Equipment', 'Cardio & Weights', 'Locker Room Access'],
    button_text: 'Select Plan',
    is_popular: false
  },
  {
    title: '1 Year Plan',
    subtitle: 'The ultimate fitness commitment.',
    price: 10500,
    features: ['Complete Floor Access', 'Expert Guidance', 'Premium Support', 'Priority Updates'],
    button_text: 'Select 1 Year Plan',
    is_popular: true
  },
  {
    title: '6 Months Plan',
    subtitle: 'Best for steady progress.',
    price: 6500,
    features: ['All Gym Equipment', 'Cardio & Weights', 'Locker Room Access'],
    button_text: 'Select Plan',
    is_popular: false
  }
];

export default function Home() {
  const [actionRoute, setActionRoute] = useState("/login");
  const [mapKey, setMapKey] = useState(0);
  
  // State for dynamic offers fetched from Supabase
  const [offers, setOffers] = useState<any[]>([]);

  // --- PAYMENT MODAL STATES ---
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Check Auth Status
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setActionRoute("/member");
    };
    checkUser();

    // 2. Fetch ACTIVE Offers dynamically from Supabase
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('gym_plans')
          .select('*')
          .eq('is_offer_active', true) // ONLY FETCH ACTIVE OFFERS
          .order('order_index', { ascending: true });
        
        if (data && data.length > 0 && !error) {
          setOffers(data);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };
    fetchOffers();

    // 3. Auth Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setActionRoute("/member");
        } else {
          setActionRoute("/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- UPI DEEP LINK LOGIC ---
  const handleUPIIntent = (appType: string) => {
    if (!selectedPlan) return;
    
    const upiId = "9824030321@okbizaxis"; 
    const gymName = "New Fitness Point Gym";
    const amount = selectedPlan.price;
    const note = `New_Member_${selectedPlan.title.replace(/\s+/g, '_')}`;

    let upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    if (appType === "gpay") {
      upiLink = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appType === "phonepe") {
      upiLink = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appType === "paytm") {
      upiLink = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    }

    // Opens the app natively on their phone
    window.location.href = upiLink;
  };

  // --- RAZORPAY INTEGRATION LOGIC ---
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    const paymentAmount = selectedPlan.price * 100;

    const options = {
      key: "rzp_test_TG32F5LsaeQnTH", 
      amount: paymentAmount,
      currency: "INR",
      name: "New Fitness Point",
      description: `Purchase: ${selectedPlan.title}`,
      image: "/logo.jpeg",
      handler: function (response: any) {
        console.log(response);
        alert(`Payment Successful! Welcome to the Gym! ID: ${response.razorpay_payment_id}`);
        setShowPaymentOptions(false);
      },
      prefill: {
        name: "", 
        email: "",
        contact: "",
      },
      theme: {
        color: "#e50100", 
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on("payment.failed", function (response: any) {
      alert("Payment Failed or Cancelled.");
      console.error(response.error);
    });
    
    paymentObject.open();
    setIsProcessing(false);
  };

  const handleSelectPlan = (planTitle: string, planPrice: number) => {
    setSelectedPlan({ title: planTitle, price: planPrice });
    setShowPaymentOptions(true);
  };

  return (
    <div className="w-full flex flex-col">
      
      {/* --- PAYMENT MODAL OVERLAY (BLINKIT STYLE) --- */}
      <AnimatePresence>
        {showPaymentOptions && selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(229,1,0,0.15)] relative"
            >
              <button 
                onClick={() => setShowPaymentOptions(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-logo rounded-full p-2 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 mt-2 border-b border-white/10 pb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Completing Purchase</h3>
                <p className="text-2xl font-black text-white tracking-tight font-serif uppercase">{selectedPlan.title}</p>
                <p className="text-4xl font-black text-logo mt-2">
                  ₹{selectedPlan.price}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Select Payment App</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleUPIIntent('gpay')} className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:border-white/30 hover:-translate-y-1">
                    <span className="font-bold text-sm text-white">GPay</span>
                  </button>
                  
                  <button onClick={() => handleUPIIntent('phonepe')} className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:border-white/30 hover:-translate-y-1">
                    <span className="font-bold text-sm text-[#5f259f] brightness-150">PhonePe</span>
                  </button>
                </div>

                <button onClick={() => handleUPIIntent('paytm')} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-xl font-bold text-sm text-[#00b9f5] transition-all hover:border-white/30 hover:-translate-y-1">
                  Paytm
                </button>

                <button onClick={() => handleUPIIntent('generic')} className="w-full bg-transparent hover:bg-white/5 border border-white/10 py-3.5 rounded-xl font-bold text-sm text-gray-300 transition-colors">
                  Other UPI Apps
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing} 
                  className="w-full bg-logo hover:bg-red-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(229,1,0,0.3)] hover:shadow-[0_0_30px_rgba(229,1,0,0.5)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Cards / Netbanking</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ------------------------------------------- */}

      {/* Hero Section - Proper Dark Glass */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:py-24 md:px-20 w-full max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="mb-6 relative z-10"
          >
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
              Push Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-logo to-red-800 drop-shadow-none">Limits</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-xl text-gray-300 max-w-2xl mb-12 font-medium relative z-10"
          >
            Welcome to <strong className="text-white">New Fitness Point Gym</strong>. Experience our aesthetic 3D environment, world-class equipment, and premium training protocols designed to sculpt your best self.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 relative z-10"
          >
            <Link href={actionRoute} className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2, boxShadow: "0px 10px 30px rgba(229, 1, 0, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-logo text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl border border-red-500/50 transition-all text-sm md:text-base"
              >
                Start Membership
              </motion.button>
            </Link>
            <Link href="#plans" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white/5 backdrop-blur-xl border border-white/20 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-xl text-sm md:text-base"
              >
                Explore Plans
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Scroll Down</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-logo rounded-full shadow-[0_0_10px_rgba(229,1,0,0.8)]"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section (Bento Grid) */}
      <div className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Why Choose Us</h2>
            <div className="w-20 md:w-24 h-1.5 bg-logo rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Left large bento block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-14 flex flex-col justify-between relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)] min-h-[400px]"
            >
              <div className="absolute -right-10 -bottom-10 text-[150px] md:text-[200px] font-black text-white/5 leading-none group-hover:scale-110 transition-transform duration-700">01</div>
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-8 md:mb-10 group-hover:-translate-y-2 group-hover:border-logo/50 transition-all duration-500">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tight text-white uppercase">Modern Equipment</h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md">Train with the latest biomechanically perfect machinery and premium free weights in our meticulously designed aesthetic facility.</p>
              </div>
            </motion.div>

            {/* Right side stacked bento blocks */}
            <div className="grid grid-rows-2 gap-6 md:gap-10">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute -right-4 -bottom-4 text-[100px] md:text-[120px] font-black text-white/5 leading-none group-hover:scale-110 transition-transform duration-700">02</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-6 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-1 group-hover:border-logo/50 transition-all duration-500">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Elite Trainers</h3>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">Our certified professionals provide personalized training protocols tailored to your exact physical goals.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-logo/10 backdrop-blur-3xl border border-logo/20 rounded-[2rem] p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute -right-4 -bottom-4 text-[100px] md:text-[120px] font-black text-logo/10 leading-none group-hover:scale-110 transition-transform duration-700">03</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-6 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-logo/20 border border-logo/30 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-all duration-500">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Premium Vibes</h3>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm">A cinematic, minimalist dark environment equipped with premium lighting that keeps you focused.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section */}
      <div className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Elite Programs</h2>
              <div className="w-20 md:w-24 h-1.5 bg-logo rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 max-w-md text-base md:text-lg font-medium"
            >
              Specialized training tracks designed for maximum results. Select your discipline.
            </motion.p>
          </div>

          <div className="flex flex-col border-t border-white/10">
            {[
              { title: "Strength & Conditioning", tag: "Build Power & Endurance" },
              { title: "Hypertrophy Specialist", tag: "Maximum Muscle Growth" },
              { title: "High-Intensity Interval", tag: "Advanced Fat Burn" },
              { title: "Recovery & Mobility", tag: "Flexibility & Prevention" }
            ].map((prog, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group border-b border-white/10 py-6 md:py-12 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:md:px-8 hover:bg-white/5 hover:backdrop-blur-md transition-all duration-500 rounded-xl px-2"
              >
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase group-hover:text-logo group-hover:drop-shadow-[0_0_15px_rgba(229,1,0,0.8)] transition-all duration-300 mb-3 md:mb-0">
                  {prog.title}
                </h3>
                <div className="flex items-center gap-6 md:gap-8 justify-between w-full md:w-auto">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{prog.tag}</span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-logo group-hover:border-logo group-hover:shadow-[0_0_15px_rgba(229,1,0,0.6)] transition-all duration-300">
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white md:opacity-0 md:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION 1: PERMANENT STANDARD MEMBERSHIP PLANS --- */}
      <div id="plans" className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 text-white">Membership Plans</h2>
            <div className="w-20 md:w-24 h-1.5 bg-logo mx-auto rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 max-w-6xl mx-auto">
            {standardPlans.map((plan, index) => {
              const isCenter = plan.is_popular;
              const isLeft = index === 0;
              const isRight = index === standardPlans.length - 1;

              const containerClasses = `group bg-white/5 backdrop-blur-3xl hover:bg-black/60 border border-white/10 hover:border-logo/50 transition-all duration-500 relative ${
                isCenter
                  ? "rounded-[2rem] lg:rounded-[2.5rem] hover:z-30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-10 md:p-12 w-full lg:w-[40%] z-20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] order-first lg:order-none mb-4 lg:mb-0"
                  : `rounded-[2rem] lg:rounded-[2.5rem] hover:z-30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 w-full lg:w-1/3 z-10 shadow-2xl ${isLeft ? 'lg:rounded-r-none' : ''} ${isRight ? 'lg:rounded-l-none' : ''} hover:lg:rounded-[2.5rem]`
              }`;

              return (
                <motion.div
                  key={plan.title}
                  initial={{ opacity: 0, x: isLeft ? -30 : isRight ? 30 : 0, y: isCenter ? 30 : 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  className={containerClasses}
                >
                  {isCenter && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 group-hover:bg-logo group-hover:border-logo text-gray-300 group-hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg group-hover:shadow-[0_0_20px_rgba(229,1,0,0.6)] transition-all duration-300 backdrop-blur-md whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className={`text-xl md:text-2xl font-black mb-2 tracking-tight uppercase text-white group-hover:text-logo transition-colors duration-300 ${isCenter ? 'text-center md:text-3xl mt-2 md:mt-0 drop-shadow-sm' : ''}`}>
                    {plan.title}
                  </h3>
                  <p className={`text-gray-400 group-hover:text-gray-300 text-sm mb-6 font-medium transition-colors duration-300 ${isCenter ? 'text-center' : ''}`}>
                    {plan.subtitle}
                  </p>
                  
                  <div className={`mb-8 border-b border-white/5 group-hover:border-white/10 pb-4 transition-colors duration-300 flex flex-col ${isCenter ? 'text-center items-center pb-8' : ''}`}>
                    <div className="mt-4">
                      <span className={`${isCenter ? 'text-6xl md:text-7xl' : 'text-4xl md:text-5xl'} font-black tracking-tighter text-white transition-colors duration-300`}>₹{plan.price}</span>
                    </div>
                  </div>
                  
                  <ul className={`space-y-4 mb-8 ${isCenter ? 'md:space-y-5 mb-10' : ''}`}>
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className={`flex items-center gap-3 text-sm text-gray-300 group-hover:text-white font-medium transition-colors duration-300 ${isCenter ? 'justify-center font-bold' : ''}`}>
                        <Star className={`w-4 h-4 text-logo/80 group-hover:text-logo shrink-0 ${isCenter ? 'md:w-5 md:h-5 group-hover:drop-shadow-[0_0_5px_rgba(229,1,0,0.8)] transition-all' : ''}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  
                  {/* CHANGED TO MODAL TRIGGER INSTEAD OF LINK */}
                  <button 
                    onClick={() => handleSelectPlan(plan.title, plan.price)}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-white/10 border border-white/10 group-hover:bg-logo group-hover:border-logo text-white group-hover:shadow-[0_0_20px_rgba(229,1,0,0.4)] group-hover:-translate-y-1 ${isCenter ? 'md:py-5 rounded-full font-black' : ''}`}
                  >
                    {plan.button_text}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: DYNAMIC ADMIN OFFERS (ONLY SHOWS IF OFFERS EXIST IN DB) --- */}
      {offers.length > 0 && (
        <div className="relative z-10 bg-gradient-to-b from-red-900/10 to-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 text-white drop-shadow-[0_0_15px_rgba(229,1,0,0.3)]">Limited Time Offers</h2>
              <div className="w-20 md:w-24 h-1.5 bg-logo mx-auto rounded-full shadow-[0_0_15px_rgba(229,1,0,0.8)]"></div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-8 max-w-6xl mx-auto">
              {offers.map((offer) => {
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="group bg-[#111] backdrop-blur-3xl hover:bg-black/80 border border-logo/30 hover:border-logo transition-all duration-500 relative rounded-[2.5rem] p-10 md:p-12 w-full lg:w-[40%] z-20 shadow-[0_10px_40px_rgba(229,1,0,0.15)] hover:shadow-[0_20px_60px_rgba(229,1,0,0.3)] hover:-translate-y-2"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-logo border border-red-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(229,1,0,0.6)] transition-all duration-300 whitespace-nowrap">
                      Special Deal
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight uppercase text-center text-white mt-2 drop-shadow-sm">
                      {offer.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 text-center font-medium">
                      {offer.subtitle}
                    </p>
                    
                    <div className="mb-8 text-center border-b border-white/10 pb-8 flex flex-col items-center">
                      <span className="text-xl text-gray-500 line-through font-bold mb-1">₹{offer.regular_price}</span>
                      <div>
                        <span className="text-6xl md:text-7xl font-black tracking-tighter text-white">₹{offer.offer_price}</span>
                      </div>
                      <span className="text-white text-sm font-black mt-4 tracking-widest uppercase bg-logo inline-block px-4 py-1.5 rounded-md shadow-[0_0_15px_rgba(229,1,0,0.5)]">
                        {offer.offer_text}
                      </span>
                    </div>
                    
                    <ul className="space-y-4 md:space-y-5 mb-10">
                      {offer.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-center justify-center gap-3 text-sm text-gray-300 font-bold">
                          <Star className="w-4 h-4 md:w-5 md:h-5 text-logo drop-shadow-[0_0_5px_rgba(229,1,0,0.8)] shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    
                    {/* CHANGED TO MODAL TRIGGER INSTEAD OF LINK */}
                    <button 
                      onClick={() => handleSelectPlan(offer.title, offer.offer_price)}
                      className="w-full py-4 md:py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all bg-white/10 border border-white/20 hover:bg-logo hover:border-logo text-white hover:shadow-[0_0_20px_rgba(229,1,0,0.4)]"
                    >
                      {offer.button_text || 'Claim Offer'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTACT SECTION WITH ACTUAL GYM DETAILS --- */}
      <section className="w-full py-20 px-4 flex flex-col items-center border-t border-white/10 relative z-10">
        <div className="w-full max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Find <span className="text-logo">Us</span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto">
              Drop by for a tour of the facility, or reach out to Rajesh Mishra to start your fitness journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Contact Info Card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col justify-center gap-10 hover:border-white/20 transition-all duration-500">
              
              {/* Address */}
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-logo/10 group-hover:border-logo/50 group-hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <MapPin className="w-6 h-6 text-logo" />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Location</h4>
                  <p className="text-gray-400 leading-relaxed font-medium">
                    New Fitness Point<br/>
                    Shanti Nagar, College Road<br/>
                    Nadiad - 387001, Gujarat, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-logo/10 group-hover:border-logo/50 group-hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <Phone className="w-6 h-6 text-logo" />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Contact</h4>
                  <p className="text-gray-400 leading-relaxed font-medium">
                    Rajesh Mishra<br/>
                    +91 98240 30321
                    Smith Mishra<br/>
                    +91 6358 222800
                    NFP Gym <br/>
                    80000 41999
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-logo/10 group-hover:border-logo/50 group-hover:-translate-y-1 transition-all duration-300 shadow-lg">
                  <Mail className="w-6 h-6 text-logo" />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Email</h4>
                  <p className="text-gray-400 leading-relaxed font-medium">
                    Newfitnesspointgym@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Map Embed Card - WITH BIG RED PIN & AUTO RESET */}
            <div 
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-2xl min-h-[400px] lg:min-h-full overflow-hidden relative flex group hover:border-white/20 transition-all duration-500"
              onMouseLeave={() => setMapKey(prev => prev + 1)} // This triggers the reset!
            >
              <div className="absolute inset-4 rounded-xl overflow-hidden bg-[#111]">
                <iframe 
                  key={mapKey} // React sees a new key and remounts the iframe fresh
                  src="https://maps.google.com/maps?q=New%20Fitness%20Point,%20Nadiad,%20Gujarat&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full opacity-80 group-hover:opacity-100 [filter:grayscale(100%)_invert(90%)_contrast(85%)_hue-rotate(180deg)] group-hover:[filter:none] transition-all duration-700"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="w-full py-8 text-center border-t border-white/10 relative z-10">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
          © 2026 New Fitness Point Gym. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}