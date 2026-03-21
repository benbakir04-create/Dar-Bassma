"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBook(bookData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  try {
    const { data, error } = await supabase
      .from("books")
      // @ts-ignore
      .insert([bookData as any])
      .select();

    if (error) throw error;
    
    // Create initial inventory for the new book
    if (data && data[0]) {
      // @ts-ignore
      await supabase.from("inventory").insert([{
        book_id: (data[0] as any).id,
        quantity_available: 0,
        quantity_reserved: 0,
        quantity_delivered: 0
      } as any]);
    }

    revalidatePath("/admin/books")
    return { success: true, data: data as any[] }
  } catch (err: any) {
    console.error("Error creating book:", err)
    return { success: false, error: err.message || "حدث خطأ" }
  }
}

export async function updateBook(id: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  try {
    const { error } = await supabase
      .from("books")
      // @ts-ignore
      .update(updates as any)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/books")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ" }
  }
}

export async function toggleBookActive(id: string, currentStatus: boolean) {
  return updateBook(id, { active: !currentStatus });
}
