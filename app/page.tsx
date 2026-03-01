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
      <div className="text-center page-enter relative z-10">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-br from-white to-white p-5 rounded-2xl shadow-2xl shadow-white/20">
            <Wrench className="h-12 w-12 text-black" />
          </div>
        </div>
        <h1 className="font-[family-name:var(--font-outfit)] text-4xl text-white tracking-wide mb-2">
          FixIt AI
        </h1>
        <p className="text-[#666666] text-sm mb-8">Initializing workspace...</p>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white"
              style={{
                animation: "dotBreathe 1.4s ease-in-out infinite",
                animationDelay: `${i * 250}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
