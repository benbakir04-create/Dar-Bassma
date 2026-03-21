"use client"

import { useState } from "react";
import { updateOrderStatus } from "./actions";
import type { OrderStatus } from "@/types/database.types";
import { Search, Filter, Printer, Download, CheckCircle, Clock, Truck, XCircle, Package } from "lucide-react";

// Helper for Arabic Status
const statusLang: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "موافق عليه", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "قيد التجهيز", color: "bg-indigo-100 text-indigo-800", icon: Package },
  ready: { label: "جاهز للتسليم", color: "bg-teal-100 text-teal-800", icon: CheckCircle },
  out_for_delivery: { label: "في الطريق", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "مدفوع ومسلم", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "ملغي", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // الفلترة
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.schools?.name.includes(search) || o.id.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // تحديد الكل
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // تفريغ أو تحديد عنصر
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // الإجراءات الجماعية (Bulk Actions)
  const handleBulkStatus = async (newStatus: OrderStatus) => {
    if (selectedIds.size === 0) return alert("الرجاء تحديد طلبات أولاً");
    if (!confirm(`هل أنت متأكد من تغيير حالة ${selectedIds.size} طلب إلى ${statusLang[newStatus]?.label}؟`)) return;

    setIsUpdating(true);
    const res = await updateOrderStatus(Array.from(selectedIds), newStatus);
    setIsUpdating(false);

    if (res.success) {
      setOrders(orders.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o));
      setSelectedIds(new Set());
    } else {
      alert("حدث خطأ: " + res.error);
    }
  };

  // تصدير إكسل (CSV)
  const exportToExcel = () => {
    const headers = ["ID", "School", "Date", "Items Count", "Total", "Status"];
    const rows = filteredOrders.map(o => [
      o.id.split('-')[0], 
      o.schools?.name || "بدون اسم",
      new Date(o.order_date).toLocaleDateString("ar-SA"),
      o.order_items?.length || 0,
      o.total_amount,
      statusLang[o.status as string]?.label || o.status
    ]);
    
    // دعم الحروف العربية في الـ CSV
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // طباعة الفاتورة (إيصال التجهيز)
  const printInvoice = (order: any) => {
    window.open(`/invoice/${order.id}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* شريط الأدوات */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {/* حقل البحث */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ابحث برقم الطلب أو اسم المدرسة..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* فلتر الحالة */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(statusLang).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* أزرار الإجراءات المتعددة والمحاسبة */}
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 animate-fade-in">
              <span className="text-sm font-semibold text-blue-800">إجراء لـ ({selectedIds.size}):</span>
              <button 
                onClick={() => handleBulkStatus('approved')}
                disabled={isUpdating}
                className="text-xs bg-white text-blue-600 border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded shadow-sm"
              >
                موافقة للسحب
              </button>
              <button 
                onClick={() => handleBulkStatus('rejected')}
                disabled={isUpdating}
                className="text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded shadow-sm"
              >
                رفض
              </button>
            </div>
          )}

          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-600 transition-colors">
            <Download size={16} /> تصدير CSV
          </button>
        </div>

      </div>

      {/* جدول الطلبات */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-4">رقم الطلب</th>
              <th className="p-4">المدرسة</th>
              <th className="p-4">تاريخ الطلب</th>
              <th className="p-4">المبلغ الإجمالي</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">خيارات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">لا توجد طلبات تطابق بحثك</td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isChecked = selectedIds.has(order.id);
                const status = statusLang[order.status as string] || { label: order.status, color: "bg-gray-100 text-gray-800", icon: Clock };
                const Icon = status.icon;

                return (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${isChecked ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(order.id)}
                        className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                      />
                    </td>
                    <td className="p-4 font-mono text-gray-600 text-xs">
                      {order.id.split('-')[0]}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {order.schools?.name}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(order.order_date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-4 font-bold text-primary">
                      {order.total_amount} ر.س
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        <Icon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                       <button 
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        التفاصيل
                      </button>
                      <button 
                        onClick={() => printInvoice(order)}
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-white border border-gray-200 rounded-lg hover:border-primary"
                        title="طباعة إيصال"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة التفاصيل (Modal) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex flex-col">
                <span>تفاصيل طلب مدرسة {selectedOrderDetails.schools?.name}</span>
                <span className="text-sm font-mono text-gray-400 mt-1">ID: {selectedOrderDetails.id}</span>
              </h2>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              {/* قسم المشتريات */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">عناصر الطلب ({selectedOrderDetails.order_items?.length} كتاب)</h3>
                <div className="space-y-3">
                  {selectedOrderDetails.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.books?.cover_emoji || "📘"}</span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.books?.title}</p>
                          <p className="text-xs text-gray-500">سعر الوحدة: {item.unit_price} ر.س | الكمية: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-bold text-primary">
                        {item.line_total} ر.س
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <span className="font-bold text-primary">الإجمالي الكلي</span>
                  <span className="text-xl font-bold text-primary">{selectedOrderDetails.total_amount} ر.س</span>
                </div>
              </div>

              {/* قسم سجل الحركات ووحدة التحكم */}
              <div className="w-full md:w-1/3">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">إجراءات إدارية</h3>
                
                <div className="flex flex-col gap-2 mb-8">
                  <button onClick={() => {
                        handleBulkStatus('approved');
                        setSelectedIds(new Set([selectedOrderDetails.id]));
                        setSelectedOrderDetails(null);
                      }} 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                    اعتماد الطلب لتجهيزه
                  </button>
                  <button onClick={() => {
                        handleBulkStatus('rejected');
                        setSelectedIds(new Set([selectedOrderDetails.id]));
                        setSelectedOrderDetails(null);
                      }} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors border border-red-200">
                    رفض وإلغاء الطلب
                  </button>
                </div>

                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">سجل تتبع الطلب (Timeline)</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {selectedOrderDetails.order_status_log?.length > 0 ? selectedOrderDetails.order_status_log.map((log: any, i: number) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <CheckCircle size={12} />
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-blue-600 mb-1">{statusLang[log.to_status as string]?.label || log.to_status}</div>
                        <div className="text-[10px] text-gray-400 mb-1">{new Date(log.timestamp).toLocaleString("ar-SA")}</div>
                        {log.note && <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{log.note}</div>}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-sm text-gray-500 py-4">تم إنشاء الطلب ولم يتم تحديث حالته بعد.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
