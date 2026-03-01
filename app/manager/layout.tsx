"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/layout/portal-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LayoutDashboard, QrCode } from "lucide-react";

const NAV_ITEMS = [
  { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manager/qr-codes", label: "QR Codes", icon: QrCode },
];

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
    <div className="min-h-screen bg-[#FAFAFA]">
      <PortalHeader role="manager" email={email} />
      <main className="max-w-7xl mx-auto pb-20">{children}</main>
      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}
