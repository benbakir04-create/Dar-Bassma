import { createClient } from "@/lib/supabase/server";
import CatalogClient from "./catalog-client";
import type { Book } from "@/types/database.types";

export type BookWithInventory = Book & {
  inventory: { quantity_available: number }[];
  subjects: { name: string } | null;
  levels: { name: string } | null;
};

export default async function CatalogPage() {
  const supabase = await createClient();

  // جلب الكتب مع معلومات المخزن والمادة والمستوى
  const { data: books, error } = await supabase
    .from("books")
    .select(`
      *,
      inventory ( quantity_available ),
      subjects ( name ),
      levels ( name )
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
        خطأ في جلب البيانات: {error.message}
      </div>
    );
  }

  return <CatalogClient books={books as unknown as BookWithInventory[]} />;
}
