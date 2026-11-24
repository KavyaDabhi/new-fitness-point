"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Dumbbell,
  Plus,
  Trash2,
  LogOut,
  Users,
  CheckCircle2,
  Loader2,
  Award,
} from "lucide-react";

interface Exercise {
  id: string;
  day: string;
  name: string;
  sets: number;
  reps: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Add your gym trainers' emails here (Admins can also access this portal)
const TRAINER_EMAILS = [
  "trainer1@newfitnesspoint.com",
  "trainer2@newfitnesspoint.com",
  "newfitnesspointgym@gmail.com",
  "dabhikavy189@gmail.com",
];

export default function TrainerPortal() {
  const [trainerEmail, setTrainerEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected member & day
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");

  // New exercise form state
  const [exName, setExName] = useState("");
  const [exSets, setExSets] = useState("3");
  const [exReps, setExReps] = useState("10-12");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function initTrainerPortal() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/login");
          return;
        }

        const email = user.email?.toLowerCase() || "";
        if (!TRAINER_EMAILS.includes(email)) {
          router.push("/member");
          return;
        }

        setTrainerEmail(email);

        const { data, error } = await supabase
          .from("members")
          .select("id, name, plan, mobile_no, status, workout_plan")
          .order("name", { ascending: true });

        if (error) throw error;

        setMembers(data || []);
        if (data && data.length > 0) {
          setSelectedMember(data[0]);
        }
      } catch (err) {
        console.error("Trainer portal init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initTrainerPortal();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const updateMemberWorkoutInDB = async (memberId: string, updatedPlan: Exercise[]) => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      const { error } = await supabase
        .from("members")
        .update({ workout_plan: updatedPlan })
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      setSelectedMember((prev: any) =>
        prev && prev.id === memberId ? { ...prev, workout_plan: updatedPlan } : prev
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, workout_plan: updatedPlan } : m))
      );

      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err: any) {
      console.error("Failed to save workout:", err);
      alert(`Error saving workout: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !exName.trim()) return;

    const currentPlan: Exercise[] = Array.isArray(selectedMember.workout_plan)
      ? selectedMember.workout_plan
      : [];

    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      day: selectedDay,
      name: exName.trim(),
      sets: Number(exSets) || 3,
      reps: exReps.trim() || "10-12",
    };

    const updatedPlan = [...currentPlan, newExercise];
    await updateMemberWorkoutInDB(selectedMember.id, updatedPlan);

    setExName("");
    setExSets("3");
    setExReps("10-12");
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!selectedMember) return;
    const currentPlan: Exercise[] = Array.isArray(selectedMember.workout_plan)
      ? selectedMember.workout_plan
      : [];

    const updatedPlan = currentPlan.filter((ex) => ex.id !== exerciseId);
    await updateMemberWorkoutInDB(selectedMember.id, updatedPlan);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile_no?.includes(searchQuery)
  );

  const selectedPlan: Exercise[] = Array.isArray(selectedMember?.workout_plan)
    ? selectedMember.workout_plan
    : [];

  const dayExercises = selectedPlan.filter((ex) => ex.day === selectedDay);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#e50100] animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Loading Trainer Portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/15 shrink-0">
              <Image
                src="/logo.jpeg"
                alt="New Fitness Point Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-white">
                New Fitness Point
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#e50100]">
                Trainer Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#111] border border-white/10 px-3 py-1.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-[#e50100]" />
              <span className="text-[11px] font-bold text-gray-300 truncate max-w-[180px]">
                {trainerEmail}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-[#e50100]/20 border border-white/10 hover:border-[#e50100]/50 rounded-full text-gray-400 hover:text-[#e50100] transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT PANEL: MEMBERS DIRECTORY */}
        <section className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col max-h-[78vh]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e50100]" /> Members ({filteredMembers.length})
            </h2>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 focus:border-[#e50100] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 outline-none transition-colors"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-500 text-xs py-10">No members found.</p>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                const totalExercises = Array.isArray(member.workout_plan)
                  ? member.workout_plan.length
                  : 0;

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e50100]/15 border-[#e50100] shadow-[0_0_15px_rgba(229,1,0,0.15)]"
                        : "bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-white truncate">{member.name}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300 shrink-0">
                        {totalExercises} ex
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                      {member.plan || "Standard"} {member.mobile_no ? `• ${member.mobile_no}` : ""}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT PANEL: WORKOUT BUILDER */}
        <section className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col">
          {!selectedMember ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <Dumbbell className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Select a member to manage their workout
              </p>
            </div>
          ) : (
            <>
              {/* Member Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Managing Workout Plan For
                  </p>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                    {selectedMember.name}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e50100]" /> Saving...
                    </span>
                  )}
                  {saveMessage && !isSaving && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-5">
                {DAYS.map((day) => {
                  const count = selectedPlan.filter((ex) => ex.day === day).length;
                  const isActive = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive
                          ? "bg-[#e50100] border-[#e50100] text-white shadow-[0_0_15px_rgba(229,1,0,0.35)]"
                          : "bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {day.slice(0, 3)}
                      {count > 0 && (
                        <span
                          className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-black/25 text-white" : "bg-white/10 text-gray-300"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add Exercise Form */}
              <form
                onSubmit={handleAddExercise}
                className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Exercise Name ({selectedDay})
                  </label>
                  <input
                    required
                    type="text"
                    value={exName}
                    onChange={(e) => setExName(e.target.value)}
                    placeholder="e.g. Incline Dumbbell Press"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Sets
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={exSets}
                    onChange={(e) => setExSets(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3 py-2.5 text-sm text-white outline-none text-center"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Reps
                  </label>
                  <input
                    required
                    type="text"
                    value={exReps}
                    onChange={(e) => setExReps(e.target.value)}
                    placeholder="10-12"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3 py-2.5 text-sm text-white outline-none text-center"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-[#e50100] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </form>

              {/* Exercises List for Selected Day */}
              <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden flex-1">
                <div className="bg-black/50 px-5 py-3 border-b border-white/10 grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <div className="col-span-7">Exercise</div>
                  <div className="col-span-2 text-center">Sets</div>
                  <div className="col-span-2 text-center">Reps</div>
                  <div className="col-span-1 text-right">Del</div>
                </div>

                {dayExercises.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-xs">
                    No exercises assigned for {selectedDay} yet. Add one above.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {dayExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="px-5 py-4 grid grid-cols-12 items-center hover:bg-white/5 transition-colors"
                      >
                        <div className="col-span-7 font-bold text-sm text-white uppercase tracking-tight pr-2">
                          {ex.name}
                        </div>
                        <div className="col-span-2 text-center text-sm font-bold text-gray-300">
                          {ex.sets}
                        </div>
                        <div className="col-span-2 text-center text-sm font-bold text-[#e50100]">
                          {ex.reps}
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => handleDeleteExercise(ex.id)}
                            disabled={isSaving}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}