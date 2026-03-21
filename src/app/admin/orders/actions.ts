"use server"

import { createClient } from "@/lib/supabase/server"
import type { OrderStatus } from "@/types/database.types"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderIds: string[], newStatus: OrderStatus, note?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  try {
    // For each order, we need to update the status and insert a log
    for (const orderId of orderIds) {
      // Fetch current status
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();
        
      if (!currentOrder) continue;

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        // @ts-ignore
        .update({ status: newStatus } as any)
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Insert into order_status_log
      // @ts-ignore
      await supabase
        .from("order_status_log")
        .insert({
          order_id: orderId,
          from_status: (currentOrder as any).status,
          to_status: newStatus,
          changed_by: user.id,
          note: note || (orderIds.length > 1 ? "تعديل حالة جماعي" : null)
        } as any);
    }

    revalidatePath("/admin/orders")
    return { success: true }
  } catch (err: any) {
    console.error("Error updating orders:", err)
    return { success: false, error: err.message || "حدث خطأ أثناء تحديث حالة الطلبات" }
  }
}
