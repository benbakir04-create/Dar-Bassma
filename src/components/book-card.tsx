"use client";

import type { BookWithInventory } from "@/app/(school)/catalog/page";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function BookCard({ book, onAddToCart }: { book: BookWithInventory; onAddToCart: (item: any) => void }) {
  const [qty, setQty] = useState(1);
  const available = book.inventory?.[0]?.quantity_available ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover flex flex-col">
      {/* Cover */}
      <div 
        className="h-48 flex items-center justify-center text-6xl relative"
        style={{ backgroundColor: book.cover_color || "#EBF3FF" }}
      >
        <span>{book.cover_emoji || "📖"}</span>
        {available <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">نفدت الكمية</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-lg text-primary leading-tight">{book.title}</h3>
          <span className="font-bold text-accent whitespace-nowrap">{book.price} ر.س</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{book.description || "لا يوجد وصف متاح"}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span>المؤلف: {book.author || "غير محدد"}</span>
          <span>المتوفر: {available}</span>
        </div>

        {/* Add to Cart Actions */}
        <div className="flex items-center gap-2 mt-auto">
          {available > 0 ? (
            <>
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2 text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(available, qty + 1))}
                  className="p-2 text-gray-600 hover:text-primary transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={() => onAddToCart({ ...book, selectedQty: qty })}
                className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingCart size={16} /> إضافة
              </button>
            </>
          ) : (
            <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
              غير متاح حالياً
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
