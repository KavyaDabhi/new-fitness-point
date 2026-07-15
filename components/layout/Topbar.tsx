"use client";

import { usePathname } from "next/navigation";
import { User } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    switch (pathname) {
      case "/": return "Overview";
      case "/members": return "Members";
      case "/attendance": return "Attendance";
      case "/plans": return "Plans";
      default: return "Dashboard";
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#1A1A1A]">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] cursor-pointer hover:shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-shadow">
          <User className="w-5 h-5 text-[#1A1A1A]" />
        </div>
      </div>
    </header>
  );
}