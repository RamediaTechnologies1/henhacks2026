"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const { role } = await res.json();
          router.replace(`/${role}`);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, [router]);

  if (!checking) return null;

  return (
    <div className="fixit-gradient-bg flex min-h-screen items-center justify-center relative">
      <div className="floating-orb w-72 h-72 bg-[#FFD200] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-blue-400 bottom-10 -right-20" style={{ animationDelay: "-7s" }} />

      <div className="text-center page-enter relative z-10">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#FFD200] rounded-2xl blur-xl opacity-40 animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#FFD200] to-[#f5c400] p-5 rounded-2xl shadow-2xl shadow-yellow-500/20">
            <Wrench className="h-12 w-12 text-[#00296b]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">FixIt AI</h1>
        <p className="text-blue-200/60 text-sm mb-8">Loading your workspace...</p>

        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FFD200]"
              style={{
                animation: "dotBreathe 1.2s ease-in-out infinite",
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
