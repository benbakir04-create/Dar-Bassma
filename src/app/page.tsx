import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/auth";

// الصفحة الجذر — توجّه المستخدم لصفحته حسب دوره
export default async function RootPage() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.profile.role as keyof typeof ROLE_HOME]);
  }
  redirect("/login");
}
