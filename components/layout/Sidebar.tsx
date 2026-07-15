"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, ClipboardList, Dumbbell } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/members", label: "Members", icon: Users },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/plans", label: "Plans", icon: ClipboardList },
  ];

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-[#FF6B00] flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-[#FFFFFF]" />
          </div>
          <span className="text-[#1A1A1A] font-bold text-lg tracking-tight uppercase">Apex Pulse</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-[8px] transition-colors ${
                isActive 
                  ? "bg-[#F8F9FA] text-[#FF6B00]" 
                  : "text-[#1A1A1A] hover:bg-[#F8F9FA]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#FF6B00]" : "text-[#00D4FF]"}`} />
              <span className="text-[12px] font-semibold leading-[16px] tracking-[0.05em] uppercase">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}