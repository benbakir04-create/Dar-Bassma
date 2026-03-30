"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(`خطأ: ${error.message}`);
      } else {
        setMessage("تم تغيير كلمة المرور بنجاح! سيتم تحويلك للصفحة الرئيسية حالا...");
        setTimeout(() => {
          window.location.replace("/");
        }, 2000);
      }
    } catch (err: any) {
      setError(`حدث خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50"
      style={{
        background: "linear-gradient(135deg, #1a3a5c 0%, #2980b9 55%, #27ae60 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(135deg, #1a3a5c, #2980b9)" }}>
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-white text-xl font-bold">تعيين كلمة المرور الجديدة</h1>
        </div>

        <form onSubmit={handleUpdate} className="px-8 py-8">
          {error && <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700">{error}</div>}
          {message && <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 font-bold">{message}</div>}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              style={{ direction: "ltr" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold transition-opacity disabled:opacity-70"
            style={{ background: "#27ae60" }}
          >
            {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}
