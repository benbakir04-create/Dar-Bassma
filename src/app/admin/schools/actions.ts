"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSchool(schoolData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  try {
    const { data, error } = await supabase
      .from("schools")
      // @ts-ignore
      .insert([schoolData as any])
      .select();

    if (error) throw error;
    
    revalidatePath("/admin/schools")
    return { success: true, data: data as any[] }
  } catch (err: any) {
    console.error("Error creating school:", err)
    return { success: false, error: err.message || "حدث خطأ أثناء إضافة المدرسة" }
  }
}

export async function updateSchool(id: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "غير مصرح" }

  try {
    const { error } = await supabase
      .from("schools")
      // @ts-ignore
      .update(updates as any)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/schools")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "حدث خطأ أثناء تعديل المدرسة" }
  }
}

export async function toggleSchoolActive(id: string, currentStatus: boolean) {
  return updateSchool(id, { active: !currentStatus });
}
