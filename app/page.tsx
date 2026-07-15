"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Users, Star, MapPin, Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero Section - Proper Dark Glass */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:py-24 md:px-20 w-full max-w-7xl mx-auto flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="mb-6 relative z-10"
          >
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
              Push Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-logo to-red-800 drop-shadow-none">Limits</span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-xl text-gray-300 max-w-2xl mb-12 font-medium relative z-10"
          >
            Welcome to <strong className="text-white">New Fitness Point Gym</strong>. Experience our aesthetic 3D environment, world-class equipment, and premium training protocols designed to sculpt your best self.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 relative z-10"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2, boxShadow: "0px 10px 30px rgba(229, 1, 0, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-logo text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl border border-red-500/50 transition-all text-sm md:text-base"
              >
                Start Membership
              </motion.button>
            </Link>
            <Link href="#plans" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white/5 backdrop-blur-xl border border-white/20 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-xl text-sm md:text-base"
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
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Scroll Down</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-logo rounded-full shadow-[0_0_10px_rgba(229,1,0,0.8)]"></div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section (Bento Grid) - Dark Glass */}
      <div className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Why Choose Us</h2>
            <div className="w-20 md:w-24 h-1.5 bg-logo rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Left large bento block */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-14 flex flex-col justify-between relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)] min-h-[400px]"
            >
              <div className="absolute -right-10 -bottom-10 text-[150px] md:text-[200px] font-black text-white/5 leading-none group-hover:scale-110 transition-transform duration-700">01</div>
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-8 md:mb-10 group-hover:-translate-y-2 group-hover:border-logo/50 transition-all duration-500">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tight text-white uppercase">Modern Equipment</h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-md">Train with the latest biomechanically perfect machinery and premium free weights in our meticulously designed aesthetic facility.</p>
              </div>
            </motion.div>

            {/* Right side stacked bento blocks */}
            <div className="grid grid-rows-2 gap-6 md:gap-10">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute -right-4 -bottom-4 text-[100px] md:text-[120px] font-black text-white/5 leading-none group-hover:scale-110 transition-transform duration-700">02</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-6 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-1 group-hover:border-logo/50 transition-all duration-500">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Elite Trainers</h3>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">Our certified professionals provide personalized training protocols tailored to your exact physical goals.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-logo/10 backdrop-blur-3xl border border-logo/20 rounded-[2rem] p-6 md:p-10 flex flex-col justify-center relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute -right-4 -bottom-4 text-[100px] md:text-[120px] font-black text-logo/10 leading-none group-hover:scale-110 transition-transform duration-700">03</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 md:gap-6 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-logo/20 border border-logo/30 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-all duration-500">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-logo drop-shadow-[0_0_10px_rgba(229,1,0,0.8)]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Premium Vibes</h3>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm">A cinematic, minimalist dark environment equipped with premium lighting that keeps you focused.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section (Editorial List) - Dark Mode */}
      <div className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Elite Programs</h2>
              <div className="w-20 md:w-24 h-1.5 bg-logo rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 max-w-md text-base md:text-lg font-medium"
            >
              Specialized programs designed for maximum results. Select your discipline.
            </motion.p>
          </div>

          <div className="flex flex-col border-t border-white/10">
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
                className="group border-b border-white/10 py-6 md:py-12 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:md:px-8 hover:bg-white/5 hover:backdrop-blur-md transition-all duration-500 rounded-xl px-2"
              >
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase group-hover:text-logo group-hover:drop-shadow-[0_0_15px_rgba(229,1,0,0.8)] transition-all duration-300 mb-3 md:mb-0">
                  {prog.title}
                </h3>
                <div className="flex items-center gap-6 md:gap-8 justify-between w-full md:w-auto">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{prog.time}</span>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-logo group-hover:border-logo group-hover:shadow-[0_0_15px_rgba(229,1,0,0.6)] transition-all duration-300">
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white md:opacity-0 md:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership Plans Overview (Asymmetrical Dark Glass) */}
      <div id="plans" className="relative z-10 bg-transparent py-24 md:py-32 px-4 md:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 text-white">Choose Your Path</h2>
            <div className="w-20 md:w-24 h-1.5 bg-logo mx-auto rounded-full shadow-[0_0_15px_rgba(229,1,0,0.6)]"></div>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 max-w-6xl mx-auto">
            {/* Basic Plan (Left side) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-3xl hover:bg-black/60 border border-white/10 hover:border-logo/50 rounded-[2rem] lg:rounded-[2.5rem] lg:rounded-r-none hover:lg:rounded-[2.5rem] hover:z-30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 w-full lg:w-1/3 z-10 relative transition-all duration-500 shadow-2xl"
            >
              <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight uppercase text-white group-hover:text-logo transition-colors duration-300">Monthly Basic</h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-sm mb-6 font-medium transition-colors duration-300">Standard access for regular lifters.</p>
              <div className="mb-8 border-b border-white/5 group-hover:border-white/10 pb-4 transition-colors duration-300">
                <span className="text-3xl md:text-4xl font-black tracking-tighter text-white transition-colors duration-300">$50</span>
                <span className="text-gray-500 font-bold ml-1 text-sm">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Gym Floor Access", "Locker Room", "Basic Classes"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white font-medium transition-colors duration-300">
                    <Star className="w-4 h-4 text-logo/80 group-hover:text-logo shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-white/10 border border-white/10 group-hover:bg-logo group-hover:border-logo text-white group-hover:shadow-[0_0_20px_rgba(229,1,0,0.4)] group-hover:-translate-y-1">Select Plan</button>
              </Link>
            </motion.div>

            {/* Premium Plan (Center Focus) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-3xl hover:bg-black/60 border border-white/10 hover:border-logo/50 rounded-[2rem] lg:rounded-[2.5rem] hover:z-30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-10 md:p-12 w-full lg:w-[40%] z-20 relative transition-all duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)] order-first lg:order-none mb-4 lg:mb-0"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 group-hover:bg-logo group-hover:border-logo text-gray-300 group-hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg group-hover:shadow-[0_0_20px_rgba(229,1,0,0.6)] transition-all duration-300 backdrop-blur-md whitespace-nowrap">Most Popular</div>
              <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight uppercase text-center text-white group-hover:text-logo transition-colors duration-300 drop-shadow-sm mt-2 md:mt-0">Premium Yearly</h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-sm mb-8 text-center font-medium transition-colors duration-300">The ultimate fitness experience.</p>
              <div className="mb-10 text-center border-b border-white/5 group-hover:border-white/10 pb-10 transition-colors duration-300">
                <span className="text-5xl md:text-6xl font-black tracking-tighter text-white transition-colors duration-300">$1200</span>
                <span className="text-gray-500 font-bold ml-2 text-sm">/yr</span>
              </div>
              <ul className="space-y-4 md:space-y-5 mb-10">
                {["All Access", "Personal Training", "Spa & Sauna", "Priority Booking"].map((f, i) => (
                  <li key={i} className="flex items-center justify-center gap-3 text-sm text-gray-300 group-hover:text-white font-bold transition-colors duration-300">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-logo/80 group-hover:text-logo group-hover:drop-shadow-[0_0_5px_rgba(229,1,0,0.8)] shrink-0 transition-all" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-4 md:py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all bg-white/10 border border-white/10 group-hover:bg-logo group-hover:border-logo text-white group-hover:shadow-[0_0_20px_rgba(229,1,0,0.4)] group-hover:-translate-y-1">Select Premium</button>
              </Link>
            </motion.div>

            {/* Cardio Plan (Right side) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-3xl hover:bg-black/60 border border-white/10 hover:border-logo/50 rounded-[2rem] lg:rounded-[2.5rem] lg:rounded-l-none hover:lg:rounded-[2.5rem] hover:z-30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 w-full lg:w-1/3 z-10 relative transition-all duration-500 shadow-2xl"
            >
              <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight uppercase text-white group-hover:text-logo transition-colors duration-300">Cardio Special</h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-sm mb-6 font-medium transition-colors duration-300">Perfect for runners & athletes.</p>
              <div className="mb-8 border-b border-white/5 group-hover:border-white/10 pb-4 transition-colors duration-300">
                <span className="text-3xl md:text-4xl font-black tracking-tighter text-white transition-colors duration-300">$30</span>
                <span className="text-gray-500 font-bold ml-1 text-sm">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Cardio Zone Only", "Locker Room Access", "No Free Weights"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 group-hover:text-white font-medium transition-colors duration-300">
                    <Star className="w-4 h-4 text-logo/80 group-hover:text-logo shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full">
                <button className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-white/10 border border-white/10 group-hover:bg-logo group-hover:border-logo text-white group-hover:shadow-[0_0_20px_rgba(229,1,0,0.4)] group-hover:-translate-y-1">Select Plan</button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer / CTA - Dark Glass */}
      <div className="relative z-10 bg-transparent py-20 md:py-24 px-4 md:px-6 border-t border-white/10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-logo/20 to-transparent opacity-20"></div>
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 relative z-10 text-white drop-shadow-lg">Ready to Transform?</h2>
          <p className="text-gray-300 mb-8 md:mb-10 text-base md:text-lg relative z-10">Join New Fitness Point today and experience the ultimate training environment.</p>
          <Link href="/login">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-logo text-white hover:bg-logo/90 shadow-[0_0_20px_rgba(229,1,0,0.4)] hover:shadow-[0_0_30px_rgba(229,1,0,0.6)] transition-all px-8 md:px-12 py-4 md:py-5 rounded-full font-black uppercase tracking-widest relative z-10 border border-red-500/50 text-sm md:text-base w-full sm:w-auto"
            >
              Claim Free Pass
            </motion.button>
          </Link>
        </motion.div>

        <div className="mt-16 md:mt-20 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-xs md:text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-logo/90"/> 123 Fitness Avenue, Neo City</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-logo/90"/> +1 (555) 019-2837</div>
          <div className="text-gray-600">© 2026 New Fitness Point Gym. All Rights Reserved.</div>
        </div>
      </div>
    </div>
  );
}
