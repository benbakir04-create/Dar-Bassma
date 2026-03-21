"use client"

import { useState } from "react";
import { CheckCircle2, Circle, Truck, PackageCheck, AlertCircle } from "lucide-react";
import { finishOrder } from "./actions";

export default function OrderProcessingClient({ order, items }: { order: any, items: any[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllChecked = checkedItems.size === items.length && items.length > 0;
  const isAlreadyFinished = order.status === "ready" || order.status === "delivered";

  const toggleCheck = (itemId: string) => {
    if (isAlreadyFinished) return;
    
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleFinish = async () => {
    if (!isAllChecked) return;
    setIsSubmitting(true);
    
    const res = await finishOrder(order.id, items);
    if (res?.error) {
      alert(res.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      
      {/* القسم الأيمن - تفاصيل المدرسة */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
            <Truck size={20} className="text-primary" /> تفاصيل التسليم
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1 font-bold">المدرسة</p>
              <p className="text-slate-800 text-base">{order.schools?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1 font-bold">المدينة والعنوان</p>
              <p className="text-slate-800">{order.schools?.city} - {order.schools?.address || "غير مسجل"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1 font-bold">مسؤول الاستلام</p>
              <p className="text-slate-800">{order.schools?.contact_person || "غير مسجل"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1 font-bold">الجوال</p>
              <p className="text-slate-800 dir-ltr text-right">{order.schools?.phone || "غير مسجل"}</p>
            </div>
            
            <div className={`mt-6 p-4 rounded-xl border ${isAlreadyFinished ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`font-bold text-center ${isAlreadyFinished ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isAlreadyFinished ? "الطلب مجهز ومكتمل ✅" : "حالة الطلب: جاري التجهيز ⏳"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* القسم الأيسر - قائمة التحقق (الكتب) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PackageCheck size={20} className="text-primary" /> الكتب المطلوبة للجمع
            </h2>
            <p className="text-sm text-gray-500 mt-1">امسح أو تحقق من كل كتاب وضعه في الكرتون، ثم قم بالتأشير عليه أدناه.</p>
          </div>
          
          <div className="flex-1 p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {items.map((item, index) => {
              const checked = checkedItems.has(item.id) || isAlreadyFinished;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                    ${checked 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-gray-100 hover:border-blue-200 bg-white shadow-sm'
                    } ${isAlreadyFinished ? 'pointer-events-none opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl bg-white w-14 h-14 rounded-xl shadow-sm border border-gray-50 flex items-center justify-center">
                      {item.books?.cover_emoji || '📘'}
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${checked ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {item.books?.title}
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        السعر الوحدة: {item.unit_price} ر.س
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold mb-1">الكمية المطلوبة</p>
                      <span className="inline-block bg-slate-800 text-white font-black text-xl px-4 py-1 rounded-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="w-8">
                      {checked ? (
                        <CheckCircle2 size={32} className="text-emerald-500" />
                      ) : (
                        <Circle size={32} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!isAlreadyFinished && (
            <div className="p-6 border-t border-gray-100 bg-white">
              {!isAllChecked && items.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm font-bold mb-4">
                  <AlertCircle size={18} />
                  يجب التأشير على جميع الكتب أولاً للتأكد من خلو الشحنة من النواقص.
                </div>
              )}
              
              <button
                onClick={handleFinish}
                disabled={!isAllChecked || isSubmitting}
                className="w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
              >
                {isSubmitting ? "جاري الاعتماد وخصم المخزون..." : "تأكيد تجهيز الطلب بالكامل الاعتماد"}
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
