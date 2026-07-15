"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="relative z-50 flex items-center justify-between p-4 md:px-12 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-lg">
      <Link href="/" className="flex items-center gap-4 group cursor-pointer">
        <div className="bg-white/10 p-2 rounded-2xl shadow-lg group-hover:bg-logo group-hover:shadow-[0_0_20px_rgba(229,1,0,0.4)] transition-all duration-300">
           <Image 
             src="/logo.jpg" 
             alt="New Fitness Point Logo" 
             width={50} 
             height={50} 
             className="object-contain mix-blend-screen rounded-xl" 
           />
        </div>
        <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white drop-shadow-lg flex flex-col transition-colors duration-300">
          <span>New Fitness Point</span>
          <span className="text-[10px] text-logo tracking-widest mt-[-2px]">Premium Gym & Fitness</span>
        </span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/trainers" className="hidden md:block text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
          Trainers
        </Link>
        <Link href="/login">
          <motion.button 
            whileHover={{ y: -2, boxShadow: "0px 10px 20px rgba(229, 1, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-logo hover:bg-logo/90 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg border border-red-500/50"
          >
            Login <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </nav>
  );
}
