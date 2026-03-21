"use client"

import { useState } from "react";
import { Search, Edit2, AlertCircle, TrendingUp, Package, Box } from "lucide-react";
import { updateInventoryQuantity } from "./actions";

export default function InventoryClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newQty, setNewQty] = useState<number | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  // الفلترة بالاسم
  const filteredData = data.filter(item => item.title.includes(search));

  // إجمالي الإحصائيات
  const totalAvailable = data.reduce((sum, item) => sum + item.available, 0);
  const totalDelivered = data.reduce((sum, item) => sum + item.delivered, 0);
  const totalReserved = data.reduce((sum, item) => sum + item.reserved, 0);

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewQty(item.available);
  };

  const handleSaveQty = async () => {
    if (!editingItem || newQty === "" || Number(newQty) < 0) return;
    
    setIsUpdating(true);
    const res = await updateInventoryQuantity(editingItem.book_id, Number(newQty));
    setIsUpdating(false);

    if (res.success) {
      // تحديث الحالة محلياً بانسيابية
      setData(prev => prev.map(item => 
        item.book_id === editingItem.book_id 
          ? { ...item, available: Number(newQty) } 
          : item
      ));
      setEditingItem(null);
    } else {
      alert("خطأ: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">إجمالي الكتب المتاحة للبيع</p>
            <p className="text-3xl font-black text-emerald-600">{totalAvailable}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Package className="text-emerald-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">الكميات المحجوزة حالياً للطلبات</p>
            <p className="text-3xl font-black text-amber-600">{totalReserved}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Box className="text-amber-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-bold mb-1">إجمالي الموزع للمدارس (مباع)</p>
            <p className="text-3xl font-black text-blue-600">{totalDelivered}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* شريط البحث */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن كتاب لتعديل رصيده..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* الجدول */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-500 font-semibold text-sm">
                <th className="p-4">الكتاب</th>
                <th className="p-4 text-center">الكمية المسلمة للمدارس</th>
                <th className="p-4 text-center">
                  <span className="flex items-center justify-center gap-1 text-amber-600">
                    <AlertCircle size={14}/> محجوز לתجهيز
                  </span>
                </th>
                <th className="p-4 text-center">المتاح للبيع (المستودع)</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredData.map((item) => {
                // حالة التنبيه إذا كان المحجوز أكبر من أو قريب جداً من المتاح
                const isWarning = item.available <= item.reserved && item.reserved > 0;
                
                return (
                  <tr key={item.book_id} className={`hover:bg-gray-50 transition-colors ${isWarning ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">{item.cover_emoji}</div>
                        <div>
                          <p className="font-bold text-gray-800 text-base">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.price} ر.س</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-gray-600 font-bold">
                      {item.delivered}
                    </td>
                    <td className="p-4 text-center text-amber-600 font-bold bg-amber-50/30">
                      {item.reserved}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-lg ${
                        isWarning ? 'text-red-600 bg-red-100' : 
                        item.available === 0 ? 'text-gray-400 bg-gray-100' : 'text-emerald-700 bg-emerald-100'
                      }`}>
                        {item.available}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-block"
                        title="تعديل الرصيد"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">لا توجد كتب مطابقة للبحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة تعديل الرصيد (Modal) */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-xl font-black text-gray-800 mb-2">تعديل رصيد الكتاب</h2>
            <p className="text-gray-500 mb-6 flex items-center gap-2">
              <span className="text-2xl">{editingItem.cover_emoji}</span>
              {editingItem.title}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الكمية المتاحة للبيع (المستودع)</label>
                <input 
                  type="number" 
                  min="0"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value ? Number(e.target.value) : "")}
                  className="w-full text-center text-2xl font-black p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              {Number(newQty) < editingItem.reserved && (
                <div className="flex gap-2 items-start text-red-600 bg-red-50 p-3 rounded-lg text-sm font-bold">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  تحذير: الكمية المتاحة أقل من الكمية المحجوزة للطلبات قيد التجهيز ({editingItem.reserved})! قد لا يكفي المخزون لتلبية الطلبات.
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={handleSaveQty}
                  disabled={isUpdating || newQty === ""}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button 
                  onClick={() => setEditingItem(null)}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
