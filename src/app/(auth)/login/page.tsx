"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("DEBUG: Attempting login for", email);
      const supabase = createClient();
      console.log("DEBUG: Supabase instance created");
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("DEBUG: Auth Response:", { user: data.user?.id, error: authError });

      if (authError) {
        setError(`خطأ (Supabase): ${authError.message}`);
        setLoading(false);
        return;
      }

      console.log("DEBUG: Login successful, letting middleware redirect...");
      // استخدام replace لمنع حلقة التنقل
      window.location.replace("/");
    } catch (err: any) {
      console.error("DEBUG: Catch-all error:", err);
      setError(`خطأ محلي: ${err.message || JSON.stringify(err)}`);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1a3a5c 0%, #2980b9 55%, #27ae60 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* الهيدر */}
        <div
          className="px-8 py-10 text-center"
          style={{ background: "linear-gradient(135deg, #1a3a5c, #2980b9)" }}
        >
          <div className="text-7xl mb-4">📚</div>
          <h1 className="text-white text-2xl font-bold">دار بسمة للنشر التعليمي</h1>
          <p className="text-blue-200 text-sm mt-2">نظام إدارة طلبات الكتب المدرسية</p>
        </div>

        {/* النموذج */}
        <form onSubmit={handleLogin} className="px-8 py-8">
          <h2 className="text-xl font-bold text-center mb-6" style={{ color: "#1a3a5c" }}>
            تسجيل الدخول
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@school.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:border-blue-400 transition-colors"
              style={{ direction: "ltr" }}
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-600">
                كلمة المرور
              </label>
              <a href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-700 font-bold transition-colors">
                نسيت كلمة المرور؟
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:border-blue-400 transition-colors"
              style={{ direction: "ltr" }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e as unknown as React.FormEvent)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-base
                       transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #1a3a5c, #2980b9)" }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ borderTopColor: "white" }} />
                جاري التحقق...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="px-8 pb-6 text-center text-xs text-gray-400">
          لمساعدة تقنية: admin@darbassma.com
        </div>
      </div>
    </div>
  );
}
