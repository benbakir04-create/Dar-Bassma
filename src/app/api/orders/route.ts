import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.profile.role !== "school") {
      return NextResponse.json({ success: false, message: "غير مصرح لك بإجراء طلب" }, { status: 401 });
    }

    const body = await req.json();
    const { items, delivery_type } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "السلة فارغة" }, { status: 400 });
    }

    const supabase = await createClient();

    // حساب الإجمالي مع ضريبة 15%
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal * 1.15;

    // 1. إنشاء الطلب الأساسي
    const { data: order, error: orderError } = await supabase
      .from("orders")
      // @ts-ignore
      .insert({
        school_id: session.profile.linked_id,
        created_by: session.profile.id,
        total_amount: totalAmount,
        status: "pending",
        delivery_type: delivery_type || "delivery"
      } as any)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. إدراج مفردات الطلب
    const orderItems = items.map((item: any) => ({
      order_id: (order as any).id,
      book_id: item.book_id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      // @ts-ignore
      .insert(orderItems as any);

    if (itemsError) {
      // إذا فشل الإدراج نحذف الطلب الأساسي (تعويض عن غياب Transaction معقد)
      await supabase.from("orders").delete().eq("id", (order as any).id);
      throw itemsError;
    }

    // 3. تسجيل الحدث في سجل الحالات
    // @ts-ignore
    await supabase.from("order_status_log").insert({
      order_id: (order as any).id,
      status: "pending",
      changed_by: session.profile.id,
      notes: "تم إنشاء الطلب آلياً من بوابة المدرسة"
    } as any);

    return NextResponse.json({ success: true, data: order });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, message: "فشل إنشاء الطلب: " + error.message }, { status: 500 });
  }
}
