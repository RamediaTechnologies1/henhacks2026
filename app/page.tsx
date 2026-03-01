"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <h1 className="text-[20px] font-medium text-[#111111] tracking-[-0.01em] mb-1">
          FixIt AI
        </h1>
        <p className="text-[13px] text-[#6B7280]">University of Delaware</p>
        <div className="mt-6 mx-auto w-48 h-1 rounded-full overflow-hidden bg-[#E5E7EB]">
          <div className="h-full w-1/3 bg-[#00539F] rounded-full skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}
