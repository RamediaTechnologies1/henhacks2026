"use client";

import { useState } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_BUILDINGS } from "@/lib/constants";
import { toast } from "sonner";

const FLOORS = ["1", "2", "3"];

function generateQRSvg(text: string, size: number = 200): string {
  // Simple QR-like visual using a data URL approach
  // We'll create an SVG that encodes the URL visually
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=000000&color=ffffff&format=svg`;
}

interface QRRoom {
  building: string;
  floor: string;
  room: string;
  url: string;
}

export default function QRCodesPage() {
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [rooms, setRooms] = useState<QRRoom[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  function generateRoomQRs() {
    if (!building || !floor) {
      toast.error("Select a building and floor");
      return;
    }

    const roomNumbers = Array.from({ length: 8 }, (_, i) => {
      const num = `${floor}${String(i + 1).padStart(2, "0")}`;
      return `${num}`;
    });

    const generated = roomNumbers.map((room) => ({
      building,
      floor,
      room,
      url: `${baseUrl}/user?building=${encodeURIComponent(building)}&floor=${encodeURIComponent(floor)}&room=${encodeURIComponent(room)}`,
    }));

    setRooms(generated);
    toast.success(`Generated ${generated.length} QR codes`);
  }

  async function copyUrl(url: string, room: string) {
    await navigator.clipboard.writeText(url);
    setCopied(room);
    toast.success("URL copied!");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div className="section-header">
        <h1 className="text-2xl font-bold text-[#ededed] tracking-tight">Room QR Codes</h1>
        <p className="text-sm text-[#666666] mt-0.5">
          Generate QR codes for rooms — students scan to pre-fill report location
        </p>
      </div>

      <Card className="rounded-2xl border-white/[0.08] bg-white/[0.04]">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={building} onValueChange={setBuilding}>
              <SelectTrigger className="w-48 rounded-xl border-white/[0.08] bg-[#000000] text-[#a1a1a1] h-10">
                <SelectValue placeholder="Select Building" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_BUILDINGS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={floor} onValueChange={setFloor}>
              <SelectTrigger className="w-32 rounded-xl border-white/[0.08] bg-[#000000] text-[#a1a1a1] h-10">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                {FLOORS.map((f) => (
                  <SelectItem key={f} value={f}>Floor {f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={generateRoomQRs} className="btn-western rounded-xl h-10 px-5">
              <QrCode className="h-4 w-4 mr-2" /> Generate QR Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {rooms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-enter">
          {rooms.map((r) => (
            <Card key={r.room} className="rounded-2xl border-white/[0.08] bg-white/[0.04] overflow-hidden card-hover-lift">
              <CardContent className="p-4 text-center space-y-3">
                <div className="bg-white rounded-xl p-2 inline-block mx-auto">
                  <img
                    src={generateQRSvg(r.url, 150)}
                    alt={`QR for ${r.building} Room ${r.room}`}
                    className="w-[150px] h-[150px]"
                    crossOrigin="anonymous"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#ededed]">{r.building}</p>
                  <p className="text-xs text-[#666666]">Floor {r.floor}, Room {r.room}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(r.url, r.room)}
                    className="flex-1 rounded-lg border-white/[0.08] text-[#666666] hover:bg-white/5 text-xs h-8"
                  >
                    {copied === r.room ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied === r.room ? "Copied" : "Copy URL"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generateQRSvg(r.url, 400), "_blank")}
                    className="rounded-lg border-white/[0.08] text-[#666666] hover:bg-white/5 text-xs h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
