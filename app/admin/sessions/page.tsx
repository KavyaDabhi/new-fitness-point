"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Dumbbell,
  Activity,
  CheckCircle2,
  Circle,
  X,
  Save,
  Plus,
  Trash2,
  Edit3,
  Play,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Exercise {
  id: string;
  day: string;
  name: string;
  sets: number;
  reps: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SessionsPage() {
  // Member Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Mode & Day State
  const [mode, setMode] = useState<"track" | "edit">("track");
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return DAYS.includes(todayName) ? todayName : "Monday";
  });

  // Member's Individual Workout Plan
  const [memberPlan, setMemberPlan] = useState<Exercise[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // New Exercise Form State (for Edit Mode)
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState<number>(3);
  const [newExReps, setNewExReps] = useState("10-12");

  // Live Member Search
  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(5);

      if (!error && data) setSearchResults(data);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Select a member and load their individual plan
  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setSearchQuery("");
    setSearchResults([]);
    setCompletedExercises([]);

    const savedPlan = Array.isArray(member.workout_plan) ? member.workout_plan : [];
    setMemberPlan(savedPlan);

    // If they have no workouts yet, open Edit mode automatically
    setMode(savedPlan.length === 0 ? "edit" : "track");
  };

  // Add exercise to the current day (local state)
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      day: selectedDay,
      name: newExName.trim(),
      sets: Number(newExSets) || 3,
      reps: newExReps.trim() || "10-12",
    };

    setMemberPlan((prev) => [...prev, newExercise]);
    setNewExName("");
    setNewExSets(3);
    setNewExReps("10-12");
  };

  // Remove exercise (local state)
  const handleRemoveExercise = (id: string) => {
    setMemberPlan((prev) => prev.filter((ex) => ex.id !== id));
    setCompletedExercises((prev) => prev.filter((exId) => exId !== id));
  };

  // Save the member's entire custom workout plan to Supabase
  const handleSavePlanToDB = async () => {
    if (!selectedMember) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("members")
        .update({ workout_plan: memberPlan })
        .eq("id", selectedMember.id);

      if (error) throw error;

      // Update local selectedMember object so it stays in sync
      setSelectedMember({ ...selectedMember, workout_plan: memberPlan });
      alert(`Workout plan saved for ${selectedMember.name}!`);
      setMode("track");
    } catch (error: any) {
      console.error("Save Plan Error:", error);
      alert("Failed to save workout plan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle exercise completion in Track Mode
  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) =>
      prev.includes(id) ? prev.filter((exId) => exId !== id) : [...prev, id]
    );
  };

  // Finish Session
  const handleFinishSession = async () => {
    if (!selectedMember) return;
    setIsSaving(true);

    // Optional: You can also insert a row into a 'session_logs' table here later
    await new Promise((resolve) => setTimeout(resolve, 600));

    alert(`${selectedDay} session completed for ${selectedMember.name}!`);
    setCompletedExercises([]);
    setIsSaving(false);
  };

  // Exercises filtered for the selected day
  const todaysExercises = memberPlan.filter((ex) => ex.day === selectedDay);
  const progressPercentage =
    todaysExercises.length > 0
      ? Math.round((completedExercises.length / todaysExercises.length) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <div className="w-14 h-14 bg-logo/10 border border-logo/20 text-logo rounded-2xl flex items-center justify-center shadow-sm">
          <Activity className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
            Member Sessions
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Assign custom workouts and track daily training sessions per member.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Select Member */}
        <div className="lg:col-span-4 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 relative z-20">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              1. Select Member
            </h3>

            {!selectedMember ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search member name..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-logo focus:ring-1 focus:ring-logo transition-colors placeholder:text-gray-400 shadow-sm"
                />

                <AnimatePresence>
                  {searchQuery.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => handleSelectMember(member)}
                            className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <div>
                              <p className="font-black text-gray-900 uppercase">{member.name}</p>
                              <p className="text-xs text-gray-500 font-medium">
                                {member.plan || "No Plan"}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
                                member.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {member.status || "UNKNOWN"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                          No members found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Selected Member Card */
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberPlan([]);
                    setCompletedExercises([]);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-logo/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-logo" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-wide text-lg">
                      {selectedMember.name}
                    </h4>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                      {selectedMember.status || "ACTIVE"}
                    </span>
                  </div>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setMode("track")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      mode === "track"
                        ? "bg-logo text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" /> Track
                  </button>
                  <button
                    onClick={() => setMode("edit")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      mode === "edit"
                        ? "bg-black text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Assign Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Workout Tracker / Assigner */}
        <div
          className={`lg:col-span-8 space-y-6 transition-all duration-300 ${
            !selectedMember ? "opacity-30 pointer-events-none grayscale" : "opacity-100"
          }`}
        >
          {/* Day Selector Pills */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
              2. Select Day
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DAYS.map((day) => {
                const count = memberPlan.filter((ex) => ex.day === day).length;
                const isActive = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setCompletedExercises([]);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative ${
                      isActive
                        ? "bg-logo text-white shadow-md"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                    {count > 0 && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDIT / ASSIGN MODE */}
          {mode === "edit" ? (
            <div className="space-y-6">
              {/* Add Exercise Form */}
              <form
                onSubmit={handleAddExercise}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Add Exercise for {selectedDay}
                </h3>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      placeholder="Exercise (e.g. Bench Press)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold text-sm focus:outline-none focus:border-logo focus:bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newExSets}
                      onChange={(e) => setNewExSets(Number(e.target.value))}
                      placeholder="Sets"
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold text-sm text-center focus:outline-none focus:border-logo focus:bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="text"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value)}
                      placeholder="Reps"
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold text-sm text-center focus:outline-none focus:border-logo focus:bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full h-full bg-black hover:bg-gray-800 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1 transition-colors py-3"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </form>

              {/* Current Day's Editable List */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>{selectedDay} Exercises ({todaysExercises.length})</span>
                  <span>Sets / Reps</span>
                </div>

                {todaysExercises.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">
                    No exercises assigned for {selectedDay} yet. Add one above.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {todaysExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Dumbbell className="w-4 h-4 text-logo shrink-0" />
                          <span className="font-black text-gray-900 uppercase text-sm">
                            {ex.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                            {ex.sets} × {ex.reps}
                          </span>
                          <button
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

              {/* Save Plan to Supabase Button */}
              <button
                onClick={handleSavePlanToDB}
                disabled={isSaving}
                className="w-full py-5 rounded-2xl bg-logo hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save {selectedMember?.name}'s Workout Plan
                  </>
                )}
              </button>
            </div>
          ) : (
            /* TRACK SESSION MODE */
            <div className="space-y-6">
              {/* Progress Bar Header */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {selectedDay} Protocol
                  </p>
                  <p className="text-xl font-black text-gray-900 uppercase">
                    {completedExercises.length} of {todaysExercises.length} Completed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-logo">{progressPercentage}%</span>
                </div>
              </div>

              {/* Exercises Checklist */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <div className="col-span-8">Exercise</div>
                  <div className="col-span-2 text-center">Sets</div>
                  <div className="col-span-2 text-right">Reps</div>
                </div>

                {todaysExercises.length === 0 ? (
                  <div className="p-10 text-center space-y-4">
                    <p className="text-gray-400 font-medium text-sm">
                      No workout assigned for {selectedMember?.name} on {selectedDay}.
                    </p>
                    <button
                      onClick={() => setMode("edit")}
                      className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Assign {selectedDay} Workout
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {todaysExercises.map((exercise) => {
                      const isCompleted = completedExercises.includes(exercise.id);
                      return (
                        <div
                          key={exercise.id}
                          onClick={() => toggleExercise(exercise.id)}
                          className={`px-6 py-5 grid grid-cols-12 gap-4 items-center cursor-pointer transition-all hover:bg-gray-50 ${
                            isCompleted ? "bg-green-50/30" : ""
                          }`}
                        >
                          <div className="col-span-8 flex items-center gap-4">
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300 shrink-0" />
                            )}
                            <span
                              className={`font-black uppercase tracking-tight text-sm md:text-base ${
                                isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                              }`}
                            >
                              {exercise.name}
                            </span>
                          </div>
                          <div
                            className={`col-span-2 text-center font-bold text-sm ${
                              isCompleted ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {exercise.sets}
                          </div>
                          <div
                            className={`col-span-2 text-right font-bold text-sm ${
                              isCompleted ? "text-gray-400" : "text-logo"
                            }`}
                          >
                            {exercise.reps}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Finish Session Button */}
              {todaysExercises.length > 0 && (
                <button
                  onClick={handleFinishSession}
                  disabled={isSaving || completedExercises.length === 0}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-lg ${
                    isSaving || completedExercises.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-black text-white hover:bg-gray-900 hover:-translate-y-1 hover:shadow-xl"
                  }`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />{" "}
                      {progressPercentage === 100 ? "Log Perfect Session" : "Save Partial Session"}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}