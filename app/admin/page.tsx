"use client";

import { Users, Calendar, AlertCircle, Banknote, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
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
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs bg-gray-1000 inline-block px-3 py-1 rounded-sm border border-white/5">
              Training protocol active.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="bg-logo hover:bg-logo/80 text-gray-900 px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-lg">
                Start Session
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 px-8 py-3 text-sm font-bold rounded-xl transition-all">
                View History
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Side-Card */}
        <div className="bg-logo rounded-2xl p-8 flex flex-col justify-center text-gray-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Dumbbell className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-red-200">Today's Focus</h3>
            <p className="text-3xl lg:text-4xl font-black tracking-tight mb-4">HYPERTROPHY</p>
            <div className="h-1 w-12 bg-white/30 rounded-full mb-4"></div>
            <p className="text-sm font-medium text-red-100">Estimated Duration: 75 Min</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Active Members", value: "1,240", icon: Users, stat: "+4%" },
          { title: "Today's Attendance", value: "284", icon: Calendar, stat: "LIVE", pulse: true },
          { title: "Pending Renewals", value: "18", icon: AlertCircle, alert: true },
          { title: "Monthly Revenue", value: "$42,850", icon: Banknote, stat: "+12%" }
        ].map((metric, idx) => (
          <div key={idx} className={`bg-gray-100 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:bg-gray-200 ${metric.alert ? 'border-l-4 border-l-logo' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <metric.icon className="text-logo/90 w-5 h-5" />
              {metric.stat && (
                <span className={`${metric.pulse ? 'bg-logo/90/20 text-logo/70 animate-pulse' : 'bg-gray-200 text-gray-600'} text-[10px] font-bold px-2 py-1 rounded-sm tracking-wider`}>
                  {metric.stat}
                </span>
              )}
            </div>
            <h3 className="text-[11px] font-bold tracking-wider text-gray-500 mb-1 uppercase">{metric.title}</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}