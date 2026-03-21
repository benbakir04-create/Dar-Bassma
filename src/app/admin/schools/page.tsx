import { createClient } from "@/lib/supabase/server";
import SchoolsClient from "./schools-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all schools
  const { data: schools, error: schoolsError } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch school users (to see if a school has a linked account)
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name, email:id, linked_id, active") // note: users table doesn't have email natively exposed here unless joined, but we have linked_id
    .eq("role", "school");

  if (schoolsError) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل بيانات المدارس: {schoolsError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">إدارة المدارس</h1>
        <p className="text-gray-500 mt-1">إضافة مدارس جديدة، إعداد حدود الائتمان، ومتابعة الأرصدة</p>
      </div>

      <SchoolsClient 
        initialSchools={schools as any[]} 
        schoolUsers={users || []} 
      />
    </div>
  );
}
