"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateInventoryQuantity(bookId: string, newAvailableQty: number, note: string = "تعديل يدوي من الإدارة") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "غير مصرح" }

  // 1. Get current inventory
  const { data: currentInv, error: fetchErr } = await supabase
    .from("inventory")
    .select("quantity_available")
    .eq("book_id", bookId)
    .single()

  if (fetchErr) return { success: false, error: fetchErr.message }

  const diff = newAvailableQty - (currentInv as any).quantity_available

  // 2. Update inventory
  const { error: updateErr } = await supabase
    .from("inventory")
    // @ts-ignore
    .update({ quantity_available: newAvailableQty } as any)
    .eq("book_id", bookId)

  if (updateErr) return { success: false, error: updateErr.message }

  // 3. Log the change (For a production system, we'd have an inventory_logs table.
  // For now, we rely on the direct update since it's a simple system. 
  // In the future, inserting into `inventory_logs` goes here).

  revalidatePath("/admin/inventory")
  return { success: true }
}
