"use client";

import { Search, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const memberDetailsData = [
  { id: "NP-1042", name: "Yagna Bhatt", email: "yagna@example.com", phone: "+91 98765 43210", joined: "2025-01-15", status: "Active", plan: "Premium Yearly" },
  { id: "NP-1043", name: "Nishit Champaneria", email: "nishit@example.com", phone: "+91 87654 32109", joined: "2025-02-20", status: "Active", plan: "Monthly Basic" },
  { id: "NP-1044", name: "Moksh Chavada", email: "moksh@example.com", phone: "+91 76543 21098", joined: "2024-11-05", status: "Expired", plan: "Cardio Special" },
  { id: "NP-1045", name: "Heer Desai", email: "heer@example.com", phone: "+91 65432 10987", joined: "2025-03-01", status: "Active", plan: "Premium Yearly" },
];

export default function MembersPage() {
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
          <input type="text" placeholder="Search members..." className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 focus:outline-none focus:border-logo text-sm text-gray-900 placeholder:text-gray-500 transition-colors" />
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
              {memberDetailsData.map((member) => (
                <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-gray-100 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-gray-900">{member.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded">{member.id}</div>
                      <div className="text-[10px] text-logo/70 font-bold uppercase tracking-wider">{member.plan}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-gray-600">{member.email}</div>
                    <div className="text-gray-500 text-xs mt-1">{member.phone}</div>
                  </td>
                  <td className="py-4 font-medium text-gray-500">{member.joined}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      member.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-logo/90/10 text-logo/70 border-logo/90/20"
                    }`}>
                      {member.status === "Active" ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                      <MoreVertical className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}