"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function startPreparingOrder(orderId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  if (currentStatus === "approved") {
    // تحديث حالة الطلب إلى جاري التجهيز وتسجيل من يقوم بالتجهيز
    const { error } = await supabase
      .from("orders")
      // @ts-ignore
      .update({ 
        status: "preparing",
        warehouse_user_id: user.id
      } as any)
      .eq("id", orderId)

    if (error) {
      return { success: false, error: error.message }
    }
    
    // إضافة سجل حالة جديد (Log)
    // @ts-ignore
    await supabase.from("order_status_log").insert([{
      order_id: orderId,
      from_status: "approved",
      to_status: "preparing",
      changed_by: user.id,
      note: "بدء تجهيز الطلب في المستودع"
    } as any]);
  }
  
  revalidatePath("/warehouse/dashboard")
  redirect(`/warehouse/orders/${orderId}`)
}
