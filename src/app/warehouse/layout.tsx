"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageSearch, LogOut, PackageCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/warehouse/dashboard", icon: <PackageSearch size={20} />, label: "الطلبات الحالية" },
    // Orders history could be added here
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-right dir-rtl font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-emerald-400">
              دار بسمة
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">لوحة المستودع والتجهيز</p>
          </div>
          <PackageCheck className="text-emerald-400" size={28} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 shadow-inner font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
