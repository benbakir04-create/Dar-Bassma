import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const url = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceKey = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, serviceKey);

async function fix() {
  const { data: usersInfo } = await supabase.auth.admin.listUsers();
  const existingAdmin = usersInfo.users.find(u => u.email === "admin@darbassma.com" || u.email === "admin@daralgalam.com");
  
  if (existingAdmin) {
    console.log("Found Admin Auth User:", existingAdmin.id);
    const { error } = await supabase.from("users").upsert({
      id: existingAdmin.id,
      role: "admin",
      name: "مدير النظام",
      approved: true
    });
    if (error) console.error("Error upserting:", error);
    else console.log("Admin linked successfully!");
  } else {
    console.log("Admin auth user not found at all.");
  }
}

fix();
