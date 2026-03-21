import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دار بسمة - نظام طلبات الكتب",
  description: "نظام B2B لإدارة طلبات الكتب المدرسية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#f0f4f8]">{children}</body>
    </html>
  );
}
