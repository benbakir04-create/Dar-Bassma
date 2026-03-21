"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function finishOrder(orderId: string, orderItems: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  // 1. Update order status to 'ready'
  const { error: updateError } = await supabase
    .from("orders")
    // @ts-ignore
    .update({ 
      status: "ready", // الجاهز للاستلام أو الشحن
    } as any)
    .eq("id", orderId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 2. Add log entry
  // @ts-ignore
  await supabase.from("order_status_log").insert([{
    order_id: orderId,
    from_status: "preparing",
    to_status: "ready",
    changed_by: user.id,
    note: "تم تجهيز الطلب بالكامل ومراجعة الكميات"
  } as any]);

  // 3. Deduct Inventory for each item
  // To avoid race conditions, we should ideally use RPC. 
  // For now, we fetch current, then update.
  for (const item of orderItems) {
    const { data: invData } = await supabase
      .from("inventory")
      .select("*")
      .eq("book_id", item.book_id)
      .single()

    if (invData) {
      const newAvailable = Math.max(0, (invData as any).quantity_available - item.quantity);
      const newDelivered = (invData as any).quantity_delivered + item.quantity;
      
      await supabase
        .from("inventory")
        // @ts-ignore
        .update({
          quantity_available: newAvailable,
          quantity_delivered: newDelivered
        } as any)
        .eq("book_id", item.book_id)
    }
  }
  
  revalidatePath("/warehouse/dashboard")
  redirect("/warehouse/dashboard") // Back to warehouse home
}
