"use client";

import { CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";

const planDetailsData = [
  { id: "P-1", name: "Premium Yearly", price: "$1200 / yr", features: ["All Access", "Personal Training", "Spa & Sauna"], activeUsers: 450, color: "bg-logo", borderColor: "border-logo/90" },
  { id: "P-2", name: "Monthly Basic", price: "$50 / mo", features: ["Gym Floor Access", "Locker Room", "Basic Classes"], activeUsers: 620, color: "bg-zinc-800", borderColor: "border-zinc-700" },
  { id: "P-3", name: "Cardio Special", price: "$30 / mo", features: ["Cardio Zone Only", "No Free Weights", "Locker Room"], activeUsers: 170, color: "bg-gray-100", borderColor: "border-zinc-800" },
];

export default function PlansPage() {
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

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {planDetailsData.map((plan, idx) => (
          <div key={idx} className={`bg-gray-100 border ${plan.borderColor} rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300`}>
            <div className={`${plan.color} p-8 text-gray-900 text-center relative`}>
              <div className="absolute inset-0 bg-gray-200"></div>
              <h3 className="text-xl font-black relative z-10 uppercase tracking-wide">{plan.name}</h3>
              <p className="text-4xl font-black relative z-10 mt-2">{plan.price}</p>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-logo/90 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-gray-200">
                <div className="text-xs font-bold uppercase text-gray-500 mb-3">Active Subscribers</div>
                <div className="flex items-center justify-between bg-gray-100 border border-gray-200 px-5 py-4 rounded-xl">
                  <span className="font-black text-gray-900 text-2xl">{plan.activeUsers}</span>
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}