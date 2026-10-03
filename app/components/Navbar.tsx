"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // --- ADD YOUR EXACT ADMIN EMAILS HERE ---
  const adminEmails = [
    "newfitnesspointgym@gmail.com", 
    "dabhikavy189@gmail.com" // replace with your actual admin login email
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      setUser(currentUser);
      
      // Check if the logged-in user is an admin
      if (currentUser?.email && adminEmails.includes(currentUser.email.toLowerCase())) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser?.email && adminEmails.includes(currentUser.email.toLowerCase())) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setIsOpen(false);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Plans", path: "/#plans" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <>
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

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href={isAdmin ? "/admin" : (user ? "/member" : "/login")}>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-500 text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-[0_0_20px_rgba(229,1,0,0.5)]">
                {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {isAdmin ? "Dashboard" : (user ? "Portal" : "Login")}
              </button>
            </Link>
            
            {user && (
              <button 
                onClick={handleLogout}
                title="Log Out"
                className="flex items-center justify-center p-2.5 bg-transparent hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 rounded-full transition-all duration-300 text-gray-400 hover:text-red-500 hover:shadow-[0_0_15px_rgba(229,1,0,0.3)]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden relative z-[110] p-2 text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-auto flex flex-col gap-3"
            >
              <Link href={isAdmin ? "/admin" : (user ? "/member" : "/login")} onClick={() => setIsOpen(false)}>
                <button className="w-full flex justify-center items-center gap-2 bg-red-600 text-white px-6 py-5 rounded-2xl font-black text-lg tracking-widest uppercase shadow-[0_0_30px_rgba(229,1,0,0.4)] transition-transform active:scale-95">
                  {isAdmin ? <LayoutDashboard className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  {isAdmin ? "Admin Dashboard" : (user ? "Enter Portal" : "Member Login")}
                </button>
              </Link>

              {user && (
                <button 
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center gap-2 bg-transparent border border-white/10 text-gray-400 hover:text-white px-6 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-colors active:bg-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}