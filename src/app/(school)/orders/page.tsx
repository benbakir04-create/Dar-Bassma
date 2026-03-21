import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import OrderTracker from "@/components/order-tracker";
import { FileText, Calendar, Truck } from "lucide-react";
import type { OrderWithDetails } from "@/types/database.types";

export default async function SchoolOrdersPage() {
  const session = await requireRole("school");
  const schoolId = session.profile.linked_id;

  if (!schoolId) {
    return <div className="p-8 text-center text-danger">لم يتم ربط حسابك بأي مدرسة! لا يمكنك عرض الطلبات.</div>;
  }

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*, books (*)),
      schools (*)
    `)
    .eq("school_id", schoolId)
    .order("order_date", { ascending: false });

  if (error) {
    return <div className="p-8 text-center text-danger">خطأ في جلب الطلبات</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-pending">قيد المراجعة</span>;
      case "approved": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-approved">معتمد</span>;
      case "preparing": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-preparing">جاري التجهيز</span>;
      case "ready": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-ready">جاهز</span>;
      case "out_for_delivery": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-out_for_delivery">في الطريق</span>;
      case "delivered": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-delivered">تم التسليم</span>;
      case "cancelled": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-cancelled">ملغى</span>;
      case "rejected": return <span className="px-3 py-1 rounded-full text-xs font-bold badge-rejected">مرفوض</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">طلباتي</h1>
        <p className="text-sm text-gray-500 mt-1">تتبع حالة طلباتك ورصيد حسابك</p>
      </div>

      {orders?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-700">لا توجد طلبات سابقة</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(orders as unknown as OrderWithDetails[]).map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
              
              {/* هيدر الطلب */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-primary">طلب #{order.id.split("-")[0].toUpperCase()}</h2>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.order_date ?? "").toLocaleDateString("ar-SA")}</span>
                    <span className="flex items-center gap-1"><Truck size={14}/> {order.delivery_type === "delivery" ? "توصيل للفرع" : "استلام من المستودع"}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-primary">{order.total_amount?.toFixed(2)} ر.س</div>
                  <div className="text-sm text-gray-400">شامل الضريبة</div>
                </div>
              </div>

              {/* التتبع */}
              <div className="py-4 bg-gray-50 rounded-xl px-4 border border-gray-100">
                <OrderTracker status={order.status} deliveryType={order.delivery_type as any} />
              </div>

              {/* الكتب المطلوبة والفواتير */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <h3 className="font-bold text-sm text-gray-600 mb-2">محتويات الطلب:</h3>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity} × {item.books?.title}</span>
                      <span className="font-semibold text-gray-600">{(item.quantity * item.unit_price).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
                
                <div className="md:w-64 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-r pt-4 md:pt-0 pl-0 md:pl-4 border-gray-100">
                  <button className="flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-primary/5 py-2 rounded-lg font-bold transition-colors w-full text-sm">
                    <FileText size={16} /> الفاتورة المبدئية
                  </button>
                  {order.status === "delivered" && (
                    <button className="flex items-center justify-center gap-2 bg-primary text-white hover:bg-secondary py-2 rounded-lg font-bold transition-colors w-full text-sm">
                      <FileText size={16} /> الفاتورة النهائية
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
