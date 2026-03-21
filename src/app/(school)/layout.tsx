import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { LogOut, BookOpen, Package, ShoppingBag } from "lucide-react";

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("school");

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <h1 className="font-bold text-xl text-primary">دار بسمة</h1>
              <p className="text-xs text-gray-500">بوابة المدارس ({session.profile.name})</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/school/catalog" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium">
              <BookOpen size={18} /> الكتالوج
            </Link>
            <Link href="/school/packages" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium">
              <Package size={18} /> الحزم الجاهزة
            </Link>
            <Link href="/school/orders" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium">
              <ShoppingBag size={18} /> طلباتي
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <form action="/api/auth/signout" method="POST">
              <button className="flex items-center gap-2 text-danger hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-semibold">
                <LogOut size={18} /> تسجيل خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {children}
      </main>
    </div>
  );
}
