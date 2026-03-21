import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: ordersCount },
    { count: schoolsCount },
    { count: booksCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, status, created_at, schools(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "إجمالي الطلبات", value: ordersCount ?? 0,   icon: "📋", color: "#2980b9" },
    { label: "المدارس المسجلة", value: schoolsCount ?? 0, icon: "🏫", color: "#27ae60" },
    { label: "الكتب في الكتالوج", value: booksCount ?? 0, icon: "📖", color: "#8e44ad" },
  ];

  const statusLabel: Record<string, string> = {
    pending:    "قيد الانتظار",
    approved:   "موافق عليه",
    processing: "جارٍ التجهيز",
    shipped:    "تم الشحن",
    delivered:  "تم التسليم",
  };

  const statusColor: Record<string, string> = {
    pending:    "#f39c12",
    approved:   "#27ae60",
    processing: "#2980b9",
    shipped:    "#8e44ad",
    delivered:  "#1abc9c",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#1a3a5c" }}>لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في نظام دار بسمة للنشر التعليمي</p>
      </div>

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-4xl font-bold mt-1" style={{ color }}>{value}</p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `${color}18` }}
              >
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* الطلبات الأخيرة */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg" style={{ color: "#1a3a5c" }}>
            آخر الطلبات
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    {(order.schools as any)?.name ?? "مدرسة غير معروفة"}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: statusColor[order.status] ?? "#95a5a6" }}
                >
                  {statusLabel[order.status] ?? order.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-400">
              لا توجد طلبات بعد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
