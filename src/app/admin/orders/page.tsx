import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./orders-client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const allCookies = (await cookies()).getAll();
  console.log("DEBUG AdminOrdersPage - Cookies count:", allCookies.length);
  for (const c of allCookies) {
    console.log("Cookie:", c.name, "=> length:", c.value.length);
  }

  
  // التحقق من صلاحيات المدير
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("DEBUG AdminOrdersPage - User:", user ? "EXISTS" : "NULL", "Error:", userError);

  if (!user) {
    console.log("DEBUG AdminOrdersPage - Redirecting to /login because user is null");
    redirect("/login");
  }

  // جلب الطلبات مع تفاصيل المدرسة وعناصر الطلب وسجل الحالات
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      schools ( name, city, phone ),
      order_items (
        id, quantity, unit_price, line_total,
        books ( title, cover_emoji )
      ),
      order_status_log (
        id, from_status, to_status, timestamp, note
      )
    `)
    .order("order_date", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-6">
        <h2 className="text-xl font-bold mb-2">خطأ في الاتصال بقاعدة البيانات</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1a3a5c" }}>إدارة الطلبات</h1>
          <p className="text-gray-500 mt-1">متابعة ومعالجة جميع طلبات المدارس الواردة</p>
        </div>
      </div>

      <OrdersClient initialOrders={orders as any[]} />
    </div>
  );
}
