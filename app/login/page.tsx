"use client";

import { Lock, Mail, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email === "admin@newfitness.com" && password === "admin123") {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("userAuth", "false");
        router.push("/admin");
      } else if (email && password) {
        // Any other non-empty credentials mock a regular user login
        localStorage.setItem("userAuth", "true");
        localStorage.setItem("adminAuth", "false");
        router.push("/member");
      } else {
        setError("Please enter valid credentials.");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("userAuth", "true");
      localStorage.setItem("adminAuth", "false");
      router.push("/member");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Background Glow */}
      
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 p-10 rounded-3xl w-full max-w-md shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 p-2">
            <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="object-contain mix-blend-multiply" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Sign In</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Access your fitness portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-5 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-logo transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-12 pr-5 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-logo transition-colors"
                required
              />
            </div>
            {error && <p className="text-logo/90 text-xs mt-2 font-bold">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-logo hover:bg-logo/80 disabled:bg-logo/60 text-gray-900 font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1"
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-500 font-bold uppercase">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

      </motion.div>
    </div>
  );
}
