"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Award, Dumbbell, HeartPulse, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const trainers = [
  {
    id: 1,
    name: "Marcus Vance",
    specialty: "Hypertrophy Specialist",
    icon: Dumbbell,
    desc: "Former Mr. Olympia competitor focusing on pure muscle mass and aesthetic sculpting.",
    image: "/bg-light.png" // Placeholder
  },
  {
    id: 2,
    name: "Elena Rostova",
    specialty: "Strength & Conditioning",
    icon: Zap,
    desc: "Olympic lifting coach. Develops explosive power and functional athletic strength.",
    image: "/bg-light.png"
  },
  {
    id: 3,
    name: "David Chen",
    specialty: "Recovery & Mobility",
    icon: HeartPulse,
    desc: "Biomechanics expert dedicated to injury prevention, rehab, and longevity.",
    image: "/bg-light.png"
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    specialty: "HIIT Specialist",
    icon: Award,
    desc: "Endurance and fat-loss expert. Pushes cardiovascular limits to the extreme.",
    image: "/bg-light.png"
  }
];

export default function Trainers() {
  return (
    <div className="w-full flex flex-col items-center min-h-[85vh] px-4 py-12">
      <div className="w-full max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 md:mb-24"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl mb-4">
            Elite <span className="text-logo">Trainers</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl">
            Meet the world-class professionals who will engineer your physical transformation. 
            No excuses. Just results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden hover:border-logo/50 hover:shadow-[0_20px_50px_rgba(229,1,0,0.2)] transition-all duration-500 relative flex flex-col"
            >
              <div className="h-48 relative overflow-hidden bg-black/40 border-b border-white/10">
                {/* Using a solid dark gradient instead of the actual image to maintain the premium feel without real assets */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">
                   <trainer.icon className="w-32 h-32 text-white" />
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:bg-logo group-hover:border-logo transition-all duration-500 -mt-14 relative z-20 mb-6">
                  <trainer.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-2xl font-black tracking-tight uppercase text-white group-hover:text-logo transition-colors duration-300 mb-1">{trainer.name}</h3>
                <h4 className="text-xs font-bold uppercase tracking-widest text-logo mb-4">{trainer.specialty}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                  {trainer.desc}
                </p>
                
                <button className="w-full bg-transparent border border-white/20 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs group-hover:bg-white/10 group-hover:border-white/40 transition-all">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
