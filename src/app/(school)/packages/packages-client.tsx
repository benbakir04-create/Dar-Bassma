"use client";

import { useState } from "react";
import CartSidebar from "@/components/cart-sidebar";
import type { CartItem } from "@/types/database.types";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PackageWithDetails } from "./page";

export default function PackagesClient({ packages }: { packages: PackageWithDetails[] }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddPackage = (pkg: PackageWithDetails) => {
    setCart((prev) => {
      const newCart = { ...prev };
      
      pkg.package_books.forEach((item) => {
        if (!item.books) return;
        const book = item.books;
        
        const existing = newCart[book.id];
        const newQty = (existing?.quantity || 0) + item.quantity;
        
        newCart[book.id] = {
          book_id: book.id,
          title: book.title,
          price: book.price,
          quantity: newQty,
          cover_emoji: book.cover_emoji,
        };
      });

      return newCart;
    });
    
    setIsCartOpen(true);
  };

  const handleCheckout = async (type: "delivery" | "pickup") => {
    setIsSubmitting(true);
    const itemsList = Object.values(cart);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsList, delivery_type: type }),
      });

      const result = await res.json();
      if (result.success) {
        setCart({});
        setIsCartOpen(false);
        router.push("/school/orders");
      } else {
        alert(result.message || "فشل إنشاء الطلب");
      }
    } catch (error) {
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = Object.values(cart).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">الحزم الجاهزة</h1>
          <p className="text-sm text-gray-500 mt-1">اطلب مجموعة كتب مخصصة لكل صف بنقرة واحدة</p>
        </div>
        
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors text-primary flex items-center gap-2 font-bold"
        >
          <ShoppingCart size={20} />
          <span className="hidden sm:inline">السلة</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-bold text-gray-700">لا توجد حزم جاهزة حالياً</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{pkg.name}</h3>
                  <p className="text-sm text-gray-500">{pkg.levels?.name || "عام"}</p>
                </div>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {pkg.price} ر.س
                </span>
              </div>
              
              <div className="flex-1 mb-6">
                <h4 className="text-sm font-bold text-gray-600 mb-2 border-b pb-2">محتويات الحزمة:</h4>
                <ul className="space-y-2">
                  {pkg.package_books.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm items-center">
                      <span className="flex items-center gap-2">
                        <span>{item.books?.cover_emoji || "📘"}</span>
                        <span className="line-clamp-1">{item.books?.title}</span>
                      </span>
                      <span className="font-semibold text-gray-500 flex-shrink-0">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleAddPackage(pkg)}
                className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-lg text-sm font-bold transition-colors"
              >
                إضافة الحزمة للسلة
              </button>
            </div>
          ))}
        </div>
      )}

      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={(id, qty) => setCart(p => ({ ...p, [id]: { ...p[id], quantity: qty } }))}
        removeFromCart={(id) => {
          const newCart = { ...cart };
          delete newCart[id];
          setCart(newCart);
        }}
        onCheckout={handleCheckout}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
