"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
      });

      if (error) {
        setError(`خطأ: ${error.message}`);
      } else {
        setMessage("تم إرسال رابط استعادة كلمة المرور لبريدك. يرجى مراجعة صندوق الوارد الخاص بك (أو صندوق الرسائل المزعجة Spam) والضغط على الرابط.");
      }
    } catch (err: any) {
      setError(`حدث خطأ غير متوقع: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #1a3a5c 0%, #2980b9 55%, #27ae60 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div
          className="px-8 py-8 text-center"
          style={{ background: "linear-gradient(135deg, #1a3a5c, #2980b9)" }}
        >
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-white text-xl font-bold">استعادة كلمة المرور</h1>
        </div>

        <form onSubmit={handleReset} className="px-8 py-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200 leading-relaxed font-semibold">
              {message}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              بريدك الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@darbassma.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              style={{ direction: "ltr" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold transition-opacity disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #1a3a5c, #2980b9)" }}
          >
            {loading ? "جاري الإرسال..." : "إرسال الرابط"}
          </button>
          
          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
