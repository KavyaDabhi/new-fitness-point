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

  // --- DYNAMIC DAILY QR CODE GENERATOR ---
  const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
  const dailyQrString = `new-fitness-point-desk-${today}`;

  const fetchLiveAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          id,
          time_marked,
          check_out_time,
          members!inner (
            name,
            plan
          )
        `)
        .order("time_marked", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedData = data.map((record: any) => {
          const checkInTime = new Date(record.time_marked).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          
          const checkOutTime = record.check_out_time 
            ? new Date(record.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
            : null;

          return {
            id: record.id,
            name: record.members?.name || "Unknown Member",
            time: checkOutTime ? `${checkInTime} - ${checkOutTime}` : checkInTime,
            plan: record.members?.plan || "Standard", 
            status: record.check_out_time ? "Checked Out" : "Active",
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
    const interval = setInterval(fetchLiveAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualEntry = async () => {
    if (!manualSearchQuery.trim()) return;
    
    try {
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
      
      const { error: insertError } = await supabase
        .from("attendance")
        .insert([{ member_id: member.id, date: today }]);

      if (insertError) {
        if (insertError.code === '23505') { 
          // Manual Check Out Trigger
          const { error: updateError } = await supabase
            .from("attendance")
            .update({ check_out_time: new Date().toISOString() })
            .eq("member_id", member.id)
            .eq("date", today)
            .is("check_out_time", null);
            
          if (updateError) throw updateError;
          alert(`Checked Out: ${member.name}`);
        } else {
          throw insertError;
        }
      } else {
        alert(`Access Granted: ${member.name}`);
      }
      
      setManualSearchQuery("");
      fetchLiveAttendance(); 
    } catch (error: any) {
      console.error("Manual entry error:", error);
      alert("An error occurred while authorizing entry.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6 w-full max-w-[100vw] overflow-x-hidden"
    >
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">ATTENDANCE & ACCESS</h1>
        <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Monitor live entry streams and manage QR access controls.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        
        {/* Live Entry Stream */}
        <div className="bg-gray-100 border border-gray-200 rounded-[2rem] p-4 md:p-8 shadow-xl h-[400px] md:h-[600px] flex flex-col w-full">
          <div className="flex flex-row items-center justify-between mb-4 md:mb-8 border-b border-gray-200 pb-3 md:pb-4 shrink-0">
            <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Live Entry Stream</h3>
            <div className="flex items-center text-logo/90 text-[10px] md:text-xs font-bold tracking-wider uppercase bg-red-100 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-red-200">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-600 mr-1.5 md:mr-2 animate-ping"></span>
              <span className="text-red-600">Monitoring</span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-1 md:pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-500 text-xs md:text-sm py-10 font-medium">Loading stream...</div>
            ) : recentCheckIns.length === 0 ? (
              <div className="text-center text-gray-500 text-xs md:text-sm py-10 font-medium">No check-ins today yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-100 backdrop-blur-sm z-10">
                  <tr>
                    <th className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-2 md:pb-3">Member</th>
                    <th className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-2 md:pb-3">Time</th>
                    <th className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-gray-500 pb-2 md:pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm">
                  {recentCheckIns.map((row) => (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-white transition-colors">
                      <td className="py-3 md:py-4 pr-2">
                        <div className="font-bold text-gray-900 truncate max-w-[100px] md:max-w-none">{row.name}</div>
                        <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase mt-1 truncate max-w-[100px] md:max-w-none">{row.plan}</div>
                      </td>
                      <td className="py-3 md:py-4 font-medium text-gray-500 text-[10px] md:text-sm pr-2 whitespace-nowrap">{row.time}</td>
                      <td className="py-3 md:py-4">
                        <span className={`inline-flex px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[10px] font-bold tracking-wider uppercase border whitespace-nowrap ${
                          row.status === "Checked Out" 
                            ? "bg-gray-200 text-gray-600 border-gray-300" 
                            : "bg-green-500/10 text-green-600 border-green-500/20"
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
        <div className="bg-gray-100/50 border border-gray-200 rounded-[2rem] p-4 md:p-8 flex flex-col h-[480px] md:h-[600px] relative overflow-hidden shadow-xl w-full">
          <div className="flex bg-white/40 p-1 md:p-1.5 rounded-xl md:rounded-2xl mb-6 md:mb-8 relative z-10 overflow-x-auto custom-scrollbar no-scrollbar">
            {[
              { id: "scanner", label: "QR Scanner", icon: Scan },
              { id: "generate", label: "Daily Desk QR", icon: QrCode },
              { id: "manual", label: "Manual Entry", icon: Search },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg md:rounded-xl transition-all min-w-[100px] ${
                  activeTab === tab.id 
                    ? "bg-black text-white shadow-lg" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative z-10 w-full">
            <AnimatePresence mode="wait">
              
              {/* QR SCANNER UI */}
              {activeTab === "scanner" && (
                <motion.div 
                  key="scanner"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center text-center px-2"
                >
                  <div className="relative w-48 h-48 md:w-64 md:h-64 bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-2xl mb-6 md:mb-8 flex items-center justify-center group">
                    <Camera className="w-8 h-8 md:w-12 md:h-12 text-gray-300 absolute z-0" />
                    <div className="absolute inset-3 md:inset-4 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl z-10"></div>
                    <motion.div 
                      animate={{ y: [0, 160, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute top-4 left-4 right-4 h-0.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] z-20"
                    />
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 backdrop-blur-sm">
                      <button className="bg-black text-white px-4 md:px-6 py-2 rounded-full font-bold text-[10px] md:text-sm tracking-wider shadow-lg">
                        Activate Camera
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1 md:mb-2">Member Check-In</h3>
                  <p className="text-gray-500 text-xs md:text-sm font-medium">Point the camera at the member's app QR.</p>
                </motion.div>
              )}

              {/* GENERATE QR UI (DYNAMIC DAILY) */}
              {activeTab === "generate" && (
                <motion.div 
                  key="generate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col px-2"
                >
                  <div className="mb-4 md:mb-6 text-center">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight mb-1 md:mb-2">Front Desk QR Code</h3>
                    <p className="text-gray-500 text-[10px] md:text-sm font-medium">Members scan this from their phones to check in.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-[1.5rem] p-6 md:p-8 shadow-sm">
                    <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-inner mb-4 border border-gray-100">
                      <QRCodeSVG 
                        value={dailyQrString} 
                        size={180} 
                        bgColor="transparent"
                        fgColor="#000000"
                        level="Q"
                        className="md:w-[200px] md:h-[200px]"
                      />
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-green-600 bg-green-50 px-3 py-1 rounded-full font-black text-sm md:text-base border border-green-200 inline-block mb-1">
                        Active Today
                      </p>
                      <p className="text-gray-500 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">
                        Refreshes automatically at midnight
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MANUAL ENTRY UI */}
              {activeTab === "manual" && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col justify-center px-2"
                >
                  <div className="mb-6 md:mb-8 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner">
                      <Search className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1 md:mb-2">Manual Override</h3>
                    <p className="text-gray-500 text-[10px] md:text-sm font-medium px-2 md:px-8">Override physical access control to manually log an entry.</p>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5 md:mb-2">Member Phone or Name</label>
                      <input 
                        type="text" 
                        value={manualSearchQuery}
                        onChange={(e) => setManualSearchQuery(e.target.value)}
                        placeholder="e.g. Kavya Dabhi"
                        className="w-full px-4 py-3 md:px-5 md:py-4 text-xs md:text-sm bg-white border border-gray-200 rounded-lg md:rounded-xl outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-gray-900 placeholder:text-gray-400 shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={handleManualEntry}
                      className="w-full bg-black hover:bg-gray-800 text-white font-black text-[10px] md:text-sm uppercase tracking-widest rounded-lg md:rounded-xl py-3 md:py-4 shadow-lg hover:shadow-xl transition-all"
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