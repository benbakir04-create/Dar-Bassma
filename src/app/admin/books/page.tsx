import { createClient } from "@/lib/supabase/server";
import BooksClient from "./books-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: books, error: booksError } = await supabase
    .from("books")
    .select(`
      *,
      subjects ( name ),
      levels ( name, stage )
    `)
    .order("created_at", { ascending: false });

  const { data: levels } = await supabase.from("levels").select("*").order("sort_order");
  const { data: subjects } = await supabase.from("subjects").select("*").order("sort_order");

  if (booksError) {
    return <div className="p-8 text-center text-red-500">حدث خطأ في تحميل الكتب: {booksError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">إدارة الكتالوج (الكتب)</h1>
        <p className="text-gray-500 mt-1">أضف واخفِ وعدل جميع الكتب المتوفرة في النظام</p>
      </div>

      <BooksClient 
        initialBooks={books as any[]} 
        levels={levels || []} 
        subjects={subjects || []} 
      />
    </div>
  );
}
