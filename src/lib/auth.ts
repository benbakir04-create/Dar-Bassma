import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole, User } from "@/types/database.types";

/** تُعيد الجلسة والملف الشخصي للمستخدم المسجّل */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  console.log("Auth User:", user?.email, "Profile:", profile);

  if (!profile) return null;

  return { user, profile: profile as unknown as User };
}

/** تتحقق من الدور وتُعيد المستخدم أو تُوجِّه للدخول */
export async function requireRole(role: UserRole | UserRole[]) {
  const session = await getSession();

  if (!session) redirect("/login");

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes((session.profile as any).role as UserRole)) redirect("/login");

  return session;
}

/** تُسجِّل خروج المستخدم */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** تعيين خريطة الأدوار والصفحات */
export const ROLE_HOME: Record<UserRole, string> = {
  admin:     "/admin/dashboard",
  school:    "/school/catalog",
  warehouse: "/warehouse/dashboard",
  delivery:  "/delivery/shipments",
};
