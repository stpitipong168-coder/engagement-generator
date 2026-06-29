"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const from = params.get("from") || "/";
        router.replace(from);
        router.refresh();
      } else {
        setError("รหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur"
    >
      <div className="mb-6 text-center">
        <div className="text-2xl font-bold">🧩 MetaPuzz</div>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกรหัสผ่านเพื่อเข้าใช้งาน
        </p>
      </div>

      <label className="mb-2 block text-sm font-medium">รหัสผ่าน</label>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-white/30"
        placeholder="••••••••"
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password}
        className="mt-5 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
