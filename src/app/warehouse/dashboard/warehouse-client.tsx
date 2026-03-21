"use client"

import { useState } from "react";
import { Search, Clock, PlayCircle, PackageSearch, User, MapPin } from "lucide-react";
import { startPreparingOrder } from "./actions";

const statusLang: Record<string, { label: string, color: string }> = {
  approved: { label: "جديد (بانتظار التجهيز)", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "جاري التجهيز", color: "bg-amber-100 text-amber-700" },
};

export default function WarehouseDashboardClient({ orders }: { orders: any[] }) {
  const [search, setSearch] = useState("");
  const [isStarting, setIsStarting] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => 
    o.id.includes(search) || 
    (o.schools?.name || "").includes(search)
  );

  const handleStart = async (orderId: string, status: string) => {
    setIsStarting(orderId);
    await startPreparingOrder(orderId, status);
    // Error handling if redirect fails
    setIsStarting(null);
  };

  return (
    <div className="space-y-6">
      {/* بطاقات إحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">طلبات جديدة</p>
            <p className="text-3xl font-black text-blue-600">{orders.filter(o => o.status === 'approved').length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <PackageSearch className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">جاري تجهيزها</p>
            <p className="text-3xl font-black text-amber-600">{orders.filter(o => o.status === 'preparing').length}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="text-amber-500" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* شريط البحث */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث برقم الطلب أو المدرسة..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* قائمة الطلبات */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">لا توجد طلبات معتمدة في الوقت الحالي</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-gray-400 text-sm">
                    #{order.id.split("-")[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{order.schools?.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {order.schools?.city || 'بدون مدينة'}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> {new Date(order.order_date).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusLang[order.status]?.color}`}>
                    {statusLang[order.status]?.label}
                  </span>
                  
                  <button 
                    onClick={() => handleStart(order.id, order.status)}
                    disabled={isStarting === order.id}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition-all w-full md:w-auto justify-center disabled:opacity-50"
                  >
                    <PlayCircle size={18} />
                    {isStarting === order.id ? "جاري الفتح..." : order.status === 'preparing' ? "متابعة التجهيز" : "بدء التجهيز"}
                  </button>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
