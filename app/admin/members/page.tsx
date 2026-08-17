"use client";

import { Search, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .order("id", { ascending: false }); // Sorts by newest first

        if (error) throw error;
        
        if (data) {
          setMembers(data);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  // Functional search filter for Name, Email, or ID
  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.id?.toString().includes(searchQuery)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">MEMBER DIRECTORY</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and view all registered gym members.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:border-logo text-sm text-gray-900 placeholder:text-gray-500 transition-colors" 
          />
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Member Info</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading directory...
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  // Fallbacks for dynamic formatting
                  const displayId = member.id ? (typeof member.id === 'string' && member.id.startsWith('NP-') ? member.id : `NP-${String(member.id).substring(0,4).toUpperCase()}`) : "NP-NEW";
                  const displayPlan = member.plan_type || member.plan || "Standard";
                  const displayStatus = member.status || "Active";
                  const isStatusActive = displayStatus.toLowerCase() === "active";
                  const joinedDate = member.joined_date || member.join_date;
                  const displayDate = joinedDate ? new Date(joinedDate).toLocaleDateString('en-CA') : "N/A"; 

                  return (
                    <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-gray-100 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-gray-900">{member.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded">{displayId}</div>
                          <div className="text-[10px] text-logo/70 font-bold uppercase tracking-wider">{displayPlan}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-600">{member.email || "No email"}</div>
                        <div className="text-gray-500 text-xs mt-1">{member.mobile_no || member.phone || "No phone"}</div>
                      </td>
                      <td className="py-4 font-medium text-gray-500">{displayDate}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          isStatusActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-logo/90/10 text-logo/70 border-logo/90/20"
                        }`}>
                          {isStatusActive ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4"/>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}