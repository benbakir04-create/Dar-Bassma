"use client"

import { useState } from "react";
import { createSchool, updateSchool, toggleSchoolActive } from "./actions";
import { Plus, Search, Edit2, Users, Receipt, Building2 } from "lucide-react";

export default function SchoolsClient({ 
  initialSchools, 
  schoolUsers 
}: { 
  initialSchools: any[], 
  schoolUsers: any[] 
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any | null>(null);
  
  // Model form state
  const [formData, setFormData] = useState({
    name: "",
    stage: "إبتدائي",
    city: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    registration_no: "",
    credit_limit: 0,
    balance_due: 0,
    notes: "",
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSchools = schools.filter(s => 
    s.name.includes(search) || 
    (s.city || "").includes(search) || 
    (s.contact_person || "").includes(search)
  );

  const handleOpenAdd = () => {
    setEditingSchool(null);
    setFormData({
      name: "",
      stage: "إبتدائي",
      city: "",
      address: "",
      contact_person: "",
      phone: "",
      email: "",
      registration_no: "",
      credit_limit: 50000,
      balance_due: 0,
      notes: "",
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (school: any) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      stage: school.stage || "إبتدائي",
      city: school.city || "",
      address: school.address || "",
      contact_person: school.contact_person || "",
      phone: school.phone || "",
      email: school.email || "",
      registration_no: school.registration_no || "",
      credit_limit: school.credit_limit || 0,
      balance_due: school.balance_due || 0,
      notes: school.notes || "",
      active: school.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingSchool) {
      const res = await updateSchool(editingSchool.id, formData);
      if (res.success) {
        setSchools(schools.map(s => s.id === editingSchool.id ? { ...s, ...formData } : s));
        setIsModalOpen(false);
      } else alert(res.error);
    } else {
      const res = await createSchool(formData);
      if (res.success && res.data) {
        setSchools([res.data[0], ...schools]);
        setIsModalOpen(false);
      } else alert(res.error);
    }
    
    setIsSubmitting(false);
  };

  const handleToggleActive = async (school: any) => {
    const res = await toggleSchoolActive(school.id, school.active);
    if (res.success) {
      setSchools(schools.map(s => s.id === school.id ? { ...s, active: !school.active } : s));
    } else alert(res.error);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* شريط الأدوات */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث باسم المدرسة، المدينة أو المسؤول..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary text-sm font-bold transition-colors shadow-sm"
        >
          <Building2 size={16} /> إضافة مدرسة جديدة
        </button>

      </div>

      {/* جدول المدارس */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm">
              <th className="p-4">اسم المدرسة</th>
              <th className="p-4">مسؤول التواصل</th>
              <th className="p-4">المدينة / المرحلة</th>
              <th className="p-4 text-center">الرصيد / الحد الائتماني</th>
              <th className="p-4 text-center">حالة الحساب</th>
              <th className="p-4 text-center">خيارات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredSchools.map((school) => {
              const hasUser = schoolUsers.some(u => u.linked_id === school.id);

              return (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{school.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      {hasUser ? <span className="text-green-600 flex items-center gap-1"><Users size={12}/> مستخدم مسجل</span> : <span className="text-orange-500 flex items-center gap-1"><Users size={12}/> لا يوجد حساب مستخدم</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-700">{school.contact_person || "-"}</div>
                    <div className="text-xs text-gray-400 dir-ltr text-right">{school.phone || "-"}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div>{school.city || "-"}</div>
                    <div className="text-xs text-gray-400">{school.stage || "-"}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`font-bold ${school.balance_due > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {school.balance_due} ر.س
                    </div>
                    <div className="text-xs text-gray-400">
                      الحد: {school.credit_limit} ر.س
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggleActive(school)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${school.active ? 'bg-primary' : 'bg-gray-200'}`}
                      title={school.active ? 'تعطيل حساب المدرسة' : 'تفعيل الحساب'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${school.active ? '-translate-x-6' : '-translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => handleOpenEdit(school)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل بيانات المدرسة"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredSchools.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">لا توجد مدارس مطابقة للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة الإضافة/التعديل (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-6 border-b pb-3">
              {editingSchool ? "تعديل بيانات المدرسة" : "إضافة مدرسة جديدة"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6 mb-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المدرسة *</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المرحلة الدراسية</label>
                <select 
                  value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white"
                >
                  <option value="رياض أطفال">رياض أطفال</option>
                  <option value="إبتدائي">إبتدائي</option>
                  <option value="متوسط">متوسط</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="مجمع تجريبي / أهلي">مجمع تجريبي / أهلي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرقم الوزاري / رخصة المدرسة</label>
                <input 
                  type="text"
                  value={formData.registration_no} onChange={e => setFormData({...formData, registration_no: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المدينة</label>
                <input 
                  type="text"
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">العنوان التفصيلي</label>
                <input 
                  type="text"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">بيانات التواصل والإدارة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">مسؤول التواصل</label>
                <input 
                  type="text"
                  value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف / الجوال</label>
                <input 
                  type="text" dir="ltr"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white text-right"
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني للإشعارات والفواتير</label>
                <input 
                  type="email" dir="ltr"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white text-right"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">البيانات المالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الحد الائتماني المسموح (ريال)</label>
                <input 
                  type="number" min="0" step="1000" required
                  value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white font-bold text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">أساس المديونية الحالية (تعديل يدوي)</label>
                <input 
                  type="number" min="0" step="0.01" required
                  value={formData.balance_due} onChange={e => setFormData({...formData, balance_due: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-gray-50 focus:bg-white font-bold text-red-500"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                type="submit" disabled={isSubmitting}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors text-lg shadow-sm"
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ بيانات المدرسة"}
              </button>
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="px-8 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
