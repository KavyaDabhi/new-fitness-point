"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User, Lock, Mail, Phone, Check } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdmin, isTrainer } from "@/lib/roles";

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [loading, setLoading] = useState(false);

  // Member directory search state (for Sign Up)
  const [memberResults, setMemberResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  // Live search members table when typing name in Sign Up mode
  useEffect(() => {
    const searchDirectory = async () => {
      if (isLogin || isForgot || selectedMember || fullName.trim().length < 2) {
        setMemberResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("members")
        .select("id, name, mobile_no, email, user_id")
        .ilike("name", `%${fullName.trim()}%`)
        .limit(5);

      if (!error && data) {
        setMemberResults(data);
      }
    };

    const debounce = setTimeout(searchDirectory, 250);
    return () => clearTimeout(debounce);
  }, [fullName, isLogin, isForgot, selectedMember]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. FORGOT PASSWORD LOGIC
    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Password reset link sent! Please check your email inbox.");
        setIsForgot(false);
        setIsLogin(true);
      }
      setLoading(false);
      return;
    }

    // 2. SIGN IN LOGIC
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        localStorage.setItem("userAuth", "true");

        if (redirectPath) {
          router.push(redirectPath);
        } else if (isAdmin(cleanEmail)) {
          router.push("/admin");
        } else if (isTrainer(cleanEmail)) {
          router.push("/trainer");
        } else {
          router.push("/member");
        }
        router.refresh();
      }
      setLoading(false);
      return;
    }

    // 3. SIGN UP LOGIC (Link existing profile OR register new member)
    if (selectedMember?.user_id) {
      alert("This member profile is already linked to an account. Please log in instead.");
      setLoading(false);
      return;
    }

    // Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: selectedMember ? selectedMember.name : fullName.trim(),
          member_id: selectedMember ? selectedMember.id : null,
        },
      },
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (selectedMember) {
      // Link Auth account to the existing member row
      const { error: linkError } = await supabase
        .from("members")
        .update({
          email: cleanEmail,
          mobile_no: mobileNo.trim() || selectedMember.mobile_no,
          user_id: authData.user?.id,
        })
        .eq("id", selectedMember.id);

      if (linkError) {
        console.error("Failed to link member record:", linkError);
        alert("Account created, but failed to link profile: " + linkError.message);
      } else {
        alert("Account linked successfully! You can now log in.");
      }
    } else {
      // Insert brand-new member row into the members table
      const today = new Date().toISOString().split("T")[0];
      const { error: insertError } = await supabase.from("members").insert([
        {
          name: fullName.trim(),
          mobile_no: mobileNo.trim(),
          email: cleanEmail,
          user_id: authData.user?.id,
          status: "PENDING",
          plan: "None",
          join_date: today,
        },
      ]);

      if (insertError) {
        console.error("Failed to create member record:", insertError);
        alert("Account created, but failed to save gym profile: " + insertError.message);
      } else {
        alert("Welcome! Your account and gym profile have been created. You can now log in.");
      }
    }

    setIsLogin(true);
    setPassword("");
    setFullName("");
    setMobileNo("");
    setSelectedMember(null);
    setLoading(false);
  };

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
              {isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Join Elite"}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isForgot
                ? "Enter your email to receive a password reset link."
                : isLogin
                ? "Enter your credentials to access your portal."
                : "Select your name from the directory or enter your details to register."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleAuth}>
            {!isLogin && !isForgot && (
              <>
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setSelectedMember(null);
                      }}
                      placeholder="Search or enter your full name..."
                      required={!isLogin && !isForgot}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-10 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                    />
                    {selectedMember && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Helper Status */}
                  {selectedMember && (
                    <p className="text-[11px] text-green-400 font-medium mt-1.5 ml-1">
                      Existing member found — your email will be linked to this profile.
                    </p>
                  )}

                  {/* Live Member Selection Dropdown */}
                  <AnimatePresence>
                    {memberResults.length > 0 && !selectedMember && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute left-0 right-0 mt-2 bg-[#111] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {memberResults.map((member) => (
                          <button
                            type="button"
                            key={member.id}
                            onClick={() => {
                              setSelectedMember(member);
                              setFullName(member.name);
                              if (member.mobile_no) setMobileNo(member.mobile_no);
                              setMemberResults([]);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/5 last:border-none flex items-center justify-between transition-colors"
                          >
                            <span className="text-sm font-bold text-white uppercase">
                              {member.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {member.user_id ? "Linked" : "Select"}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      placeholder="10-digit mobile number"
                      required={!isLogin && !isForgot}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-2 ml-1 pr-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true);
                        setPassword("");
                      }}
                      className="text-xs text-logo hover:text-white transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!isForgot}
                    minLength={6}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-logo/60 focus:ring-1 focus:ring-logo/60 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ y: -2, boxShadow: "0px 10px 20px rgba(229, 1, 0, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-logo text-white py-4 rounded-xl font-black uppercase tracking-widest mt-4 border border-red-500/50 shadow-lg hover:bg-logo/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : isForgot
                ? "Send Reset Link"
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            {isForgot ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setIsLogin(true);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Remembered your password?{" "}
                <span className="text-logo font-bold underline decoration-transparent hover:decoration-logo underline-offset-4 transition-all">
                  Log in
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail("");
                  setPassword("");
                  setFullName("");
                  setMobileNo("");
                  setSelectedMember(null);
                  setMemberResults([]);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-logo font-bold underline decoration-transparent hover:decoration-logo underline-offset-4 transition-all">
                  {isLogin ? "Sign up" : "Log in"}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-[85vh]" />}>
      <LoginForm />
    </Suspense>
  );
}