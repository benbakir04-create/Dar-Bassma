"use client"

import { useState } from "react";
import { TrendingUp, ShoppingBag, Clock, CheckCircle2, Download } from "lucide-react";

type ReportData = {
  summary: { totalOrders: number; completedOrders: number; totalRevenue: number; pendingAmount: number };
  topBooks: { title: string; emoji: string; qty: number }[];
  topSchools: { name: string; total: number; count: number }[];
  monthlyTrend: { label: string; total: number }[];
};

export default function ReportsClient({ data }: { data: ReportData }) {
  const { summary, topBooks, topSchools, monthlyTrend } = data;
  
  // إيجاد أقصى قيمة شهرية لرسم البار شارت النسبية
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.total), 1);
  const maxBookQty = Math.max(...topBooks.map(b => b.qty), 1);
  const maxSchoolTotal = Math.max(...topSchools.map(s => s.total), 1);

  // تصدير CSV بسيط
  const exportCSV = () => {
    const rows = [
      ["الملخص", ""],
      ["إجمالي الطلبات", summary.totalOrders],
      ["الطلبات المكتملة", summary.completedOrders],
      ["الإيرادات المحققة (ر.س)", summary.totalRevenue.toFixed(2)],
      ["المبالغ المعلقة (ر.س)", summary.pendingAmount.toFixed(2)],
      ["", ""],
      ["أكثر الكتب طلباً", ""],
      ...topBooks.map(b => [b.title, b.qty]),
      ["", ""],
      ["أكثر المدارس نشاطاً", ""],
      ...topSchools.map(s => [s.name, `${s.total.toFixed(2)} ر.س`]),
    ];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `dar_basma_report_${new Date().toLocaleDateString("en-GB").replace(/\//g,"-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* بطاقات الملخص */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "إجمالي الطلبات", value: summary.totalOrders, color: "text-slate-800", bg: "bg-slate-100", icon: <ShoppingBag size={22} className="text-slate-600" /> },
          { label: "الطلبات المكتملة", value: summary.completedOrders, color: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 size={22} className="text-emerald-600" /> },
          { label: "الإيرادات المحققة", value: `${summary.totalRevenue.toLocaleString("ar-SA")} ر.س`, color: "text-blue-700", bg: "bg-blue-50", icon: <TrendingUp size={22} className="text-blue-600" /> },
          { label: "مبالغ قيد الإتمام", value: `${summary.pendingAmount.toLocaleString("ar-SA")} ر.س`, color: "text-amber-700", bg: "bg-amber-50", icon: <Clock size={22} className="text-amber-600" /> },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>{card.icon}</div>
            <p className={`text-2xl font-black ${card.color} mb-1`}>{card.value}</p>
            <p className="text-gray-500 text-sm font-bold">{card.label}</p>
          </div>
        ))}
      </div>

      {/* الاتجاه الشهري */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800">الأداء المالي (آخر 6 أشهر)</h2>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Download size={16}/> تصدير التقرير
          </button>
        </div>
        
        {/* رسم بياني بالـ CSS */}
        <div className="flex items-end gap-4 h-44">
          {monthlyTrend.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{m.total > 0 ? `${m.total.toLocaleString("ar-SA")} ر.س` : "-"}</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700" style={{ height: `${Math.round((m.total / maxMonthly) * 140) + 4}px` }}></div>
              <span className="text-xs text-slate-500 text-center font-bold">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* أكثر الكتب طلباً + أكثر المدارس نشاطاً */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* الكتب */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6">📚 أكثر الكتب طلباً</h2>
          <div className="space-y-4">
            {topBooks.length === 0 && <p className="text-center text-gray-400 py-4">لا توجد بيانات بعد</p>}
            {topBooks.map((book, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{book.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate mb-1">{book.title}</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${(book.qty / maxBookQty) * 100}%` }}></div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-700 w-12 text-left">{book.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* المدارس */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6">🏫 أكثر المدارس نشاطاً</h2>
          <div className="space-y-4">
            {topSchools.length === 0 && <p className="text-center text-gray-400 py-4">لا توجد بيانات بعد</p>}
            {topSchools.map((school, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-black text-slate-500 flex-shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate mb-1">{school.name}</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${(school.total / maxSchoolTotal) * 100}%` }}></div>
                  </div>
                </div>
                <div className="text-left w-24 flex-shrink-0">
                  <p className="text-xs font-black text-emerald-600">{school.total.toFixed(0)} ر.س</p>
                  <p className="text-xs text-gray-400">{school.count} طلبات</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
