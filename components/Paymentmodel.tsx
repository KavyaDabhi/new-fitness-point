"use client";

import { X } from "lucide-react";
import UpiPaymentQR from "./UpiPaymentQR";

interface PaymentModalProps {
  member: {
    name: string;
    plan: string;
    mobile_no?: string;
  };
  onClose: () => void;
}

export default function PaymentModal({ member, onClose }: PaymentModalProps) {
  // Map plan names to standard pricing
  const getPlanAmount = (plan: string) => {
    switch (plan?.toUpperCase()) {
      case "1 MONTH": return 1000;
      case "3 MONTHS": return 2800;
      case "6 MONTHS": return 5000;
      case "1 YEAR": return 10500; // Matches your UI price
      default: return 10500;
    }
  };

  const amount = getPlanAmount(member.plan);
  const planName = member.plan || "1 YEAR PLAN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative text-white p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completing Purchase</p>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mt-1">{member.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic QR Component */}
        <div className="bg-transparent">
          <UpiPaymentQR 
            amount={amount} 
            planName={planName} 
            merchantUpiId="9824030321@okbizaxis" // 🚨 Replace with your actual gym UPI ID
          />
        </div>

      </div>
    </div>
  );
}