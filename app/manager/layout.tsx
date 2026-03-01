"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/layout/portal-header";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/session");
      if (!res.ok) { router.replace("/login"); return; }
      const data = await res.json();
      if (data.role !== "manager") { router.replace(`/${data.role}`); return; }
      setEmail(data.email);
      setReady(true);
    }
    check();
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen portal-bg">
      <PortalHeader role="manager" email={email} />
      <main className="max-w-7xl mx-auto pb-8">{children}</main>
    </div>
  );
}
