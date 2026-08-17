"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check auth status so the button dynamically says "Login" or "Portal"
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Plans", path: "/#plans" },
    { name: "Contact", path: "/#contact" }, // Assuming you add id="contact" to footer section
  ];

  return (
    <>
      {/* --- DESKTOP & MOBILE HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/50 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="relative z-[110] flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(229,1,0,0.5)]">
              <span className="text-white font-black text-xl italic tracking-tighter">N</span>
            </div>
            <span className="font-black text-white text-lg tracking-widest uppercase hidden sm:block">
              New Fitness Point
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className="text-sm font-bold text-gray-300 hover:text-white uppercase tracking-widest transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Button */}
          <div className="hidden md:block">
            <Link href={user ? "/member" : "/login"}>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-500 text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-[0_0_20px_rgba(229,1,0,0.5)]">
                <User className="w-4 h-4" />
                {user ? "Portal" : "Login"}
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden relative z-[110] p-2 text-white bg-white/5 border border-white/10 rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[90] bg-[#0a0a0a] flex flex-col pt-28 px-6 pb-6 md:hidden"
          >
            {/* Nav Links */}
            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                >
                  <Link 
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-4xl font-black text-gray-400 hover:text-white uppercase tracking-tighter transition-colors block border-b border-white/10 pb-4"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Action Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-auto"
            >
              <Link href={user ? "/member" : "/login"} onClick={() => setIsOpen(false)}>
                <button className="w-full flex justify-center items-center gap-2 bg-red-600 text-white px-6 py-5 rounded-2xl font-black text-lg tracking-widest uppercase shadow-[0_0_30px_rgba(229,1,0,0.4)]">
                  <User className="w-5 h-5" />
                  {user ? "Enter Portal" : "Member Login"}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}