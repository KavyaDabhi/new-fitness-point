"use client";

import { CheckCircle2, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Fallback data in case the database fetch fails or table is missing
const fallbackPlans = [
  {
    id: 1,
    title: "3 Months Plan",
    regular_price: 4500,
    offer_price: 4000,
    is_offer_active: true,
    features: ["All Gym Equipment", "Cardio & Weights", "Locker Room Access"],
    is_popular: false
  },
  {
    id: 2,
    title: "1 Year Plan",
    regular_price: 10500,
    offer_price: 8500,
    is_offer_active: true,
    features: ["Complete Floor Access", "Expert Guidance", "Premium Support", "Priority Updates"],
    is_popular: true
  },
  {
    id: 3,
    title: "6 Months Plan",
    regular_price: 6500,
    offer_price: 6000,
    is_offer_active: true,
    features: ["All Gym Equipment", "Cardio & Weights", "Locker Room Access"],
    is_popular: false
  }
];

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data: plansData, error: plansError } = await supabase
          .from("gym_plans")
          .select("*")
          .order("order_index", { ascending: true });

        // If error, quietly fallback instead of throwing to avoid red screen
        if (plansError) {
          setPlans(fallbackPlans);
        } else {
          setPlans(plansData && plansData.length > 0 ? plansData : fallbackPlans);
        }
      } catch (error) {
        // Silenced error to prevent Next.js overlay
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Visual styles for the cards based on their index
  const cardStyles = [
    { color: "bg-white", headerColor: "bg-gray-100", textColor: "text-gray-900", borderColor: "border-gray-200" },
    { color: "bg-white", headerColor: "bg-logo", textColor: "text-white", borderColor: "border-logo/40 shadow-xl shadow-logo/10" },
    { color: "bg-white", headerColor: "bg-zinc-900", textColor: "text-white", borderColor: "border-zinc-800" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MEMBERSHIP PLANS</h1>
        <p className="text-sm text-gray-500 font-medium">View and manage active subscription tiers.</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-logo border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Loading Plans...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan, idx) => {
            // Assign styling (Wrap around if more than 3 plans)
            const style = plan.is_popular ? cardStyles[1] : cardStyles[idx % cardStyles.length];

            return (
              <div key={plan.id} className={`bg-white border ${style.borderColor} rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300 relative`}>
                
                {plan.is_popular && (
                  <div className="absolute top-4 right-4 bg-white text-logo text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20">
                    Best Value
                  </div>
                )}

                <div className={`${style.headerColor} p-8 ${style.textColor} text-center relative transition-colors duration-300`}>
                  <h3 className="text-xl font-black relative z-10 uppercase tracking-wide">{plan.title}</h3>
                  
                  {/* Dynamic Pricing Engine */}
                  {plan.is_offer_active ? (
                    <div className="mt-4 flex flex-col items-center">
                      <span className={`text-sm font-bold line-through opacity-70 mb-1`}>₹{plan.regular_price}</span>
                      <p className="text-4xl font-black relative z-10 tracking-tighter">₹{plan.offer_price}</p>
                      <span className={`mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${plan.is_popular ? 'bg-white/20 border-white/30' : 'bg-logo/10 text-logo border-logo/20'}`}>
                        <Percent className="w-3 h-3" /> Offer Active
                      </span>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col items-center">
                      <p className="text-4xl font-black relative z-10 tracking-tighter">₹{plan.regular_price}</p>
                      <div className="h-6 mt-2"></div> {/* Spacing stabilizer */}
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 flex flex-col bg-white">
                  <ul className="space-y-4">
                    {plan.features?.map((feature: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-logo/90 shrink-0" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}