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
      <div className="floating-orb w-72 h-72 bg-[#c8a55c] top-10 -left-20" />
      <div className="floating-orb w-96 h-96 bg-[#b87333] bottom-10 -right-20" style={{ animationDelay: "-7s" }} />
      <div className="floating-orb w-48 h-48 bg-[#8b3a1a] top-1/2 right-1/4" style={{ animationDelay: "-12s" }} />

      <div className="text-center page-enter relative z-10">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#c8a55c] rounded-2xl blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-br from-[#c8a55c] to-[#9a7d3f] p-5 rounded-2xl shadow-2xl shadow-[#c8a55c]/20">
            <Wrench className="h-12 w-12 text-[#0d0a07]" />
          </div>
        </div>
        <h1 className="font-[family-name:var(--font-western)] text-4xl text-[#c8a55c] tracking-wide mb-2">
          FixIt AI
        </h1>
        <p className="text-[#9c8e7c] text-sm mb-8">Riding into the frontier...</p>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#c8a55c]"
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
