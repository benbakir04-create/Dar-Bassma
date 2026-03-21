import { createClient } from "@/lib/supabase/server";
import PackagesClient from "./packages-client";
import type { Package, Book } from "@/types/database.types";

export type PackageWithDetails = Package & {
  package_books: {
    quantity: number;
    books: Book | null;
  }[];
  levels: { name: string } | null;
};

export default async function PackagesPage() {
  const supabase = await createClient();

  const { data: packages, error } = await supabase
    .from("packages")
    .select(`
      *,
      levels (name),
      package_books (
        quantity,
        books (id, title, price, cover_emoji)
      )
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-8 text-center text-danger bg-red-50 rounded-xl">خطأ في جلب الحزم: {error.message}</div>;
  }

  return <PackagesClient packages={packages as unknown as PackageWithDetails[]} />;
}
