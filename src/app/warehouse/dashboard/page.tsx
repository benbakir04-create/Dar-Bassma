import { createClient } from "@/lib/supabase/server";
import WarehouseDashboardClient from "./warehouse-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WarehouseDashboardPage() {
  const supabase = await createClient();
  
  // التحقق من الصلاحيات
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch pending fulfillment orders (approved or preparing)
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      schools ( name, city )
    `)
    .in("status", ["approved", "preparing"])
    .order("status", { ascending: true }) // approved first (needs to be picked)
    .order("order_date", { ascending: true }); // older first

  if (error) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل بيانات المستودع: {error.message}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-800">الطلبات المعتمدة للتجهيز</h1>
        <p className="text-slate-500 mt-2">اختر طلباً للبدء في تجميعه وتجهيزه للتسليم</p>
      </div>

      <WarehouseDashboardClient orders={orders as any[]} />
    </div>
  );
}
