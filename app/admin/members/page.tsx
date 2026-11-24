"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  Search,
  MoreVertical,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Upload,
  Printer,
  Loader2,
  Edit3,
  Save,
} from "lucide-react";

export default function MembersDirectory() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- MEMBER REGISTRATION FORM MODAL STATE ---
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [formEditData, setFormEditData] = useState<any>({});

  // --- ADD MEMBER FORM MODAL STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    mobile_no: "",
    plan: "1 year",
    amount: "",
    join_date: new Date().toISOString().split("T")[0],
  });

  // --- CSV IMPORT STATE ---
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DROPDOWN STATE ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("join_date", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse plan string like "13 month", "6 month", "1 year", "3 months" into total months
  const parsePlanMonths = (planStr?: string): number | null => {
    if (!planStr) return null;
    const normalized = planStr.trim().toLowerCase();

    const monthMatch = normalized.match(/(\d+)\s*(month|months|mo)/);
    if (monthMatch) return parseInt(monthMatch[1], 10);

    const yearMatch = normalized.match(/(\d+)\s*(year|years|yr)/);
    if (yearMatch) return parseInt(yearMatch[1], 10) * 12;

    if (normalized.includes("annual") || normalized.includes("yearly")) return 12;
    if (normalized.includes("half")) return 6;
    if (normalized.includes("quarter")) return 3;

    return null;
  };

  const calculateDurationLabel = (planStr?: string): string => {
    const months = parsePlanMonths(planStr);
    if (!months) return planStr || "-";
    if (months === 12) return "1 Year (12 Months)";
    if (months % 12 === 0) return `${months / 12} Years (${months} Months)`;
    return `${months} ${months === 1 ? "Month" : "Months"}`;
  };

  const calculateLastDate = (joinDateStr?: string, planStr?: string): Date | null => {
    if (!joinDateStr) return null;
    const start = new Date(joinDateStr);
    if (isNaN(start.getTime())) return null;

    const months = parsePlanMonths(planStr);
    if (!months) return null;

    return new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return "-";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === "string" ? dateInput : "-";
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };

  const syncFormEditState = (m: any) => {
    setFormEditData({
      name: m.name || "",
      dob: m.dob ? new Date(m.dob).toISOString().split("T")[0] : "",
      age: m.age || "",
      gender: m.gender || "",
      address: m.address || "",
      city: m.city || "",
      mobile_no: m.mobile_no || "",
      email: m.email || "",
      plan: m.plan || "1 year",
      join_date: m.join_date ? new Date(m.join_date).toISOString().split("T")[0] : "",
      amount: m.amount ?? "",
    });
  };

  const handleOpenMemberForm = async (member: any) => {
    setViewingMember(member);
    syncFormEditState(member);
    setIsEditingForm(false);
    setLoadingDetail(true);

    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", member.id)
        .single();

      if (!error && data) {
        setViewingMember(data);
        syncFormEditState(data);
      }
    } catch (err) {
      console.error("Error fetching member details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveMemberForm = async () => {
    if (!viewingMember) return;
    setIsSavingForm(true);

    try {
      const payload: any = {
        name: formEditData.name.trim(),
        dob: formEditData.dob || null,
        age: formEditData.age !== "" ? Number(formEditData.age) : null,
        gender: formEditData.gender || null,
        address: formEditData.address || null,
        city: formEditData.city || null,
        mobile_no: formEditData.mobile_no || null,
        email: formEditData.email || null,
        plan: formEditData.plan.trim() || "1 year",
        join_date: formEditData.join_date || null,
        amount: formEditData.amount !== "" ? Number(formEditData.amount) : null,
      };

      const { data, error } = await supabase
        .from("members")
        .update(payload)
        .eq("id", viewingMember.id)
        .select()
        .single();

      if (error) throw error;

      const updatedRow = data || { ...viewingMember, ...payload };
      setViewingMember(updatedRow);
      syncFormEditState(updatedRow);
      setMembers((prev) => prev.map((m) => (m.id === viewingMember.id ? updatedRow : m)));
      setIsEditingForm(false);
    } catch (err: any) {
      console.error("Error updating member:", err);
      alert(`Failed to save: ${err.message || "Check column names in Supabase"}`);
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: newMember.name.trim(),
        email: newMember.email.trim() === "" ? null : newMember.email.trim(),
        mobile_no: newMember.mobile_no.trim() === "" ? null : newMember.mobile_no.trim(),
        plan: newMember.plan.trim() || "1 year",
        join_date: newMember.join_date,
        amount: newMember.amount.trim() !== "" ? Number(newMember.amount) : null,
        status: "Active",
      };

      const { error } = await supabase.from("members").insert([payload]);

      if (error) throw error;

      await fetchMembers();
      setIsAddModalOpen(false);
      setNewMember({
        name: "",
        email: "",
        mobile_no: "",
        plan: "1 year",
        amount: "",
        join_date: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Error adding member:", error);
      alert(`Database Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split("\n").filter((row) => row.trim() !== "");
        if (rows.length < 2) throw new Error("CSV file is empty or missing data.");

        const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
        const newMembersToInsert = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));

          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          if (rowData.name) {
            newMembersToInsert.push({
              name: rowData.name,
              email: rowData.email || null,
              mobile_no: rowData.mobile_no || rowData.phone || null,
              plan: rowData.plan || "1 year",
              amount: rowData.amount ? Number(rowData.amount) : null,
              join_date: rowData.join_date || new Date().toISOString().split("T")[0],
              status: "Active",
            });
          }
        }

        if (newMembersToInsert.length === 0) throw new Error("No valid member names found in CSV.");

        const { error } = await supabase.from("members").insert(newMembersToInsert);
        if (error) throw error;

        alert(`Success! Imported ${newMembersToInsert.length} members.`);
        await fetchMembers();
      } catch (error: any) {
        console.error("CSV Import Error:", error);
        alert(error.message || "Failed to import CSV. Check formatting.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleDeleteMember = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently remove ${name}?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;

      setMembers(members.filter((m) => m.id !== id));
      if (viewingMember?.id === id) setViewingMember(null);
      setActiveDropdown(null);
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member.");
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.mobile_no?.includes(searchQuery)
  );

  const calculatedLastDate = viewingMember
    ? calculateLastDate(viewingMember.join_date, viewingMember.plan)
    : null;

  const newMemberLastDate = calculateLastDate(newMember.join_date, newMember.plan);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 font-serif">
            Member Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Click any member to view their calculated plan duration, expiry date, and registration form.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex w-full sm:w-auto gap-3">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleCSVUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {isImporting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-4 h-4 text-gray-500" />
              )}
              Import CSV
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD MEMBER REGISTRATION FORM MODAL (A4 PORTAL) --- */}
      {isAddModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d0d] w-[210mm] max-w-full min-h-[297mm] rounded-2xl shadow-2xl p-8 md:p-[18mm] border border-white/15 font-serif text-white relative flex flex-col justify-between my-auto"
            >
              {/* Close Button */}
              <div className="no-print flex justify-end mb-4 font-sans relative z-30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 bg-white/10 hover:bg-[#e50100] text-white rounded-full transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="relative w-[110%] md:w-[500px] aspect-square">
                  <Image
                    src="/logo.jpeg"
                    alt="New Fitness Point Watermark"
                    fill
                    className="object-contain opacity-10 grayscale mix-blend-screen"
                    unoptimized
                  />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col relative z-10">
                {/* Gym Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-full text-center border-b-[3px] border-[#e50100] pb-2">
                    <h1 className="text-2xl md:text-4xl font-black tracking-[0.10em] text-white uppercase">
                      NEW FITNESS POINT GYM
                    </h1>
                  </div>
                  <p className="italic text-gray-400 text-base mt-2 tracking-wide font-sans">
                    achieve your potential...
                  </p>
                </div>

                <h2 className="text-center font-bold text-lg md:text-xl tracking-widest text-white/90 mb-10 flex items-center justify-center gap-4">
                  <span className="h-px bg-white/20 w-12 hidden md:block"></span>
                  MEMBER REGISTRATION FORM
                  <span className="h-px bg-white/20 w-12 hidden md:block"></span>
                </h2>

                <form onSubmit={handleAddMember} className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="space-y-8 text-[15px] font-medium leading-relaxed">
                      {/* Full Name */}
                      <div className="flex items-end">
                        <span className="mr-4 whitespace-nowrap text-gray-400">Full Name: -</span>
                        <div className="flex-1 flex flex-col">
                          <input
                            required
                            type="text"
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            placeholder="Enter member full name"
                            className="w-full bg-transparent border-b-[1.5px] border-white/30 focus:border-[#e50100] text-center font-bold text-lg pb-1 px-4 tracking-widest uppercase text-white placeholder:text-gray-600 placeholder:text-sm placeholder:normal-case placeholder:tracking-normal outline-none transition-colors"
                          />
                          <div className="flex justify-between text-[9px] text-gray-500 px-10 pt-1 font-sans tracking-widest">
                            <span>NAME</span>
                            <span>MIDDLE NAME</span>
                            <span>SURNAME</span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="flex items-end">
                        <span className="mr-4 whitespace-nowrap text-gray-400">Mobile : -</span>
                        <input
                          type="tel"
                          value={newMember.mobile_no}
                          onChange={(e) => setNewMember({ ...newMember, mobile_no: e.target.value })}
                          placeholder="10-digit mobile number (optional)"
                          className="flex-1 bg-transparent border-b-[1.5px] border-white/30 focus:border-[#e50100] text-center font-bold pb-1 px-4 tracking-widest text-white placeholder:text-gray-600 placeholder:text-xs placeholder:tracking-normal outline-none transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex items-end">
                        <span className="mr-4 whitespace-nowrap text-gray-400">E – Mail ( ID ) : -</span>
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="member@example.com (optional)"
                          className="flex-1 bg-transparent border-b-[1.5px] border-white/30 focus:border-[#e50100] font-bold pl-4 pb-1 tracking-wide text-white font-sans placeholder:text-gray-600 placeholder:text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Editable Program Inputs + Auto-Calculated Preview Table */}
                    <div className="mt-14">
                      <h3 className="text-center font-bold mb-6 tracking-[0.2em] text-white/90 text-base flex items-center justify-center gap-4">
                        <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
                        PROGRAM DETAILS
                        <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 font-sans text-xs">
                        <div>
                          <label className="block font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            Program / Plan
                          </label>
                          <input
                            required
                            type="text"
                            value={newMember.plan}
                            onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
                            placeholder="1 year, 6 month, 13 month"
                            className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3.5 py-2.5 text-white outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            Join Date
                          </label>
                          <input
                            required
                            type="date"
                            value={newMember.join_date}
                            onChange={(e) => setNewMember({ ...newMember, join_date: e.target.value })}
                            className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3.5 py-2.5 text-white outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                            Amount (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={newMember.amount}
                            onChange={(e) => setNewMember({ ...newMember, amount: e.target.value })}
                            placeholder="7000"
                            className="w-full bg-white/5 border border-white/15 focus:border-[#e50100] rounded-xl px-3.5 py-2.5 text-white outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="border border-white/10 p-[1px] rounded-xl bg-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-center text-[13px] font-sans">
                            <thead>
                              <tr className="bg-black/40 text-gray-400">
                                <th className="border-b border-r border-white/10 py-3.5 px-4 font-bold uppercase tracking-widest">
                                  PROGRAMS
                                </th>
                                <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                                  DURATION
                                </th>
                                <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                                  JOIN DATE
                                </th>
                                <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                                  LAST DATE
                                </th>
                                <th className="border-b border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                                  AMOUNT
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="h-14">
                                <td className="border-r border-white/10 text-left font-bold pl-5 text-white tracking-wide uppercase">
                                  {newMember.plan || "-"}
                                </td>
                                <td className="border-r border-white/10 font-medium text-gray-300">
                                  {calculateDurationLabel(newMember.plan)}
                                </td>
                                <td className="border-r border-white/10 font-medium text-gray-300">
                                  {formatDate(newMember.join_date)}
                                </td>
                                <td className="border-r border-white/10 font-medium text-gray-300">
                                  {formatDate(newMemberLastDate)}
                                </td>
                                <td className="font-bold text-white tracking-wider">
                                  {newMember.amount.trim() !== "" ? `₹${Number(newMember.amount)}` : "-"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end font-sans">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="bg-[#e50100] hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
                    >
                      {isSubmitting ? "Saving Member..." : "Save Member"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* --- MEMBER REGISTRATION FORM MODAL (A4 VIEW / EDIT / PRINT - PORTAL) --- */}
      {viewingMember &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setViewingMember(null)}
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              id="a4-registration-form"
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d0d] w-[210mm] max-w-full min-h-[297mm] rounded-2xl shadow-2xl p-8 md:p-[18mm] border border-white/15 font-serif text-white relative flex flex-col justify-between my-auto"
            >
              {/* Top Action Buttons (Hidden when printing) */}
              <div className="no-print flex items-center justify-between gap-2 mb-6 font-sans relative z-30">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {loadingDetail && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e50100]" />
                      Syncing from database...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingForm ? (
                    <button
                      onClick={() => setIsEditingForm(true)}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveMemberForm}
                      disabled={isSavingForm}
                      className="flex items-center gap-1.5 bg-[#e50100] hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {isSavingForm ? "Saving..." : "Save"}
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={() => setViewingMember(null)}
                    className="p-2 bg-white/10 hover:bg-[#e50100] text-white rounded-full transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="relative w-[110%] md:w-[500px] aspect-square">
                  <Image
                    src="/logo.jpeg"
                    alt="New Fitness Point Watermark"
                    fill
                    className="object-contain opacity-10 grayscale mix-blend-screen"
                    unoptimized
                  />
                </div>
              </div>

              {/* Main A4 Form Content */}
              <div className="flex-1 flex flex-col relative z-10">
                {/* Gym Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-full text-center border-b-[3px] border-[#e50100] pb-2">
                    <h1 className="text-2xl md:text-4xl font-black tracking-[0.10em] text-white uppercase">
                      NEW FITNESS POINT GYM
                    </h1>
                  </div>
                  <p className="italic text-gray-400 text-base mt-2 tracking-wide font-sans">
                    achieve your potential...
                  </p>
                </div>

                <h2 className="text-center font-bold text-lg md:text-xl tracking-widest text-white/90 mb-12 flex items-center justify-center gap-4">
                  <span className="h-px bg-white/20 w-12 hidden md:block"></span>
                  MEMBER REGISTRATION FORM
                  <span className="h-px bg-white/20 w-12 hidden md:block"></span>
                </h2>

                {/* Edit Mode vs View Mode */}
                {isEditingForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formEditData.name}
                        onChange={(e) => setFormEditData({ ...formEditData, name: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Mobile No</label>
                      <input
                        type="text"
                        value={formEditData.mobile_no}
                        onChange={(e) => setFormEditData({ ...formEditData, mobile_no: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={formEditData.email}
                        onChange={(e) => setFormEditData({ ...formEditData, email: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Plan (e.g. 1 year, 13 month)</label>
                      <input
                        type="text"
                        value={formEditData.plan}
                        onChange={(e) => setFormEditData({ ...formEditData, plan: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Join Date</label>
                      <input
                        type="date"
                        value={formEditData.join_date}
                        onChange={(e) => setFormEditData({ ...formEditData, join_date: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formEditData.amount}
                        onChange={(e) => setFormEditData({ ...formEditData, amount: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e50100]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 text-[15px] font-medium leading-relaxed">
                    <div className="flex items-end">
                      <span className="mr-4 whitespace-nowrap text-gray-400">Full Name: -</span>
                      <div className="flex-1 flex flex-col">
                        <span className="border-b-[1.5px] border-white/30 text-center font-bold text-lg pb-1 px-4 tracking-widest uppercase text-white">
                          {viewingMember.name || "-"}
                        </span>
                        <div className="flex justify-between text-[9px] text-gray-500 px-10 pt-1 font-sans tracking-widest">
                          <span>NAME</span>
                          <span>MIDDLE NAME</span>
                          <span>SURNAME</span>
                        </div>
                      </div>
                    </div>

                    {viewingMember.mobile_no && (
                      <div className="flex items-end">
                        <span className="mr-4 whitespace-nowrap text-gray-400">Mobile : -</span>
                        <span className="border-b-[1.5px] border-white/30 flex-1 font-bold text-center pb-1 tracking-widest text-white">
                          {viewingMember.mobile_no}
                        </span>
                      </div>
                    )}

                    <div className="flex items-end">
                      <span className="mr-4 whitespace-nowrap text-gray-400">E – Mail ( ID ) : -</span>
                      <span className="border-b-[1.5px] border-white/30 flex-1 font-bold pl-4 pb-1 tracking-wide text-white font-sans">
                        {viewingMember.email || "Not Linked Yet"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Program Details Table */}
                <div className="mt-14">
                  <h3 className="text-center font-bold mb-6 tracking-[0.2em] text-white/90 text-base flex items-center justify-center gap-4">
                    <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
                    PROGRAM DETAILS
                    <span className="h-px bg-white/10 w-16 hidden sm:block"></span>
                  </h3>

                  <div className="border border-white/10 p-[1px] rounded-xl bg-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-center text-[13px] font-sans">
                        <thead>
                          <tr className="bg-black/40 text-gray-400">
                            <th className="border-b border-r border-white/10 py-3.5 px-4 font-bold uppercase tracking-widest">
                              PROGRAMS
                            </th>
                            <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                              DURATION
                            </th>
                            <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                              JOIN DATE
                            </th>
                            <th className="border-b border-r border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                              LAST DATE
                            </th>
                            <th className="border-b border-white/10 py-3.5 px-3 font-bold uppercase tracking-widest">
                              AMOUNT
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-14">
                            <td className="border-r border-white/10 text-left font-bold pl-5 text-white tracking-wide uppercase">
                              {viewingMember.plan || "-"}
                            </td>
                            <td className="border-r border-white/10 font-medium text-gray-300">
                              {calculateDurationLabel(viewingMember.plan)}
                            </td>
                            <td className="border-r border-white/10 font-medium text-gray-300">
                              {formatDate(viewingMember.join_date)}
                            </td>
                            <td className="border-r border-white/10 font-medium text-gray-300">
                              {formatDate(calculatedLastDate)}
                            </td>
                            <td className="font-bold text-white tracking-wider">
                              {viewingMember.amount !== null && viewingMember.amount !== undefined && viewingMember.amount !== ""
                                ? `₹${Number(viewingMember.amount)}`
                                : "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom A4 Signature Footer */}
              <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 gap-12 text-xs font-sans text-gray-400 relative z-10">
                <div className="text-center">
                  <div className="border-b border-white/30 h-10 mb-2"></div>
                  <p className="uppercase tracking-widest font-bold">Member Signature</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-white/30 h-10 mb-2"></div>
                  <p className="uppercase tracking-widest font-bold">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden pb-20">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <th className="p-5 w-[35%]">Member Info</th>
                <th className="p-5 w-[25%]">Contact</th>
                <th className="p-5 w-[20%]">Joined</th>
                <th className="p-5 w-[15%]">Status</th>
                <th className="p-5 w-[5%] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => handleOpenMemberForm(member)}
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="p-5">
                      <p className="font-bold text-gray-900 mb-1.5">{member.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {member.id ? `NP-${member.id.substring(0, 4).toUpperCase()}` : "N/A"}
                        </span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {member.plan || "STANDARD"}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      <p className="text-gray-500 text-xs mb-1">{member.email || "No email"}</p>
                      <p className="text-gray-700 text-xs">{member.mobile_no || "No phone"}</p>
                    </td>

                    <td className="p-5 text-gray-500 text-sm">
                      {member.join_date ? new Date(member.join_date).toISOString().split("T")[0] : "N/A"}
                    </td>

                    <td className="p-5">
                      <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> {member.status || "ACTIVE"}
                      </div>
                    </td>

                    <td className="p-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === member.id ? null : member.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === member.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-8 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150"
                        >
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold"
                          >
                            <Trash2 className="w-4 h-4" /> Remove Member
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}