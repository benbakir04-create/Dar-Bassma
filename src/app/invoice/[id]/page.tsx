import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PrintClient from "./print-client";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch Order
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      schools ( name, city, address, phone, contact_person, registration_no, email )
    `)
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return <div className="p-8 text-center font-bold text-red-500">الطلب غير موجود</div>;
  }

  // Fetch Order Items
  const { data: items } = await supabase
    .from("order_items")
    .select(`
      *,
      books ( title, price )
    `)
    .eq("order_id", params.id);

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white flex justify-center dir-rtl font-sans">
      <PrintClient order={order} items={items || []} />
    </div>
  );
}
