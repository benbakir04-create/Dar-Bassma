import type { OrderStatus } from "@/types/database.types";
import clsx from "clsx";
import { Check, Clock, Package, Truck, XCircle, Home } from "lucide-react";

export const ORDER_STEPS = [
  { id: "pending", label: "قيد المراجعة", icon: Clock },
  { id: "approved", label: "تمت الموافقة", icon: Check },
  { id: "preparing", label: "جاري التجهيز", icon: Package },
  { id: "ready", label: "جاهز للشحن", icon: Package },
  { id: "out_for_delivery", label: "في الطريق", icon: Truck },
  { id: "delivered", label: "تم التسليم", icon: Home },
];

export default function OrderTracker({ status, deliveryType }: { status: OrderStatus, deliveryType: "delivery" | "pickup" }) {
  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-danger font-bold bg-red-50 p-4 rounded-xl border border-red-200">
        <XCircle size={20} />
        {status === "rejected" ? "تم رفض الطلب من الإدارة" : "تم إلغاء الطلب"}
      </div>
    );
  }

  // إذا استلام من الفرع، نتخطى خطوة "في الطريق"
  let steps = ORDER_STEPS;
  if (deliveryType === "pickup") {
    steps = steps.filter(s => s.id !== "out_for_delivery");
  }

  const currentIndex = steps.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 && status === "delivered" ? steps.length - 1 : currentIndex;

  return (
    <div className="w-full">
      <div className="flex justify-between relative">
        {/* الخط الخلفي */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* الخط الملون المكتمل */}
        <div 
          className="absolute top-5 right-8 h-1 bg-primary -z-10 rounded-full transition-all duration-500" 
          style={{ width: `calc(${(Math.max(0, activeIndex) / (steps.length - 1)) * 100}% - 4rem)` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 w-20">
              <div 
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-4 transition-colors",
                  isCompleted ? "bg-primary border-blue-100" : "bg-gray-200 border-white text-gray-400"
                )}
                style={{
                  boxShadow: isCurrent ? "0 0 0 4px rgba(41, 128, 185, 0.2)" : "none"
                }}
              >
                <Icon size={18} />
              </div>
              <span className={clsx(
                "text-xs font-bold text-center",
                isCurrent ? "text-primary" : isCompleted ? "text-gray-700" : "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
