import Link from "next/link";

// الـ middleware.ts يتحقق من الجلسة والصلاحيات قبل الوصول لهذه الصفحة
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4f8" }}>
      {/* الشريط الجانبي */}
      <aside
        className="w-64 flex flex-col shadow-xl"
        style={{ background: "linear-gradient(180deg, #1a3a5c 0%, #2980b9 100%)" }}
      >
        <div className="p-6 border-b border-white/20">
          <div className="text-2xl mb-1">📚</div>
          <h1 className="text-white font-bold text-lg">دار بسمة</h1>
          <p className="text-blue-200 text-xs">لوحة الإدارة</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin/dashboard", icon: "🏠", label: "الرئيسية" },
            { href: "/admin/orders",    icon: "📋", label: "الطلبات" },
            { href: "/admin/books",     icon: "📖", label: "الكتب" },
            { href: "/admin/schools",   icon: "🏫", label: "المدارس" },
            { href: "/admin/inventory", icon: "📦", label: "المخزون" },
            { href: "/admin/reports",   icon: "📊", label: "التقارير" },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              م
            </div>
            <div>
              <p className="text-white text-sm font-semibold">مدير النظام</p>
              <p className="text-blue-300 text-xs">admin@darbassma.com</p>
            </div>
          </div>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 text-red-300 hover:text-red-100 text-sm transition-colors"
          >
            <span>🚪</span> تسجيل الخروج
          </a>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
