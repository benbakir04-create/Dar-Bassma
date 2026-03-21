import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Aggregate order stats per status
  const { data: allOrders } = await supabase
    .from("orders")
    .select("status, total_amount, order_date");

  // 2. Top Books (most ordered)
  const { data: topBooksRaw } = await supabase
    .from("order_items")
    .select(`
      book_id,
      quantity,
      books ( title, cover_emoji )
    `);

  // 3. Top Schools (by total amount)
  const { data: topSchoolsRaw } = await supabase
    .from("orders")
    .select(`
      school_id,
      total_amount,
      status,
      schools ( name )
    `)
    .not("status", "in", "(rejected,cancelled)");

  // --- Process: Orders Summary ---
  const ordersList = (allOrders as any[]) || [];
  const completedOrders = ordersList.filter(o => o.status === "delivered");
  const pendingOrders   = ordersList.filter(o => !["delivered","rejected","cancelled"].includes(o.status));
  const totalRevenue    = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingAmount   = pendingOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // --- Process: Top Books ---
  const bookMap: Record<string, { title: string; emoji: string; qty: number }> = {};
  (topBooksRaw as any[] || []).forEach((item) => {
    const key = item.book_id;
    if (!bookMap[key]) bookMap[key] = { title: item.books?.title, emoji: item.books?.cover_emoji, qty: 0 };
    bookMap[key].qty += item.quantity;
  });
  const topBooks = Object.values(bookMap).sort((a,b) => b.qty - a.qty).slice(0, 7);

  // --- Process: Top Schools ---
  const schoolMap: Record<string, { name: string; total: number; count: number }> = {};
  (topSchoolsRaw as any[] || []).forEach((o) => {
    const key = o.school_id;
    if (!schoolMap[key]) schoolMap[key] = { name: o.schools?.name || "مجهول", total: 0, count: 0 };
    schoolMap[key].total += o.total_amount;
    schoolMap[key].count += 1;
  });
  const topSchools = Object.values(schoolMap).sort((a,b) => b.total - a.total).slice(0, 7);

  // --- Process: Monthly Trend (last 6 months) ---
  const now = new Date();
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("ar-SA", { month: "long", year: "2-digit" });
    const monthlyTotal = ordersList
      .filter(o => {
        const od = new Date(o.order_date);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      })
      .reduce((sum, o) => sum + o.total_amount, 0);
    months.push({ label, total: monthlyTotal });
  }

  const reportData = {
    summary: {
      totalOrders: allOrders?.length || 0,
      completedOrders: completedOrders.length,
      totalRevenue,
      pendingAmount,
    },
    topBooks,
    topSchools,
    monthlyTrend: months,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-800">التقارير والإحصائيات</h1>
        <p className="text-slate-500 mt-2">نظرة شاملة على أداء دار النشر، المبيعات، والكتب الأكثر طلباً.</p>
      </div>
      <ReportsClient data={reportData} />
    </div>
  );
}
