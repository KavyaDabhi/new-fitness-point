"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Dumbbell, HeartPulse, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase"; 

// Interface mapping to your Supabase table schema
interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo_url: string;
}

// Helper to assign a dynamic icon based on specialty keywords
const getIconForSpecialty = (specialty: string) => {
  const s = specialty.toLowerCase();
  if (s.includes("yoga") || s.includes("flexibility")) return HeartPulse;
  if (s.includes("strength") || s.includes("power") || s.includes("bodybuilding")) return Zap;
  if (s.includes("hiit") || s.includes("cardio")) return Award;
  return Dumbbell;
};

// --- HARDCODED INSTAGRAM LINKS ---
// Add the real URLs inside the quotes below
const getInstagramUrl = (trainerName: string) => {
  const name = trainerName.toLowerCase();
  
  if (name.includes("smit")) return "https://instagram.com/smit_link_here";
  if (name.includes("vinesh")) return "https://instagram.com/vinesh_link_here";
  if (name.includes("niyati")) return "https://instagram.com/niyati_link_here";
  
  return null; // Fallback if no match is found
};

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainers() {
      const { data, error } = await supabase
        .from("trainers")
        .select("*");

      if (error) {
        console.error("Error fetching trainers:", error.message);
      } else if (data) {
        setTrainers(data);
      }
      setLoading(false);
    }

    fetchTrainers();
  }, []);

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
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl mb-4">
            Elite <span className="text-logo">Trainers</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl">
            Meet the world-class professionals who will engineer your physical transformation. 
            No excuses. Just results.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-logo"></div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
            {trainers.map((trainer, index) => {
              const TrainerIcon = getIconForSpecialty(trainer.specialty);
              const instagramUrl = getInstagramUrl(trainer.name);
              
              return (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full md:w-[340px] lg:w-[380px] group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden hover:border-logo/50 hover:shadow-[0_20px_50px_rgba(229,1,0,0.2)] transition-all duration-500 relative flex flex-col"
                >
                  <div className="h-72 relative overflow-hidden bg-black/40 border-b border-white/10">
                    {trainer.photo_url ? (
                      <Image 
                        src={trainer.photo_url}
                        alt={trainer.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-700"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">
                         <TrainerIcon className="w-32 h-32 text-white" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:-translate-y-2 group-hover:bg-logo group-hover:border-logo transition-all duration-500 -mt-14 relative z-20 mb-6">
                      <TrainerIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-black tracking-tight uppercase text-white group-hover:text-logo transition-colors duration-300 mb-1">{trainer.name}</h3>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-logo mb-4">{trainer.specialty}</h4>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-1">
                      {trainer.bio}
                    </p>
                    
                    {/* Hardcoded Link Logic */}
                    {instagramUrl ? (
                      <a 
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex justify-center items-center bg-transparent border border-white/20 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs group-hover:bg-white/10 group-hover:border-white/40 transition-all"
                      >
                        View Profile
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-transparent border border-white/5 text-white/30 py-3 rounded-lg font-bold uppercase tracking-widest text-xs cursor-not-allowed"
                      >
                        Profile Unavailable
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}