"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Activity, Users, Star, MapPin, Phone } from "lucide-react";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden selection:bg-logo selection:text-gray-900">
      {/* 3D Parallax Background */}
      <motion.div 
        style={{ y, opacity }}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      >
        <Image 
          src="/bg-light.png" 
          alt="Gym 3D Background" 
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/95"></div>
      </motion.div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between p-4 md:px-12 bg-white/60 backdrop-blur-lg border-b border-gray-200">
        <Link href="/" className="flex items-center gap-4 group cursor-pointer">
          <div className="bg-white p-2 rounded-2xl shadow-lg group-hover:shadow-lg transition-all duration-300">
             <Image 
               src="/logo.jpg" 
               alt="New Fitness Point Logo" 
               width={50} 
               height={50} 
               className="object-contain mix-blend-multiply rounded-xl" 
             />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-gray-900 drop-shadow-lg flex flex-col group-hover:text-logo/90 transition-colors duration-300">
            <span>New Fitness Point</span>
            <span className="text-[10px] text-logo/90 tracking-widest mt-[-2px]">Premium Gym & Fitness</span>
          </span>
        </Link>
        <Link href="/login">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-gradient-to-r from-logo to-logo/60 hover:from-logo/90 hover:to-logo/80 text-gray-900 px-6 py-2.5 rounded-full font-bold transition-all shadow-lg"
          >
            Login / Sign In <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white/30 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-10 md:py-24 md:px-20 w-[95%] max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="mb-6 relative z-10"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 drop-shadow-sm">
              Push Your <br />
              <span className="text-logo drop-shadow-md">Limits</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-700 max-w-2xl mb-12 font-medium relative z-10"
          >
            Welcome to <strong className="text-gray-900">New Fitness Point Gym</strong>. Experience our aesthetic 3D environment, world-class equipment, and premium training protocols designed to sculpt your best self.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 relative z-10"
          >
            <Link href="/login">
              <motion.button 
                whileHover={{ y: -2, boxShadow: "0px 10px 20px rgba(229, 1, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-logo text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-xl transition-all"
              >
                Start Membership
              </motion.button>
            </Link>
            <Link href="#plans">
              <motion.button 
                whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/50 backdrop-blur-md border border-gray-300 text-gray-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-sm"
              >
                Explore Plans
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Scroll Down</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-logo rounded-full"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section (Bento Grid) */}
      <div className="relative z-10 bg-white py-32 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-gray-900">Why Choose Us</h2>
            <div className="w-24 h-1.5 bg-logo rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Left large bento block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 border border-gray-100 rounded-[2rem] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 text-[200px] font-black text-gray-200/50 leading-none group-hover:scale-110 transition-transform duration-700">01</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <Activity className="w-8 h-8 text-logo" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-gray-900 uppercase">Modern Equipment</h3>
                <p className="text-gray-500 text-lg leading-relaxed max-w-md">Train with the latest biomechanically perfect machinery and premium free weights in our meticulously designed aesthetic facility.</p>
              </div>
            </motion.div>

            {/* Right side stacked bento blocks */}
            <div className="grid grid-rows-2 gap-6 md:gap-10">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group"
              >
                <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-gray-200/50 leading-none group-hover:scale-110 transition-transform duration-700">02</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform duration-500">
                      <Users className="w-6 h-6 text-logo" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Elite Trainers</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed max-w-sm">Our certified professionals provide personalized training protocols tailored to your exact physical goals.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-gray-900 text-white rounded-[2rem] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group"
              >
                <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-white/5 leading-none group-hover:scale-110 transition-transform duration-700">03</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:-translate-y-1 transition-transform duration-500">
                      <Star className="w-6 h-6 text-logo" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">Premium Vibes</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed max-w-sm">A cinematic, minimalist environment equipped with premium lighting that keeps you focused.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section (Editorial List) */}
      <div className="relative z-10 bg-white py-32 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-gray-900">Elite Programs</h2>
              <div className="w-24 h-1.5 bg-logo rounded-full"></div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-500 max-w-md text-lg font-medium"
            >
              Specialized programs designed for maximum results. Select your discipline.
            </motion.p>
          </div>

          <div className="flex flex-col border-t border-gray-200">
            {[
              { title: "Strength & Conditioning", time: "Mon/Wed/Fri - 6PM" },
              { title: "Hypertrophy Specialist", time: "Daily - Flexible" },
              { title: "High-Intensity Interval", time: "Tue/Thu - 7AM" },
              { title: "Recovery & Mobility", time: "Saturday - 10AM" }
            ].map((prog, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group border-b border-gray-200 py-8 md:py-12 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:px-6 hover:bg-gray-50 transition-all duration-500 rounded-lg"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 uppercase group-hover:text-logo transition-colors duration-300 mb-4 md:mb-0">
                  {prog.title}
                </h3>
                <div className="flex items-center gap-8">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">{prog.time}</span>
                  <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-logo group-hover:border-logo group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership Plans Overview (Asymmetrical) */}
      <div id="plans" className="relative z-10 bg-gray-50 py-32 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-gray-900">Choose Your Path</h2>
            <div className="w-24 h-1.5 bg-logo mx-auto rounded-full"></div>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 max-w-6xl mx-auto">
            {/* Basic Plan (Left side) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-white hover:bg-gray-900 border border-gray-200 hover:border-logo rounded-[2rem] lg:rounded-r-none hover:lg:rounded-[2rem] hover:z-30 hover:scale-[1.02] hover:shadow-2xl p-10 w-full lg:w-1/3 z-10 relative transition-all duration-500"
            >
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase text-gray-900 group-hover:text-white transition-colors duration-300">Monthly Basic</h3>
              <p className="text-gray-500 group-hover:text-gray-400 text-sm mb-6 font-medium transition-colors duration-300">Standard access for regular lifters.</p>
              <div className="mb-8 border-b border-transparent group-hover:border-white/10 pb-4 transition-colors duration-300">
                <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-white transition-colors duration-300">$50</span>
                <span className="text-gray-400 font-bold ml-1 text-sm">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Gym Floor Access", "Locker Room", "Basic Classes"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-300 font-medium transition-colors duration-300">
                    <Star className="w-4 h-4 text-logo shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-gray-100 group-hover:bg-logo text-gray-900 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(229,1,0,0.2)] group-hover:-translate-y-1">Select Plan</button>
              </Link>
            </motion.div>

            {/* Premium Plan (Center Focus) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900 text-white border-2 border-logo rounded-[2.5rem] p-12 w-full lg:w-[40%] z-20 shadow-2xl relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-logo text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">Most Popular</div>
              <h3 className="text-3xl font-black mb-2 tracking-tight uppercase text-center">Premium Yearly</h3>
              <p className="text-gray-400 text-sm mb-8 text-center font-medium">The ultimate fitness experience.</p>
              <div className="mb-10 text-center border-b border-white/10 pb-10">
                <span className="text-6xl font-black tracking-tighter text-white">$1200</span>
                <span className="text-gray-400 font-bold ml-2 text-sm">/yr</span>
              </div>
              <ul className="space-y-5 mb-10">
                {["All Access", "Personal Training", "Spa & Sauna", "Priority Booking"].map((f, i) => (
                  <li key={i} className="flex items-center justify-center gap-3 text-sm text-gray-300 font-bold">
                    <Star className="w-5 h-5 text-logo shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all bg-logo hover:bg-logo/90 text-white shadow-[0_10px_20px_rgba(229,1,0,0.2)] hover:-translate-y-1">Select Premium</button>
              </Link>
            </motion.div>

            {/* Cardio Plan (Right side) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-white hover:bg-gray-900 border border-gray-200 hover:border-logo rounded-[2rem] lg:rounded-l-none hover:lg:rounded-[2rem] hover:z-30 hover:scale-[1.02] hover:shadow-2xl p-10 w-full lg:w-1/3 z-10 relative transition-all duration-500"
            >
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase text-gray-900 group-hover:text-white transition-colors duration-300">Cardio Special</h3>
              <p className="text-gray-500 group-hover:text-gray-400 text-sm mb-6 font-medium transition-colors duration-300">Perfect for runners & athletes.</p>
              <div className="mb-8 border-b border-transparent group-hover:border-white/10 pb-4 transition-colors duration-300">
                <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-white transition-colors duration-300">$30</span>
                <span className="text-gray-400 font-bold ml-1 text-sm">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Cardio Zone Only", "Locker Room Access", "No Free Weights"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-300 font-medium transition-colors duration-300">
                    <Star className="w-4 h-4 text-logo shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-gray-100 group-hover:bg-logo text-gray-900 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(229,1,0,0.2)] group-hover:-translate-y-1">Select Plan</button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="relative z-10 bg-gray-50 py-24 px-6 border-t border-gray-200 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/bg-light.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 relative z-10">Ready to Transform?</h2>
          <p className="text-gray-500 mb-10 text-lg relative z-10">Join New Fitness Point today and experience the ultimate training environment.</p>
          <Link href="/login">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all px-12 py-4 rounded-full font-black uppercase tracking-widest transition-colors relative z-10"
            >
              Claim Free Pass
            </motion.button>
          </Link>
        </motion.div>

        <div className="mt-20 flex flex-col md:flex-row justify-center items-center gap-10 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-logo/90"/> 123 Fitness Avenue, Neo City</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-logo/90"/> +1 (555) 019-2837</div>
          <div>© 2026 New Fitness Point Gym. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
}
