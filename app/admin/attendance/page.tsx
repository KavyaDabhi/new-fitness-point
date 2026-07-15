"use client";

import { Search, QrCode, Scan, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const recentCheckIns = [
  { id: "1", name: "Yagna Bhatt", time: "10:45 AM", plan: "Premium Yearly", status: "Active" },
  { id: "2", name: "Nishit Champaneria", time: "10:32 AM", plan: "Monthly Basic", status: "Active" },
  { id: "3", name: "Moksh Chavada", time: "10:15 AM", plan: "Cardio Special", status: "Expired" },
  { id: "4", name: "Heer Desai", time: "09:58 AM", plan: "Premium Yearly", status: "Active" },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"manual" | "scanner" | "generate">("scanner");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">ATTENDANCE & ACCESS</h1>
        <p className="text-sm text-gray-500 font-medium">Monitor live entry streams and manage QR access controls.</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        
        {/* Live Entry Stream */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 shadow-2xl h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4 shrink-0">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Live Entry Stream</h3>
            <div className="flex items-center text-logo/90 text-xs font-bold tracking-wider uppercase bg-logo/90/10 px-3 py-1.5 rounded-full border border-logo/90/20">
              <span className="h-2 w-2 rounded-full bg-logo/90 mr-2 animate-ping"></span>
              Monitoring
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
                <tr>
                  <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Member</th>
                  <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Time</th>
                  <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentCheckIns.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-gray-100 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{row.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{row.plan}</div>
                    </td>
                    <td className="py-4 font-medium text-gray-500">{row.time}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        row.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-logo/90/10 text-logo/70 border-logo/90/20"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gray-100/50 border border-gray-200 rounded-3xl p-8 flex flex-col h-[600px] relative overflow-hidden shadow-2xl">
          
          
          {/* Tab Navigation */}
          <div className="flex bg-white/40 p-1.5 rounded-2xl mb-8 relative z-10">
            {[
              { id: "scanner", label: "QR Scanner", icon: Scan },
              { id: "generate", label: "Generate QR", icon: QrCode },
              { id: "manual", label: "Manual Entry", icon: Search },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? "bg-logo text-gray-900 shadow-lg" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              
              {/* QR SCANNER UI */}
              {activeTab === "scanner" && (
                <motion.div 
                  key="scanner"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="relative w-64 h-64 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl mb-8 flex items-center justify-center group">
                    <Camera className="w-12 h-12 text-gray-700 absolute z-0" />
                    
                    {/* Simulated Scanner UI */}
                    <div className="absolute inset-4 border-2 border-dashed border-logo/90/50 rounded-2xl z-10"></div>
                    
                    {/* Scanning Laser Animation */}
                    <motion.div 
                      animate={{ y: [0, 200, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute top-4 left-4 right-4 h-0.5 bg-logo/90 shadow-lg z-20"
                    />
                    
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-sm">
                      <button className="bg-logo text-gray-900 px-6 py-2 rounded-full font-bold text-sm tracking-wider shadow-lg">
                        Activate Camera
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Member Check-In</h3>
                  <p className="text-gray-500 text-sm font-medium">Point the camera at the member's app QR code to log their attendance instantly.</p>
                </motion.div>
              )}

              {/* GENERATE QR UI */}
              {activeTab === "generate" && (
                <motion.div 
                  key="generate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Issue Daily Pass QR</h3>
                    <p className="text-gray-500 text-sm font-medium">Generate a temporary QR code for guests or members without the app.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl p-8">
                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-6">
                      <QRCodeSVG 
                        value="https://new-fitness-point.com/verify/daily-pass/TMP-98231" 
                        size={160} 
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="Q"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-bold text-lg">TMP-98231</p>
                      <p className="text-logo/70 text-xs font-bold uppercase tracking-widest mt-1">Expires in 24 Hours</p>
                    </div>
                  </div>
                  
                  <button className="w-full bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl py-4 mt-6 hover:bg-gray-200 transition-all">
                    Generate New Code
                  </button>
                </motion.div>
              )}

              {/* MANUAL ENTRY UI */}
              {activeTab === "manual" && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-logo/20 text-logo/90 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Manual Override</h3>
                    <p className="text-gray-500 text-sm font-medium px-8">Override physical access control. Search the directory to manually log a member entry.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Member ID or Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. NP-1042 or Yagna Bhatt"
                        className="w-full px-5 py-4 text-sm bg-gray-100 border border-gray-200 rounded-xl outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-all text-gray-900 placeholder:text-gray-600"
                      />
                    </div>
                    <button className="w-full bg-logo hover:bg-logo/80 text-gray-900 font-black text-sm uppercase tracking-widest rounded-xl py-4 shadow-lg hover:shadow-lg transition-all">
                      Authorize Entry
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
