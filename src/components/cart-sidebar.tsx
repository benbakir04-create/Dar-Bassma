"use client";

import type { CartItem } from "@/types/database.types";
import { ShoppingBag, X, Trash2, CreditCard } from "lucide-react";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, CartItem>;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: (type: "delivery" | "pickup") => void;
  isSubmitting: boolean;
};

export default function CartSidebar({ 
  isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout, isSubmitting 
}: CartSidebarProps) {
  
  const items = Object.values(cart);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // الضريبة 15% 
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShoppingBag size={20} />
            <h2>السلة ({totalItems})</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>السلة فارغة حالياً</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.book_id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm border border-gray-100 flex-shrink-0">
                    {item.cover_emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-primary line-clamp-1">{item.title}</h4>
                    <p className="text-accent text-sm font-bold mt-1">{item.price} ر.س</p>
                    <div className="flex justify-between items-center mt-2">
                       <span className="text-xs text-gray-400">الكمية: {item.quantity}</span>
                       <button onClick={() => removeFromCart(item.book_id)} className="text-red-400 hover:text-red-600">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-5 bg-gray-50 border-t">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-bold">{tax.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-primary text-lg font-bold border-t pt-2 mt-2">
                <span>الإجمالي:</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onCheckout("pickup")}
                disabled={isSubmitting}
                className="py-3 bg-white border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                استلام شخصي
              </button>
              <button 
                onClick={() => onCheckout("delivery")}
                disabled={isSubmitting}
                className="py-3 bg-primary text-white hover:bg-secondary rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "جاري..." : "تأكيد وتوصيل"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
