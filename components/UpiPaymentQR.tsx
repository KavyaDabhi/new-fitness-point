"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, RefreshCw, ShieldCheck } from "lucide-react";

interface UpiPaymentQRProps {
  amount: number;
  planName: string;
  merchantUpiId?: string; // e.g., "newfitnesspoint@sbi"
}

export default function UpiPaymentQR({ 
  amount, 
  planName, 
  merchantUpiId = "YOUR_GYM_UPI_ID@bank" // 🚨 REPLACE THIS!
}: UpiPaymentQRProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [transactionId, setTransactionId] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  // Generate a unique ID when the component mounts or resets
  const generateNewTransaction = () => {
    const uniqueId = `NP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    setTransactionId(uniqueId);
    setTimeLeft(300);
    setIsExpired(false);
  };

  useEffect(() => {
    generateNewTransaction();
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Standard UPI URI Format
  // Note: 'pn' is Payee Name, 'tr' is Transaction ID, 'am' is Amount
  const upiString = `upi://pay?pa=${merchantUpiId}&pn=New%20Fitness%20Point&tr=${transactionId}&am=${amount}&cu=INR&tn=Payment%20for%20${encodeURIComponent(planName)}`;

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-6 relative flex flex-col items-center">
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Scan to Pay</h3>
        <p className="text-gray-500 text-sm mt-1">{planName} • ₹{amount}</p>
      </div>

      {/* QR Code Container */}
      <div className="relative bg-white p-4 border-2 border-dashed border-gray-200 rounded-xl mb-6">
        <div className={`transition-opacity duration-300 ${isExpired ? 'opacity-10 blur-sm' : 'opacity-100'}`}>
          <QRCodeSVG 
            value={upiString} 
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"} // High error correction
          />
        </div>

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-in zoom-in duration-200">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl text-center shadow-lg border border-gray-100">
              <p className="text-red-600 font-bold text-sm mb-3">QR Code Expired</p>
              <button 
                onClick={generateNewTransaction}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Generate New
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${isExpired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'}`}>
        <Clock className="w-4 h-4" />
        {isExpired ? "0:00" : formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-1.5 mt-6 text-gray-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Secure UPI Payment
      </div>
      
      {/* Hidden input to easily grab the TXN ID if you are submitting a form alongside it */}
      <input type="hidden" name="transaction_id" value={transactionId} />
    </div>
  );
}