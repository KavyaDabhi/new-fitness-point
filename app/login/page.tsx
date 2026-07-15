"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User, Lock, Mail } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[85vh] px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-logo/10 to-transparent opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2 drop-shadow-lg">
              {isLogin ? "Welcome Back" : "Join Elite"}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isLogin ? "Enter your credentials to access your portal." : "Create your account and start transforming."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1 pr-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                {isLogin && <a href="#" className="text-xs text-logo hover:text-white transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ y: -2, boxShadow: "0px 10px 20px rgba(229, 1, 0, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-logo text-white py-4 rounded-xl font-black uppercase tracking-widest mt-4 border border-red-500/50 shadow-lg hover:bg-logo/90 transition-all"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-logo font-bold underline decoration-transparent hover:decoration-logo underline-offset-4 transition-all">
                {isLogin ? "Sign up" : "Log in"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
