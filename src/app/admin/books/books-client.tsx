"use client"

import { useState } from "react";
import { createBook, updateBook, toggleBookActive } from "./actions";
import { Plus, Search, Edit2, Book as BookIcon } from "lucide-react";

export default function BooksClient({ 
  initialBooks, 
  levels, 
  subjects 
}: { 
  initialBooks: any[], 
  levels: any[], 
  subjects: any[] 
}) {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    cover_emoji: "📘",
    level_id: "",
    subject_id: "",
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBooks = books.filter(b => 
    b.title.includes(search) || 
    (b.levels?.name || "").includes(search) || 
    (b.subjects?.name || "").includes(search)
  );

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      price: 0,
      cover_emoji: "📘",
      level_id: levels[0]?.id || "",
      subject_id: subjects[0]?.id || "",
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: any) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      price: book.price,
      cover_emoji: book.cover_emoji,
      level_id: book.level_id || "",
      subject_id: book.subject_id || "",
      active: book.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (editingBook) {
      const res = await updateBook(editingBook.id, formData);
      if (res.success) {
        setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...formData, levels: levels.find(l => l.id === formData.level_id), subjects: subjects.find(s => s.id === formData.subject_id) } : b));
        setIsModalOpen(false);
      } else alert(res.error);
    } else {
      const res = await createBook(formData);
      if (res.success && res.data) {
        const newBook = { ...res.data[0], levels: levels.find(l => l.id === formData.level_id), subjects: subjects.find(s => s.id === formData.subject_id) };
        setBooks([newBook, ...books]);
        setIsModalOpen(false);
      } else alert(res.error);
    }
    
    setIsSubmitting(false);
  };

  const handleToggleActive = async (book: any) => {
    const res = await toggleBookActive(book.id, book.active);
    if (res.success) {
      setBooks(books.map(b => b.id === book.id ? { ...b, active: !book.active } : b));
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
            placeholder="ابحث عن كتاب، مادة، أو صف..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
          />
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={16} /> إضافة كتاب جديد
        </button>

      </div>

      {/* جدول الكتب */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-sm">
              <th className="p-4">الكتاب</th>
              <th className="p-4">المادة</th>
              <th className="p-4">الصف</th>
              <th className="p-4">السعر</th>
              <th className="p-4 text-center">الحالة (مفعل/معطل)</th>
              <th className="p-4 text-center">خيارات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <span className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-xl">{book.cover_emoji}</span>
                  <span className="font-bold text-gray-800">{book.title}</span>
                </td>
                <td className="p-4 text-gray-600">{book.subjects?.name || "-"}</td>
                <td className="p-4 text-gray-600">{book.levels?.name || "-"}</td>
                <td className="p-4 font-bold text-primary">{book.price} ر.س</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleToggleActive(book)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${book.active ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${book.active ? '-translate-x-6' : '-translate-x-1'}`} />
                  </button>
                </td>
                <td className="p-4 flex justify-center">
                  <button 
                    onClick={() => handleOpenEdit(book)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredBooks.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">لا توجد كتب مطابقة للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة الإضافة/التعديل (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-primary mb-6 border-b pb-3">
              {editingBook ? "تعديل كتاب" : "إضافة كتاب جديد"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرمز التعريفي (إيموجي الغلاف)</label>
                <input 
                  type="text" required 
                  value={formData.cover_emoji} onChange={e => setFormData({...formData, cover_emoji: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary text-xl"
                  maxLength={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الكتاب</label>
                <input 
                  type="text" required 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">المادة</label>
                  <select 
                    value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-white"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">الصف</label>
                  <select 
                    value={formData.level_id} onChange={e => setFormData({...formData, level_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary bg-white"
                  >
                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">السعر (ريال)</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                type="submit" disabled={isSubmitting}
                className="flex-1 bg-primary text-white py-2 rounded-xl font-bold hover:bg-secondary transition-colors"
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ الجرد"}
              </button>
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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
