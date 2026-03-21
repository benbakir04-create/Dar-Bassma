import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    "https://tafopyitnozfcwrtgumi.supabase.co",
    "sb_publishable_PglQBAFJLrLQaLAfNFlEYA_7-qZ9YyW"
  );
}
