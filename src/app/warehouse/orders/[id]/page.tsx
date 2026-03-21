import { createClient } from "@/lib/supabase/server";
import OrderProcessingClient from "./order-processing-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WarehouseOrderProcessingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      schools ( name, city, address, phone, contact_person )
    `)
    .eq("id", params.id)
    .single();

  if (orderError || !order) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل الطلب أو الطلب غير موجود.</div>;
  }

  // Fetch Order Items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      id,
      quantity,
      unit_price,
      total_price,
      book_id,
      books ( id, title, cover_emoji )
    `)
    .eq("order_id", params.id);

  if (itemsError) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل تفاصيل الكتب.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/warehouse/dashboard" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800">تجهيز الطلب #{(order as any).id.split("-")[0]}</h1>
          <p className="text-slate-500 mt-1">المدرسة: <span className="font-bold text-slate-700">{(order as any).schools?.name}</span></p>
        </div>
      </div>

      <OrderProcessingClient order={order as any} items={items || []} />
    </div>
  );
}
