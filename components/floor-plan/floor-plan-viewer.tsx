"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFloorPlan, ROOM_TYPE_COLORS } from "@/lib/floor-plans";
import type { FloorPlanRoom } from "@/lib/types";

interface FloorPlanViewerProps {
  building: string;
  onRoomSelect?: (room: FloorPlanRoom) => void;
  selectedRoomId?: string | null;
  highlightedRooms?: Record<string, string>;
  initialFloor?: string;
}

export function FloorPlanViewer({
  building,
  onRoomSelect,
  selectedRoomId,
  highlightedRooms,
  initialFloor = "1",
}: FloorPlanViewerProps) {
  const floorPlan = getFloorPlan(building);
  const [activeFloor, setActiveFloor] = useState(initialFloor);

  if (!floorPlan) return null;

  const rooms = floorPlan.rooms.filter((r) => r.floor === activeFloor);
  const hallways = floorPlan.hallways;

  function getRoomFill(room: FloorPlanRoom): string {
    if (selectedRoomId === room.id) return "#c8a55c";
    if (highlightedRooms?.[room.id]) return highlightedRooms[room.id];
    return ROOM_TYPE_COLORS[room.type] || "#231c14";
  }

  function getRoomStroke(room: FloorPlanRoom): string {
    if (selectedRoomId === room.id) return "#9a7d3f";
    if (highlightedRooms?.[room.id]) return "#c44536";
    return "#3d3124";
  }

  function getRoomStrokeWidth(room: FloorPlanRoom): number {
    if (selectedRoomId === room.id) return 3;
    if (highlightedRooms?.[room.id]) return 2;
    return 1;
  }

  return (
    <div className="space-y-3">
      {/* Floor Tabs */}
      <Tabs value={activeFloor} onValueChange={setActiveFloor}>
        <TabsList className="w-full bg-[#1a1410] border border-[#3d3124]">
          {floorPlan.floors.map((floor) => (
            <TabsTrigger key={floor} value={floor} className="flex-1 data-[state=active]:bg-[#2d2418] data-[state=active]:text-[#c8a55c] text-[#6b5e4f]">
              Floor {floor}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* SVG Floor Plan */}
      <div className="border border-[#3d3124] rounded-xl overflow-hidden bg-[#1a1410] p-2">
        <svg
          viewBox={floorPlan.svgViewBox}
          className="w-full h-auto touch-manipulation"
          role="img"
          aria-label={`Floor plan of ${building}, Floor ${activeFloor}`}
        >
          {/* Building outline */}
          <rect
            x="5"
            y="5"
            width={parseInt(floorPlan.svgViewBox.split(" ")[2]) - 10}
            height={parseInt(floorPlan.svgViewBox.split(" ")[3]) - 10}
            fill="none"
            stroke="#c8a55c"
            strokeWidth="2"
            rx="6"
          />

          {/* Hallways */}
          {hallways.map((h) => (
            <rect
              key={h.id}
              x={h.x}
              y={h.y}
              width={h.width}
              height={h.height}
              fill="#231c14"
              stroke="#3d3124"
              strokeWidth="0.5"
            />
          ))}

          {/* Central Atrium (Gore Hall) */}
          {building === "Gore Hall" && (
            <g>
              <rect
                x={200}
                y={160}
                width={380}
                height={170}
                fill="#0d0a07"
                stroke="#4d3f30"
                strokeWidth="1"
                strokeDasharray="4 2"
                rx="8"
              />
              <text
                x={390}
                y={245}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill="#6b5e4f"
                fontWeight="500"
              >
                Central Atrium
              </text>
            </g>
          )}

          {/* Rooms */}
          {rooms.map((room) => (
            <g
              key={room.id}
              onClick={() => onRoomSelect?.(room)}
              className={onRoomSelect ? "cursor-pointer" : ""}
              role={onRoomSelect ? "button" : undefined}
              tabIndex={onRoomSelect ? 0 : undefined}
              aria-label={`Room ${room.label}${selectedRoomId === room.id ? " (selected)" : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRoomSelect?.(room);
                }
              }}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={getRoomFill(room)}
                stroke={getRoomStroke(room)}
                strokeWidth={getRoomStrokeWidth(room)}
                rx="4"
                style={{ transition: "fill 0.2s, stroke 0.2s, stroke-width 0.15s" }}
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={room.width < 130 ? "11" : "13"}
                fill={selectedRoomId === room.id ? "#0d0a07" : "#e8d5a3"}
                fontWeight={selectedRoomId === room.id ? "700" : "500"}
                className="pointer-events-none select-none"
              >
                {room.label}
              </text>
              {/* Room type label */}
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fill="#6b5e4f"
                className="pointer-events-none select-none"
              >
                {room.type === "lecture-hall"
                  ? "Lecture Hall"
                  : room.type === "restroom"
                    ? ""
                    : room.type === "stairwell"
                      ? ""
                      : room.type.charAt(0).toUpperCase() + room.type.slice(1)}
              </text>
            </g>
          ))}

          {/* Selected room pulse animation */}
          {selectedRoomId && rooms.find((r) => r.id === selectedRoomId) && (
            <rect
              x={rooms.find((r) => r.id === selectedRoomId)!.x - 2}
              y={rooms.find((r) => r.id === selectedRoomId)!.y - 2}
              width={rooms.find((r) => r.id === selectedRoomId)!.width + 4}
              height={rooms.find((r) => r.id === selectedRoomId)!.height + 4}
              fill="none"
              stroke="#c8a55c"
              strokeWidth="2"
              rx="6"
              opacity="0.6"
            >
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {[
          { label: "Classroom", color: "#e8f4fd" },
          { label: "Lecture Hall", color: "#dbeafe" },
          { label: "Office", color: "#f0fdf4" },
          { label: "Selected", color: "#c8a55c" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-[10px] text-[#9c8e7c]">
            <div
              className="w-3 h-3 rounded border border-[#3d3124]"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
