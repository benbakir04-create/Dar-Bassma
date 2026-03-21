import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const url = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const anonKey = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Testing Login with Anon Key...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@darbassma.com",
    password: "Admin123!",
  });

  if (error) {
    console.error("Login Failed:", error.message);
  } else {
    console.log("Login Success!", data.user.id);
    
    // Test if user exists in the `users` table
    const { data: profile, error: profileErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id);
      
    if (profileErr) {
      console.error("Profile Failed:", profileErr.message);
    } else {
      console.log("Profile Found:", profile);
    }
  }
}

main();
