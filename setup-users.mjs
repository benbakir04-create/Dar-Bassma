import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// قراءة مفاتيح السيرفر القوية لإنشاء الحسابات وتجاوز الحماية
const envLocal = fs.readFileSync(".env.local", "utf8");
const url = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const serviceKey = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("جاري إنشاء الحسابات بكلمات مرور مضمونة...");

  try {
    // 1. حساب الإدارة
    const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
      email: "admin@darbassma.com",
      password: "Admin123!",
      email_confirm: true,
    });

    if (adminUser?.user) {
      await supabase.from("users").upsert({
        id: adminUser.user.id,
        role: "admin",
        name: "مدير النظام",
        approved: true,
      });
      console.log("✅ حساب الإدارة: admin@darbassma.com / Admin123!");
    } else if (adminErr?.message?.includes("already registered")) {
        console.log("حساب الإدارة موجود مسبقاً، سأقوم بتحديث كلمة المرور...");
        // استخرج المستخدم وتحديث الباسورد
        const { data: usersInfo } = await supabase.auth.admin.listUsers();
        const existingAdmin = usersInfo.users.find(u => u.email === "admin@darbassma.com" || u.email === "admin@daralgalam.com");
        if(existingAdmin) {
            await supabase.auth.admin.updateUserById(existingAdmin.id, { password: "Admin123!" });
            await supabase.from("users").upsert({ id: existingAdmin.id, role: "admin", name: "مدير النظام", approved: true });
            console.log(`✅ حساب الإدارة المحدث: ${existingAdmin.email} / Admin123!`);
        }
    } else {
        console.log("⚠️ فشل الإدارة:", adminErr);
    }

    // 2. حساب المدرسة العينة
    const { data: schoolRes } = await supabase
      .from("schools")
      .insert({
        name: "مدرسة الأنوار الأهلية",
        city: "الرياض",
        contact_person: "أ. محمد",
        phone: "0500000000",
      })
      .select()
      .single();

    if (schoolRes) {
      const { data: schoolUser, error: schoolErr } = await supabase.auth.admin.createUser({
        email: "school@darbassma.com",
        password: "School123!",
        email_confirm: true,
      });

      if (schoolUser?.user) {
        await supabase.from("users").upsert({
          id: schoolUser.user.id,
          role: "school",
          name: "مدير مشتريات المدرسة",
          linked_id: schoolRes.id,
          approved: true,
        });
        console.log("✅ حساب المدرسة العينة: school@darbassma.com / School123!");
      } else if (schoolErr?.message?.includes("already registered")) {
        const { data: usersInfo } = await supabase.auth.admin.listUsers();
        const existingSchool = usersInfo.users.find(u => u.email === "school@darbassma.com");
        if(existingSchool) {
            await supabase.auth.admin.updateUserById(existingSchool.id, { password: "School123!" });
            await supabase.from("users").upsert({ id: existingSchool.id, role: "school", name: "المدرسة", linked_id: schoolRes.id, approved: true });
            console.log("✅ تم تحديث حساب المدرسة: school@darbassma.com / School123!");
        }
      }
    }

  } catch (err) {
    console.error("حدث خطأ غير متوقع", err);
  }
}

main();
