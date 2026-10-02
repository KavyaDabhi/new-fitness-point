"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MoreVertical, Trash2, Plus, X, CheckCircle2, Upload } from "lucide-react";

export default function MembersDirectory() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- ADD MEMBER MODAL STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    mobile_no: "",
    plan: "1 YEAR",
    join_date: new Date().toISOString().split('T')[0]
  });

  // --- CSV IMPORT STATE ---
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DROPDOWN STATE (Updated to string for UUID) ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("join_date", { ascending: false }); // Sorts by join date instead of created_at

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

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ADD INDIVIDUAL MEMBER LOGIC (Matches your schema perfectly) ---
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: newMember.name,
        email: newMember.email.trim() === "" ? null : newMember.email.trim(),
        mobile_no: newMember.mobile_no.trim() === "" ? null : newMember.mobile_no.trim(),
        plan: newMember.plan,
        join_date: newMember.join_date,
        status: "Active"
      };

      const { error } = await supabase.from("members").insert([payload]);

      if (error) throw error;

      await fetchMembers(); 
      setIsAddModalOpen(false);
      setNewMember({ name: "", email: "", mobile_no: "", plan: "1 YEAR", join_date: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      console.error("Error adding member:", error);
      alert(`Database Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CSV BULK IMPORT LOGIC (Matches your schema perfectly) ---
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) throw new Error("CSV file is empty or missing data.");

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const newMembersToInsert = [];

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          
          let rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          if (rowData.name) {
            newMembersToInsert.push({
              name: rowData.name,
              email: rowData.email || null,
              mobile_no: rowData.mobile_no || rowData.phone || null,
              plan: rowData.plan || "1 YEAR",
              join_date: rowData.join_date || new Date().toISOString().split('T')[0],
              status: "Active"
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
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    };

    reader.readAsText(file);
  };

  // --- DELETE MEMBER LOGIC (UUID compatible) ---
  const handleDeleteMember = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently remove ${name}?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== id));
      setActiveDropdown(null);
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member.");
    }
  };

  // Filter members based on search (Now skips member_id search)
  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.mobile_no?.includes(searchQuery)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 font-serif">Member Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and view all registered gym members.</p>
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              {isImporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-4 h-4 text-gray-500" />}
              Import CSV
            </button>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD MEMBER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Add New Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input required type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" placeholder="John Doe" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="tel" value={newMember.mobile_no} onChange={e => setNewMember({...newMember, mobile_no: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" placeholder="9876543210 (Optional)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Join Date</label>
                  <input required type="date" value={newMember.join_date} onChange={e => setNewMember({...newMember, join_date: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" placeholder="john@example.com (Optional)" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Membership Plan</label>
                <select value={newMember.plan} onChange={e => setNewMember({...newMember, plan: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all">
                  <option value="1 MONTH">1 Month Plan</option>
                  <option value="3 MONTHS">3 Months Plan</option>
                  <option value="6 MONTHS">6 Months Plan</option>
                  <option value="1 YEAR">1 Year Plan</option>
                </select>
              </div>

              <div className="pt-4">
                <button disabled={isSubmitting} type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg uppercase tracking-widest text-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? "Adding..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --------------------------- */}

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
                  <td colSpan={5} className="p-10 text-center text-gray-400">Loading members...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">No members found.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    
                    <td className="p-5">
                      <p className="font-bold text-gray-900 mb-1.5">{member.name}</p>
                      <div className="flex items-center gap-2">
                        {/* Dynamic UUID formatting for the badge */}
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {member.id ? `NP-${member.id.substring(0,4).toUpperCase()}` : "N/A"}
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
                      {member.join_date ? new Date(member.join_date).toISOString().split('T')[0] : "N/A"}
                    </td>

                    <td className="p-5">
                      <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> {member.status || "ACTIVE"}
                      </div>
                    </td>

                    <td className="p-5 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === member.id ? null : member.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
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