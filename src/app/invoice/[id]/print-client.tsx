"use client"

import { useEffect } from "react"
import { Printer } from "lucide-react"

export default function PrintClient({ order, items }: { order: any, items: any[] }) {
  
  // دالة تشغيل أداة الطباعة في المتصفح تلقائياً بعد ثانيتين أو عند النقر
  const handlePrint = () => {
    window.print();
  }

  useEffect(() => {
    // لطباعة الفاتورة تلقائياً عند فتح الصفحة
    const timer = setTimeout(() => {
      window.print()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-white w-full max-w-[21cm] min-h-[29.7cm] p-8 md:p-12 shadow-2xl print:shadow-none print:p-0 relative">
      
      {/* زر الطباعة (يختفي في وضع الطباعة) */}
      <div className="absolute top-4 left-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow hover:bg-slate-800 transition-colors"
        >
          <Printer size={18} /> طباعة الفاتورة
        </button>
      </div>

      {/* الترويسة (Header) */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 mt-12 print:mt-0">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">فاتورة شحن وتجهيز</h1>
          <p className="text-gray-500 font-bold">دار بسمة للنشر والتوزيع</p>
          <div className="mt-4 text-sm text-gray-600">
            <p>سجل تجاري: 1234567890</p>
            <p>الرقم الضريبي: 300000000000003</p>
            <p>الرياض، المملكة العربية السعودية</p>
          </div>
        </div>
        <div className="text-left w-64">
           {/* يمكن وضع شعار هنا مستقبلاً */}
           <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mr-auto mb-4 border-2 border-slate-200">
             <span className="text-3xl font-black text-slate-300">LOGO</span>
           </div>
           <p className="font-black text-2xl text-slate-800">#{order.id.split("-")[0].toUpperCase()}</p>
           <p className="text-gray-500 font-bold mt-1 dir-ltr">{new Date(order.order_date).toLocaleDateString("en-GB")}</p>
        </div>
      </div>

      {/* بيانات العميل (المدرسة) */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">بيانات العميل (المدرسة)</h3>
          <p className="text-xl font-black text-slate-800 mb-1">{order.schools?.name}</p>
          <p className="text-slate-600 mb-1">{order.schools?.city} - {order.schools?.address}</p>
          <p className="text-slate-600">هاتف: <span className="dir-ltr inline-block">{order.schools?.phone}</span></p>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">تفاصيل التوصيل</h3>
          <p className="text-slate-600 mb-1 font-bold">مسؤول الاستلام: <span className="font-normal">{order.schools?.contact_person}</span></p>
          <p className="text-slate-600 mb-1 font-bold">حالة الطلب وقت الطباعة: <span className="font-normal">{order.status}</span></p>
        </div>
      </div>

      {/* جدول المنتجات */}
      <table className="w-full text-right mb-10 border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white rounded-t-xl overflow-hidden">
            <th className="p-4 font-bold rounded-tr-xl w-12">م</th>
            <th className="p-4 font-bold">وصف الكتاب/المنتج</th>
            <th className="p-4 font-bold text-center">الكمية</th>
            <th className="p-4 font-bold text-center">سعر الوحدة</th>
            <th className="p-4 font-bold rounded-tl-xl text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="border-b-2 border-slate-900 border-x border-slate-200">
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="p-4 text-slate-500 font-bold bg-slate-50 border-r border-slate-200">{idx + 1}</td>
              <td className="p-4 font-bold text-slate-800">
                {item.books?.title}
              </td>
              <td className="p-4 text-center font-black text-lg text-slate-700 bg-slate-50">{item.quantity}</td>
              <td className="p-4 text-center text-slate-600">{item.unit_price.toFixed(2)} ر.س</td>
              <td className="p-4 text-left font-black text-slate-800">{item.total_price.toFixed(2)} ر.س</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ملخص المبالغ والختم */}
      <div className="flex justify-between items-end">
        
        <div className="w-1/2">
          <div className="w-48 h-48 border-4 border-red-500/20 rounded-full flex flex-col items-center justify-center transform -rotate-12 opacity-80">
            <p className="text-red-500 font-black text-2xl">معتمد</p>
            <p className="text-red-400 text-xs font-bold mt-1 border-t border-red-200 pt-1">دار بسمة للنشر</p>
          </div>
        </div>

        <div className="w-1/2 bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-3 text-slate-600">
            <span className="font-bold">المجموع الفرعي:</span>
            <span>{order.total_amount.toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-slate-600 pb-4 border-b border-slate-200">
            <span className="font-bold">الضريبة (15% مشمولة):</span>
            <span>{(order.total_amount - (order.total_amount / 1.15)).toFixed(2)} ر.س</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-xl text-slate-900">الإجمالي النهائي:</span>
            <span className="font-black text-2xl text-slate-900">{order.total_amount.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      {/* تذييل الصفحة */}
      <div className="mt-16 pt-8 border-t border-slate-200 text-center text-gray-400 text-sm">
        <p>شكراً لتعاملكم معنا. في حال وجود أي استفسار يرجى التواصل على contact@darbasma.com</p>
        <p className="mt-1 dir-ltr inline-block">Page 1 of 1</p>
      </div>

    </div>
  )
}
