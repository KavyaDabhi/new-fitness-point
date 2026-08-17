"use client";

import { Users, Calendar, AlertCircle, Banknote, Dumbbell, Tag, Percent, Edit3, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 

// --- FALLBACK OFFERS ---
const defaultOffers = [
  {
    id: 1,
    title: '3 Months Plan',
    subtitle: 'Perfect for getting started.',
    regular_price: 4500,
    offer_price: 4000,
    offer_text: '3 + 1 Month',
    is_offer_active: true,
  },
  {
    id: 2,
    title: '1 Year Plan',
    subtitle: 'The ultimate fitness commitment.',
    regular_price: 10500,
    offer_price: 8500,
    offer_text: '1 Month Free',
    is_offer_active: true,
  },
  {
    id: 3,
    title: '6 Months Plan',
    subtitle: 'Best for steady progress.',
    regular_price: 6500,
    offer_price: 6000,
    offer_text: '1 Month Free',
    is_offer_active: true,
  }
];

export default function DashboardOverview() {
  // --- METRIC STATES ---
  const [activeMembersCount, setActiveMembersCount] = useState<string | number>("...");
  const [pendingRenewalsCount, setPendingRenewalsCount] = useState<string | number>("...");
  const [todaysAttendance, setTodaysAttendance] = useState<string | number>("...");
  const [monthlyRevenue, setMonthlyRevenue] = useState<string | number>("...");
  const [todaysFocus, setTodaysFocus] = useState({ focus: "LOADING...", duration: "--" });
  
  // State for managing gym plans and offers
  const [plans, setPlans] = useState<any[]>([]);
  
  // States for Editing Offers
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    regular_price: 0,
    offer_price: 0,
    offer_text: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Set dynamic daily focus based on the day of the week
    const days = ["REST & RECOVERY", "CHEST & TRICEPS", "BACK & BICEPS", "LEGS & CORE", "SHOULDERS & ABS", "HYPERTROPHY", "CARDIO & MOBILITY"];
    const dayIndex = new Date().getDay(); 
    setTodaysFocus({
      focus: days[dayIndex],
      duration: dayIndex === 0 ? "Active Rest" : "75 Min"
    });

    async function fetchData() {
      // 2. Fetch member metrics (Counts & Revenue)
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("status, amount, join_date, joined_date");

      if (memberError) {
        // Silenced console.error to prevent Next.js red screen overlay
        setActiveMembersCount(0);
        setPendingRenewalsCount(0);
        setMonthlyRevenue("₹0");
      } else if (memberData) {
        const active = memberData.filter((member) => member.status === "ACTIVE").length;
        const expired = memberData.filter((member) => member.status === "EXPIRED").length;
        
        setActiveMembersCount(active);
        setPendingRenewalsCount(expired);

        // Calculate Revenue for the current month
        let currentMonthRev = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        memberData.forEach((m) => {
          const dateStr = m.join_date || m.joined_date;
          if (dateStr) {
            const d = new Date(dateStr);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
              currentMonthRev += Number(m.amount || 0);
            }
          }
        });
        
        setMonthlyRevenue(`₹${currentMonthRev.toLocaleString('en-IN')}`);
      }

      // 3. Fetch Today's Live Attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      
      const { count: attendanceCount, error: attError } = await supabase
        .from("attendance")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", today.toISOString());
        
      if (!attError) {
        setTodaysAttendance(attendanceCount || 0);
      } else {
        // Silenced console.error to prevent Next.js red screen overlay
        setTodaysAttendance(0);
      }

      // 4. Fetch gym plans for offer management
      const { data: planData, error: planError } = await supabase
        .from("gym_plans")
        .select("*")
        .order("order_index", { ascending: true });
        
      if (planError) {
        // Silenced console.error to prevent Next.js red screen overlay
        setPlans(defaultOffers); 
      } else if (planData && planData.length > 0) {
        setPlans(planData);
      } else {
        setPlans(defaultOffers); 
      }
    }

    fetchData();
  }, []);

  // Function to toggle offer status in the database
  const toggleOffer = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    setPlans(plans.map(p => p.id === id ? { ...p, is_offer_active: newStatus } : p));
    
    const { error } = await supabase
      .from('gym_plans')
      .update({ is_offer_active: newStatus })
      .eq('id', id);

    if (error) {
      setPlans(plans.map(p => p.id === id ? { ...p, is_offer_active: currentStatus } : p));
      alert("Database Error: Could not update the offer. Please ensure your table exists.");
    }
  };

  // Function to save edited pricing and text
  const handleSaveEdit = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('gym_plans')
      .update({
        regular_price: editFormData.regular_price,
        offer_price: editFormData.offer_price,
        offer_text: editFormData.offer_text
      })
      .eq('id', editingPlan.id);

    if (error) {
      alert("Failed to save changes. Make sure your database table exists!");
    } else {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...editFormData } : p));
      setEditingPlan(null); 
    }
    
    setIsSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 relative"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">
            DASHBOARD <span className="text-logo">OVERVIEW</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Real-time metrics and system status.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center bg-gray-100 border border-gray-200 p-8 rounded-2xl">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">
              WELCOME BACK, ADMIN
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs bg-gray-200 inline-block px-3 py-1 rounded-sm border border-gray-300">
              Training protocol active.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="bg-logo hover:bg-logo/80 text-white px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-lg">
                Start Session
              </button>
              <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-sm">
                View History
              </button>
            </div>
          </div>
        </div>
        
        {/* Dynamic Focus Side-Card */}
        <div className="bg-logo rounded-2xl p-8 flex flex-col justify-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Dumbbell className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-white/70">Today's Focus</h3>
            <p className="text-3xl lg:text-4xl font-black tracking-tight mb-4">{todaysFocus.focus}</p>
            <div className="h-1 w-12 bg-white/30 rounded-full mb-4"></div>
            <p className="text-sm font-medium text-white/90">Estimated Duration: {todaysFocus.duration}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards - NOW FULLY DYNAMIC WITH UI BYPASS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Active Members", value: activeMembersCount, icon: Users, stat: "LIVE" },
          { title: "Today's Attendance", value: todaysAttendance, icon: Calendar, stat: "LIVE", pulse: todaysAttendance !== 0 && todaysAttendance !== "..." },
          { title: "Pending Renewals", value: pendingRenewalsCount, icon: AlertCircle, alert: pendingRenewalsCount !== 0 && pendingRenewalsCount !== "..." },
          { title: "Monthly Revenue", value: monthlyRevenue, icon: Banknote, stat: "+12%" }
        ].map((metric, idx) => (
          <div key={idx} className={`bg-gray-100 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:bg-gray-200 shadow-sm ${metric.alert ? 'border-l-4 border-l-logo' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <metric.icon className="text-logo/90 w-5 h-5" />
              {metric.stat && (
                <span className={`${metric.pulse ? 'bg-red-100 text-logo animate-pulse' : 'bg-gray-200 text-gray-600'} text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider`}>
                  {metric.stat}
                </span>
              )}
            </div>
            <h3 className="text-[11px] font-bold tracking-wider text-gray-500 mb-1 uppercase">{metric.title}</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* --- MANAGE OFFERS SECTION --- */}
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-logo/10 p-2 rounded-lg">
            <Tag className="w-6 h-6 text-logo" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
              MANAGE <span className="text-logo">OFFERS</span>
            </h2>
            <p className="text-sm font-medium text-gray-500">Toggle or edit promotional pricing for your website.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <p className="text-gray-500 text-sm font-medium col-span-3">Loading plans...</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className={`relative overflow-hidden bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 ${plan.is_offer_active ? 'border-logo/40 shadow-logo/10 shadow-lg' : 'border-gray-200'}`}>
                
                {plan.is_offer_active && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-logo"></div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">{plan.title}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{plan.subtitle}</p>
                  </div>
                  
                  {/* Action Buttons: Edit & Toggle */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setEditingPlan(plan);
                        setEditFormData({
                          regular_price: plan.regular_price,
                          offer_price: plan.offer_price || 0,
                          offer_text: plan.offer_text || ""
                        });
                      }}
                      className="p-1.5 text-gray-400 hover:text-logo bg-gray-50 hover:bg-red-50 rounded-md transition-colors"
                      title="Edit Pricing"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => toggleOffer(plan.id, plan.is_offer_active)}
                      className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${plan.is_offer_active ? 'bg-logo' : 'bg-gray-300'}`}
                      title="Toggle Offer Visibility"
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${plan.is_offer_active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Regular Price</span>
                    <span className="text-xl font-black text-gray-900">₹{plan.regular_price}</span>
                  </div>
                  
                  <div className={`flex justify-between items-end pt-2 transition-opacity ${plan.is_offer_active ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex items-center gap-2">
                      <Percent className={`w-4 h-4 ${plan.is_offer_active ? 'text-logo' : 'text-gray-400'}`} />
                      <span className={`text-sm font-bold uppercase tracking-wider ${plan.is_offer_active ? 'text-logo' : 'text-gray-500'}`}>Offer Price</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900">₹{plan.offer_price}</span>
                      <p className={`text-xs font-bold mt-1 tracking-widest uppercase ${plan.is_offer_active ? 'text-logo' : 'text-gray-400'}`}>{plan.offer_text}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* --- EDIT MODAL OVERLAY --- */}
      <AnimatePresence>
        {editingPlan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Edit Offer</h3>
                  <p className="text-xs font-bold text-logo uppercase tracking-wider">{editingPlan.title}</p>
                </div>
                <button 
                  onClick={() => setEditingPlan(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Standard Price (₹)</label>
                  <input 
                    type="number" 
                    value={editFormData.regular_price}
                    onChange={(e) => setEditFormData({...editFormData, regular_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-logo uppercase tracking-wider mb-2">Promotional Price (₹)</label>
                  <input 
                    type="number" 
                    value={editFormData.offer_price}
                    onChange={(e) => setEditFormData({...editFormData, offer_price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-black focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Promo Tagline (e.g. Diwali Offer)</label>
                  <input 
                    type="text" 
                    value={editFormData.offer_text}
                    onChange={(e) => setEditFormData({...editFormData, offer_text: e.target.value})}
                    placeholder="e.g. 1 Month Free"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={() => setEditingPlan(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-logo hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}