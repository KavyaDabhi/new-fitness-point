"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Home, Users, CalendarCheck, Dumbbell, CreditCard, FileText, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/login");
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-900">Loading secure environment...</div>;
  }

  const navLinks = [
    { href: "/admin", label: "Overview", icon: Home },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/admin/plans", label: "Plans", icon: FileText },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-900 overflow-hidden selection:bg-logo selection:text-gray-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1">
            <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="object-contain mix-blend-multiply" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 leading-tight uppercase tracking-tight text-sm">New Fitness</h1>
            <p className="text-[10px] text-logo/90 font-bold uppercase tracking-wider">Admin Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-logo text-gray-900 shadow-lg" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <link.icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-logo overflow-hidden border-2 border-logo/60 shrink-0">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">System Admin</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-logo/70 hover:bg-logo/90/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search members, payments..." 
              className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-logo transition-all placeholder:text-gray-500"
            />
          </div>
        </header>
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
           {/* Subtle background glow effect */}
           
           <div className="relative z-10 w-full max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
}