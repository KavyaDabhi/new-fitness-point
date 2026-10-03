"use client";

import { Search, QrCode, Scan, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase"; 

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"manual" | "scanner" | "generate">("scanner");
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualSearchQuery, setManualSearchQuery] = useState("");

  // Extracted fetch function so we can call it after manual entry
  const fetchLiveAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          time_marked,
          members!inner (
            name,
            plan,
            status
          )
        `)
        .order("time_marked", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedData = data.map((record: any) => {
          const timeObj = new Date(record.time_marked);
          return {
            id: record.id,
            name: record.members?.name || "Unknown Member",
            time: timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            plan: record.members?.plan || "Standard", 
            status: record.members?.status || "Active",
          };
        });
        setRecentCheckIns(formattedData);
      }
    } catch (error) {
      console.log("Error fetching live attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAttendance();

    // Poll for new check-ins every 30 seconds
    const interval = setInterval(fetchLiveAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- NEW: FULLY FUNCTIONAL MANUAL ENTRY ---
  const handleManualEntry = async () => {
    if (!manualSearchQuery.trim()) return;
    
    try {
      // 1. Find the member by name or phone number
      const { data: members, error: searchError } = await supabase
        .from("members")
        .select("id, name")
        .or(`name.ilike.%${manualSearchQuery}%,mobile_no.eq.${manualSearchQuery}`)
        .limit(1);

      if (searchError) throw searchError;
      
      if (!members || members.length === 0) {
        alert("No member found with that name or phone number.");
        return;
      }

      const member = members[0];
      const today = new Date().toLocaleDateString('en-CA');

      // 2. Insert into attendance table
      const { error: insertError } = await supabase
        .from("attendance")
        .insert([{ member_id: member.id, date: today }]);

      if (insertError) {
        // Handle the unique constraint error (Duplicate check-in)
        if (insertError.code === '23505') { 
          alert(`${member.name} is already checked in for today!`);
        } else {
          throw insertError;
        }
      } else {
        // Success! Clear input and refresh stream instantly
        alert(`Access Granted: ${member.name}`);
        setManualSearchQuery("");
        fetchLiveAttendance(); 
      }
    } catch (error: any) {
      console.error("Manual entry error:", error);
      alert("An error occurred while authorizing entry.");
    }
  };

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
            <div className="flex items-center text-logo/90 text-xs font-bold tracking-wider uppercase bg-red-100 px-3 py-1.5 rounded-full border border-red-200">
              <span className="h-2 w-2 rounded-full bg-red-600 mr-2 animate-ping"></span>
              <span className="text-red-600">Monitoring</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-500 text-sm py-10 font-medium">Loading stream...</div>
            ) : recentCheckIns.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-10 font-medium">No check-ins today yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-100 backdrop-blur-sm z-10">
                  <tr>
                    <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Member</th>
                    <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Time</th>
                    <th className="text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentCheckIns.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-white transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-gray-900">{row.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{row.plan}</div>
                      </td>
                      <td className="py-4 font-medium text-gray-500">{row.time}</td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          row.status === "Active" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                    ? "bg-black text-white shadow-lg" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
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
                    <Camera className="w-12 h-12 text-gray-300 absolute z-0" />
                    
                    {/* Simulated Scanner UI */}
                    <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-2xl z-10"></div>
                    
                    {/* Scanning Laser Animation */}
                    <motion.div 
                      animate={{ y: [0, 200, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute top-4 left-4 right-4 h-0.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] z-20"
                    />
                    
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-sm">
                      <button className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm tracking-wider shadow-lg">
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
                  
                  <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div className="bg-gray-50 p-4 rounded-2xl shadow-inner mb-6 border border-gray-100">
                      <QRCodeSVG 
                        value="https://new-fitness-point.com/verify/daily-pass/TMP-98231" 
                        size={160} 
                        bgColor="transparent"
                        fgColor="#000000"
                        level="Q"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-black text-xl">TMP-98231</p>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Expires in 24 Hours</p>
                    </div>
                  </div>
                  
                  <button className="w-full bg-black text-white font-black text-sm uppercase tracking-widest rounded-xl py-4 mt-6 hover:bg-gray-800 transition-all shadow-lg">
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
                    <div className="w-16 h-16 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Manual Override</h3>
                    <p className="text-gray-500 text-sm font-medium px-8">Override physical access control. Search the directory to manually log a member entry.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Member Phone or Name</label>
                      <input 
                        type="text" 
                        value={manualSearchQuery}
                        onChange={(e) => setManualSearchQuery(e.target.value)}
                        placeholder="e.g. 9876543210 or Yagna Bhatt"
                        className="w-full px-5 py-4 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={handleManualEntry}
                      className="w-full bg-black hover:bg-gray-800 text-white font-black text-sm uppercase tracking-widest rounded-xl py-4 shadow-lg hover:shadow-xl transition-all"
                    >
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