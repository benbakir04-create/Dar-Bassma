"use client";

import { useState } from "react";
import BookCard from "@/components/book-card";
import CartSidebar from "@/components/cart-sidebar";
import type { BookWithInventory } from "./page";
import type { CartItem } from "@/types/database.types";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CatalogClient({ books }: { books: BookWithInventory[] }) {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddToCart = (book: BookWithInventory & { selectedQty: number }) => {
    setCart((prev) => {
      const existing = prev[book.id];
      const newQty = existing ? existing.quantity + book.selectedQty : book.selectedQty;
      
      // لا نتجاوز المتوفر
      const available = book.inventory?.[0]?.quantity_available ?? 0;
      const finalQty = Math.min(newQty, available);

      return {
        ...prev,
        [book.id]: {
          book_id: book.id,
          title: book.title,
          price: book.price,
          quantity: finalQty,
          cover_emoji: book.cover_emoji,
        }
      };
    });
    
    // إظهار تنبيه لطيف للمستخدم (شكل من أشكال الـ toast)
    setIsCartOpen(true);
  };

  const handleCheckout = async (type: "delivery" | "pickup") => {
    setIsSubmitting(true);
    
    // تجهيز بيانات الطلب (مصفوفة من العناصر)
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
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">الكتالوج</h1>
          <p className="text-sm text-gray-500 mt-1">تصفح واطلب الكتب المقررة</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
        ))}
      </div>

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
    </>
  );
}
