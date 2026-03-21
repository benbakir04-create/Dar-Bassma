import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InventoryClient from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all books and their inventory
  // We use books as the main table, joining inventory
  const { data: inventoryData, error } = await supabase
    .from("books")
    .select(`
      id,
      title,
      price,
      cover_emoji,
      inventory ( book_id, quantity_available, quantity_delivered )
    `)
    .eq("active", true)
    .order("title");

  if (error) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل بيانات الجرد: {error.message}</div>;
  }

  // Calculate reserved quantities (Optionally, we can fetch pending/approved order items)
  // To keep it perfectly accurate, we fetch all order items that are in 'approved' or 'preparing' state
  const { data: pendingItems } = await supabase
    .from("order_items")
    .select(`
      quantity,
      book_id,
      orders!inner ( status )
    `)
    .in("orders.status", ["approved", "preparing"]);

  // Group pending by book_id
  const reservedMap: Record<string, number> = {};
  if (pendingItems) {
    (pendingItems as any[]).forEach(item => {
      reservedMap[item.book_id] = (reservedMap[item.book_id] || 0) + item.quantity;
    });
  }

  // Combine data
  const enrichedData = (inventoryData as any[]).map(book => {
    const inv = book.inventory?.[0] || book.inventory || { book_id: book.id, quantity_available: 0, quantity_delivered: 0 };
    return {
      book_id: book.id,
      title: book.title,
      cover_emoji: book.cover_emoji,
      price: book.price,
      available: inv.quantity_available || 0,
      delivered: inv.quantity_delivered || 0,
      reserved: reservedMap[book.id] || 0
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-800">جرد المخزون</h1>
        <p className="text-slate-500 mt-2">راقب أرصدة الكتب، الكميات المحجوزة للطلبات، والمباعة فعلياً.</p>
      </div>

      <InventoryClient initialData={enrichedData} />
    </div>
  );
}
