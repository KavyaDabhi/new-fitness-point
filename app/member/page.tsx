"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle2, QrCode, X, LogOut } from "lucide-react"; 
import { Scanner } from '@yudiel/react-qr-scanner'; 

export default function SingleMemberPage() {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authUserEmail, setAuthUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- NEW SCANNER STATES ---
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  
  // --- NEW PAYMENT CHOOSER STATE ---
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    async function initPage() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        // --- NEW ADMIN BOUNCER ---
        // 🚨 REPLACE THIS WITH YOUR EXACT LOGIN EMAIL 🚨
        const adminEmails = ["newfitnesspointgym@gmail.com", "dabhikavy189@gmail.com"]; 
        if (user.email && adminEmails.includes(user.email.toLowerCase())) {
          router.push("/admin");
          return; // Stop running the rest of the member code
        }
        // -------------------------

        setAuthUserEmail(user.email || "");
        let fetchedMember = null;

        if (user.email) {
          const { data: emailData } = await supabase
            .from("members")
            .select("*")
            .eq("email", user.email)
            .limit(1);
          
          if (emailData && emailData.length > 0) fetchedMember = emailData[0];
        }

        if (!fetchedMember) {
          const rawName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "";
          const nameParts = rawName.replace(/\s+/g, ' ').trim().split(' ');
          
          if (nameParts.length > 0) {
            const searchPattern = `%${nameParts.join('%')}%`;
            const { data: nameData } = await supabase
              .from("members")
              .select("*")
              .ilike("name", searchPattern)
              .limit(1);
              
            if (nameData && nameData.length > 0) fetchedMember = nameData[0];
          }
        }

        if (fetchedMember) setMemberData(fetchedMember);
      } catch (err) {
        console.error("Error during initialization:", err);
      } finally {
        setLoading(false);
      }
    }
    
    initPage();
  }, [router]);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // --- ATTENDANCE SCAN LOGIC (FIXED FOR DB SYNC) ---
  // --- SMART ATTENDANCE SCAN LOGIC (CHECK-IN & CHECK-OUT) ---
  const handleQRScan = async (result: any) => {
    if (result && result.length > 0 && scanStatus !== "success") {
      
      const qrData = result[0].rawValue; 
      
      // Security Check
      if (!qrData.includes("new-fitness-point") && !qrData.includes("TMP-")) {
        alert("Invalid QR Code. Please scan the official screen at the front desk.");
        setScanStatus("error");
        setTimeout(() => setScanStatus("scanning"), 3000);
        return;
      }

      setScanStatus("success");

      try {
        const today = new Date().toLocaleDateString('en-CA');
        
        // 1. Try to Check In
        const { error: insertError } = await supabase
          .from("attendance")
          .insert([
            { 
              member_id: memberData.id,
              date: today
            }
          ]);

        if (insertError) {
          // 2. If already checked in today, perform a Check Out instead!
          if (insertError.code === '23505') {
            const { error: updateError } = await supabase
              .from("attendance")
              .update({ check_out_time: new Date().toISOString() })
              .eq("member_id", memberData.id)
              .eq("date", today)
              .is("check_out_time", null); // Only update if they haven't checked out yet

            if (updateError) throw updateError;
            alert("Checked Out! See you next time. 💪");
          } else {
            throw insertError;
          }
        } else {
          alert("Checked In! Have a great workout. 🔥");
        }

        setTimeout(() => {
          setShowScanner(false);
          setScanStatus("idle");
        }, 2000);

      } catch (err) {
        console.error("Attendance Error:", err);
        setScanStatus("error");
        setTimeout(() => setScanStatus("scanning"), 3000); 
      }
    }
  };

  // --- UPI DEEP LINK LOGIC ---
  const handleUPIIntent = (appType: string) => {
    const upiId = "9824030321@okbizaxis"; 
    const gymName = "New Fitness Point Gym";
    const amount = memberData.amount || 7000;
    
    const note = `Renewal_${memberData.name?.replace(/\s+/g, '_')}`;

    let upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    if (appType === "gpay") {
      upiLink = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appType === "phonepe") {
      upiLink = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appType === "paytm") {
      upiLink = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(gymName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    }

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
    setIsProcessing(true);
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    const paymentAmount = (memberData.amount || 7000) * 100;

    const options = {
      key: "rzp_test_TG32F5LsaeQnTH", 
      amount: paymentAmount,
      currency: "INR",
      name: "New Fitness Point",
      description: `Renewal for ${memberData.plan || 'Membership'}`,
      image: "/logo.jpeg",
      handler: function (response: any) {
        console.log(response);
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: memberData.name || "",
        email: authUserEmail || "",
        contact: memberData.mobile_no || memberData.telephone || "",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#e50100] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase animate-pulse">Loading Portal...</p>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0a0a] to-[#0a0a0a] py-10 px-4 flex flex-col items-center relative overflow-hidden">
        <div className="w-full max-w-[900px] z-20 flex justify-end items-center mb-12 font-sans">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-[#e50100]/20 border border-white/10 hover:border-[#e50100]/50 rounded-full transition-all duration-300 text-gray-400 hover:text-[#e50100] hover:shadow-[0_0_15px_rgba(229,1,0,0.3)]"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Profile Not Found</h2>
          <p className="text-gray-400 text-sm">We couldn't locate your membership details. Please contact the front desk.</p>
        </div>
      </div>
    );
  }

  const calculateDynamicDueDate = (joinDateStr: string, planStr: string, dbLastDate: string) => {
    if (!joinDateStr || !planStr) return dbLastDate;
    const start = new Date(joinDateStr);
    if (isNaN(start.getTime())) return dbLastDate;

    const plan = planStr.toLowerCase();
    const end = new Date(start.getTime());

    if (plan.includes('1 year') || plan.includes('yearly') || plan.includes('annual')) {
      end.setFullYear(end.getFullYear() + 1);
    } else if (plan.includes('6 month') || plan.includes('half')) {
      end.setMonth(end.getMonth() + 6);
    } else if (plan.includes('3 month') || plan.includes('quarter')) {
      end.setMonth(end.getMonth() + 3);
    } else if (plan.includes('1 month') || plan.includes('monthly')) {
      end.setMonth(end.getMonth() + 1);
    } else {
      return dbLastDate;
    }
    return end.toISOString();
  };

  const dynamicLastDate = calculateDynamicDueDate(
    memberData.join_date || memberData.joined_date, 
    memberData.plan, 
    memberData.last_date
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const calculateSubscription = () => {
    const joinStr = memberData.join_date || memberData.joined_date;
    const endStr = dynamicLastDate; 
    
    if (!joinStr || !endStr) return { daysLeft: 0, progress: 0, isActive: false, totalDays: 0 };

    const start = new Date(joinStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date().getTime();

    const totalTime = end - start;
    const remainingTime = end - now;
    const elapsedTime = now - start;

    const totalDays = Math.max(1, Math.ceil(totalTime / (1000 * 60 * 60 * 24)));
    const daysLeft = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    let progress = (elapsedTime / totalTime) * 100;
    if (progress > 100) progress = 100;
    if (progress < 0) progress = 0;

    return { daysLeft, progress, isActive: daysLeft > 0, totalDays };
  };

  const subStatus = calculateSubscription();
  const safeLastDate = formatDate(dynamicLastDate); 

  const programsList = ["Fitness", "Weight Mana'nt", "Personal Traning", "Physiotherapy", "Medical Condition", "Slimming", "other"];
  const isCurrentPlan = (prog: string) => {
    const userPlan = (memberData.plan || "").toLowerCase();
    const rowPlan = prog.toLowerCase();
    if (prog === "other" && !programsList.slice(0, 6).some(p => userPlan.includes(p.toLowerCase()))) return userPlan !== ""; 
    return userPlan.includes(rowPlan) || rowPlan.includes(userPlan);
  };

  const activePrograms = programsList.filter(prog => isCurrentPlan(prog));

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0a0a] to-[#0a0a0a] py-6 md:py-10 px-4 flex flex-col items-center relative overflow-hidden">
      
      {/* --- QR SCANNER MODAL OVERLAY --- */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(229,1,0,0.15)] relative"
            >
              <button 
                onClick={() => { setShowScanner(false); setScanStatus("idle"); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-red-600 rounded-full p-2 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 mt-2">
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Scanner</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Scan desk QR for attendance</p>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-square bg-black border border-white/5 flex items-center justify-center">
                {scanStatus === "success" ? (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="flex flex-col items-center text-green-500"
                  >
                    <CheckCircle2 className="w-16 h-16 mb-2" />
                    <span className="font-bold uppercase tracking-widest text-sm">Checked In!</span>
                  </motion.div>
                ) : (
                  <Scanner 
                    onScan={handleQRScan}
                    components={{ zoom: false, finder: false }}
                    styles={{ container: { width: '100%', height: '100%' } }}
                  />
                )}

                {scanStatus !== "success" && (
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-[#e50100] shadow-[0_0_15px_#e50100] z-10"
                  />
                )}
              </div>
              
              {scanStatus === "error" && (
                <p className="text-red-500 text-xs text-center mt-4 font-bold tracking-widest uppercase animate-pulse">
                  Scan Failed. Try Again.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOP NAVIGATION BAR --- */}
      <div className="w-full max-w-[900px] z-20 flex justify-end items-center mb-8 gap-4 md:gap-6 font-sans">
        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest hidden sm:block">
          Trainers
        </span>
        
        <div className="flex items-center gap-2 bg-[#111] border border-white/10 px-4 py-2 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          <span className="text-white text-xs font-bold uppercase tracking-widest truncate max-w-[150px] sm:max-w-[200px]">
            {memberData.name || "Member"}
          </span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-[#e50100]/20 border border-white/10 hover:border-[#e50100]/50 rounded-full transition-all duration-300 text-gray-400 hover:text-[#e50100] hover:shadow-[0_0_15px_rgba(229,1,0,0.3)]"
          title="Log Out"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] z-10 font-sans">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">{memberData.plan || "N/A"}</h3>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black tracking-wider uppercase border ${subStatus.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {subStatus.isActive ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {subStatus.isActive ? 'Active' : 'Expired'}
                </div>
              </div>

              <div className="mt-8 bg-black/20 p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4"/> 
                    {formatDate(memberData.join_date || memberData.joined_date) || "N/A"}
                  </span>
                  <span className={subStatus.daysLeft <= 7 ? "text-red-400" : "text-gray-300"}>
                    <Clock className="w-4 h-4 inline mr-1 mb-0.5"/> 
                    {subStatus.daysLeft > 0 ? `${subStatus.daysLeft} Days Left` : "0 Days Left"}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(currentColor,0.5)] ${subStatus.daysLeft <= 7 ? 'bg-[#e50100]' : 'bg-gray-400'}`}
                    style={{ width: `${subStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setShowScanner(true); setScanStatus("scanning"); }}
              className="mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              <QrCode className="w-4 h-4 text-[#e50100]" /> Check In (Scan QR)
            </button>
          </div>

          <div className="bg-[#111] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all duration-500 group-hover:bg-red-600/30 group-hover:scale-150"></div>
            
            <div className="relative z-10 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Renewal Amount</p>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-4">
                {memberData.amount ? `₹${memberData.amount}` : "TBD"}
              </h3>
              <p className={`text-sm font-medium flex items-center gap-2 ${!safeLastDate || subStatus.daysLeft <= 0 ? 'text-red-400' : 'text-gray-400'}`}>
                <Calendar className="w-4 h-4" /> 
                Due: {safeLastDate ? safeLastDate : "Expired"}
              </p>
            </div>

            <div className="relative z-10 w-full mt-auto">
              {!showPaymentOptions ? (
                <button 
                  onClick={() => setShowPaymentOptions(true)}
                  className="w-full bg-[#e50100] hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(229,1,0,0.3)] hover:shadow-[0_0_30px_rgba(229,1,0,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  <CreditCard className="w-5 h-5" /> Pay Securely
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex flex-col gap-2 mt-4"
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Select Payment App</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleUPIIntent('gpay')} className="bg-white/10 hover:bg-white/20 border border-white/5 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                      <span className="font-bold text-sm text-white">GPay</span>
                    </button>
                    
                    <button onClick={() => handleUPIIntent('phonepe')} className="bg-white/10 hover:bg-white/20 border border-white/5 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                      <span className="font-bold text-sm text-[#5f259f]">PhonePe</span>
                    </button>
                  </div>

                  <button onClick={() => handleUPIIntent('generic')} className="w-full bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-lg font-bold text-sm text-gray-300 transition-colors">
                    Other UPI Apps
                  </button>

                  <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-2 bg-transparent hover:bg-white/5 border border-gray-600 py-3 rounded-lg font-bold text-xs uppercase tracking-widest text-gray-400 transition-colors disabled:opacity-50">
                    {isProcessing ? "Loading..." : "Pay via Cards / Netbanking"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl w-full rounded-[2rem] shadow-2xl p-10 md:p-14 border border-white/10 font-serif text-white selection:bg-gray-700 relative overflow-hidden">
          
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-[120%] md:w-[600px] aspect-square"
            >
              <Image
                src="/logo.jpeg" 
                alt="New Fitness Point Watermark"
                fill
                className="object-contain opacity-10 grayscale mix-blend-screen"
                unoptimized
              />
            </motion.div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full z-0"></div>

          <div className="flex flex-col items-center mb-10 relative z-10 mt-6">
            <div className="w-full text-center border-b-[3px] border-[#e50100] pb-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-[0.10em] text-white uppercase">NEW FITNESS POINT GYM</h1>
            </div>
            <p className="italic text-gray-400 text-lg mt-3 tracking-wide font-sans">achieve your potential...</p>
          </div>

          <h2 className="relative z-10 text-center font-bold text-xl md:text-2xl tracking-widest text-white/90 mb-12 flex items-center justify-center gap-4">
            <span className="h-px bg-white/20 w-12 hidden md:block"></span>
            MEMBER REGISTRATION FORM
            <span className="h-px bg-white/20 w-12 hidden md:block"></span>
          </h2>

          <div className="space-y-8 text-[15px] font-medium leading-relaxed relative z-10">
            {memberData.name && (
              <div className="flex items-end">
                <span className="mr-4 whitespace-nowrap text-gray-400">Full Name: -</span>
                <div className="flex-1 flex flex-col">
                  <span className="border-b-[1.5px] border-white/30 text-center font-bold text-lg pb-1 px-4 tracking-widest uppercase text-white">
                    {memberData.name}
                  </span>
                  <div className="flex justify-between text-[9px] text-gray-500 px-10 pt-1 font-sans tracking-widest">
                    <span>NAME</span>
                    <span>MIDDLE NAME</span>
                    <span>SURNAME</span>
                  </div>
                </div>
              </div>
            )}

            {(memberData.dob || memberData.age) && (
              <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-x-8 gap-y-6">
                {memberData.dob && (
                  <div className="flex items-end flex-1 min-w-[250px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Date Of Birth: -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 text-center font-bold pb-1 tracking-wider text-white">
                      {formatDate(memberData.dob)}
                    </span>
                  </div>
                )}
                {memberData.age && (
                  <div className="flex items-end w-48">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Age : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 text-center font-bold pb-1 text-white">
                      {memberData.age}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(memberData.gender || memberData.height || memberData.weight) && (
              <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-x-8 gap-y-6">
                {memberData.gender && (
                  <div className="flex items-end flex-1 min-w-[300px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Gender: -</span>
                    <div className="flex gap-8 border-b-[1.5px] border-white/30 flex-1 pb-1 px-4 justify-center">
                      <label className="flex items-center gap-3 cursor-default text-gray-300">
                        <div className={`w-4 h-4 border-[1.5px] border-white/50 flex items-center justify-center rounded-sm transition-colors ${memberData.gender?.toLowerCase() === 'male' ? 'bg-[#e50100] border-[#e50100]' : ''}`}>
                          {memberData.gender?.toLowerCase() === 'male' && <span className="text-white font-black text-[10px]">✓</span>}
                        </div> Male
                      </label>
                      <label className="flex items-center gap-3 cursor-default text-gray-300">
                        <div className={`w-4 h-4 border-[1.5px] border-white/50 flex items-center justify-center rounded-sm transition-colors ${memberData.gender?.toLowerCase() === 'female' ? 'bg-[#e50100] border-[#e50100]' : ''}`}>
                          {memberData.gender?.toLowerCase() === 'female' && <span className="text-white font-black text-[10px]">✓</span>}
                        </div> Female
                      </label>
                    </div>
                  </div>
                )}
                {(memberData.height || memberData.weight) && (
                  <div className="flex items-end w-80">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Height / Weight : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 text-center font-bold pb-1 tracking-wider text-white">
                      {memberData.height || "-"} / {memberData.weight || "-"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(memberData.occupation || memberData.blood_group) && (
              <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-x-8 gap-y-6">
                {memberData.occupation && (
                  <div className="flex items-end flex-1 min-w-[250px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Occupation: -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 font-bold text-center pb-1 text-white">
                      {memberData.occupation}
                    </span>
                  </div>
                )}
                {memberData.blood_group && (
                  <div className="flex items-end w-64">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Blood Group : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 text-center font-bold pb-1 text-[#e50100]">
                      {memberData.blood_group}
                    </span>
                  </div>
                )}
              </div>
            )}

            {memberData.address && (
              <div className="flex items-end">
                <span className="mr-4 whitespace-nowrap text-gray-400">Address : -</span>
                <span className="border-b-[1.5px] border-white/30 flex-1 font-bold pl-4 pb-1 text-white leading-relaxed">
                  {memberData.address}
                </span>
              </div>
            )}

            {(memberData.city || memberData.pincode) && (
              <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-x-8 gap-y-6">
                {memberData.city && (
                  <div className="flex items-end flex-1 min-w-[250px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">City : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 font-bold text-center pb-1 tracking-wider text-white">
                      {memberData.city}
                    </span>
                  </div>
                )}
                {memberData.pincode && (
                  <div className="flex items-end w-64">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Pincode : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 text-center font-bold pb-1 tracking-widest text-white">
                      {memberData.pincode}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(memberData.telephone || memberData.mobile_no) && (
              <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-x-8 gap-y-6">
                {memberData.telephone && (
                  <div className="flex items-end flex-1 min-w-[250px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Telephone : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 font-bold text-center pb-1 tracking-widest text-white">
                      {memberData.telephone}
                    </span>
                  </div>
                )}
                {memberData.mobile_no && (
                  <div className="flex items-end flex-1 min-w-[250px]">
                    <span className="mr-4 whitespace-nowrap text-gray-400">Mobile : -</span>
                    <span className="border-b-[1.5px] border-white/30 flex-1 font-bold text-center pb-1 tracking-widest text-white">
                      {memberData.mobile_no}
                    </span>
                  </div>
                )}
              </div>
            )}

            {authUserEmail && (
              <div className="flex items-end">
                <span className="mr-4 whitespace-nowrap text-gray-400">E – Mail ( ID ) : -</span>
                <span className="border-b-[1.5px] border-white/30 flex-1 font-bold pl-4 pb-1 tracking-wide text-white font-sans">
                  {authUserEmail}
                </span>
              </div>
            )}
          </div>

          {activePrograms.length > 0 && (
            <div className="mt-16 relative z-10">
              <h3 className="text-center font-bold mb-6 tracking-[0.2em] text-white/90 text-lg flex items-center justify-center gap-4">
                <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
                PROGRAM DETAILS
                <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
              </h3>
              
              <div className="border border-white/10 p-[1px] rounded-xl bg-white/5 shadow-inner overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-center text-[14px] font-sans">
                    <thead>
                      <tr className="bg-black/40 text-gray-400">
                        <th className="border-b border-r border-white/10 py-4 px-4 font-bold uppercase tracking-widest w-1/3">PROGRAMS</th>
                        <th className="border-b border-r border-white/10 py-4 px-3 font-bold uppercase tracking-widest">DURATION</th>
                        <th className="border-b border-r border-white/10 py-4 px-3 font-bold uppercase tracking-widest">JOIN DATE</th>
                        <th className="border-b border-r border-white/10 py-4 px-3 font-bold uppercase tracking-widest">LAST DATE</th>
                        <th className="border-b border-white/10 py-4 px-3 font-bold uppercase tracking-widest">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePrograms.map((prog, index) => (
                        <tr key={index} className="h-14 hover:bg-white/5 transition-colors">
                          <td className="border-r border-white/10 text-left font-bold pl-6 text-white tracking-wide uppercase">
                            {prog === "other" ? memberData.plan : prog}
                          </td>
                          <td className="border-r border-white/10 font-medium text-gray-300">{memberData.duration || "-"}</td>
                          <td className="border-r border-white/10 font-medium text-gray-300">{formatDate(memberData.join_date || memberData.joined_date) || "-"}</td>
                          <td className="border-r border-white/10 font-medium text-gray-300">{formatDate(dynamicLastDate) || "-"}</td>
                          <td className="font-bold text-white tracking-wider">{memberData.amount ? `₹${memberData.amount}` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="mt-24 flex flex-col sm:flex-row justify-between items-end gap-10 pb-6 relative z-10 font-sans">
            <div className="flex items-end w-full sm:w-72">
              <span className="mr-4 whitespace-nowrap text-gray-500 font-bold uppercase tracking-widest text-xs">Signature</span>
              <span className="border-b-[1.5px] border-white/20 flex-1"></span>
            </div>
            <div className="flex items-end w-full sm:w-64">
              <span className="mr-4 whitespace-nowrap text-gray-500 font-bold uppercase tracking-widest text-xs">Date :</span>
              <span className="border-b-[1.5px] border-white/20 flex-1 text-center font-bold pb-1 text-gray-300 tracking-widest">
                {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}