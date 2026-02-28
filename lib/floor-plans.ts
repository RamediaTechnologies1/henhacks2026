import type { BuildingFloorPlan, FloorPlanRoom, FloorPlanHallway } from "./types";

// Gore Hall - 3 floors, central atrium, classrooms + seminar rooms
// Based on real Gore Hall at UDel: classrooms, case-study rooms, central atrium
const GORE_HALL_ROOMS: FloorPlanRoom[] = [
  // Floor 1
  { id: "GOR-101", label: "101", type: "classroom", x: 20, y: 380, width: 170, height: 90, floor: "1" },
  { id: "GOR-102", label: "102", type: "classroom", x: 200, y: 380, width: 170, height: 90, floor: "1" },
  { id: "GOR-103", label: "103", type: "classroom", x: 380, y: 380, width: 170, height: 90, floor: "1" },
  { id: "GOR-104", label: "104", type: "classroom", x: 560, y: 380, width: 170, height: 90, floor: "1" },
  { id: "GOR-105", label: "105", type: "classroom", x: 20, y: 20, width: 170, height: 90, floor: "1" },
  { id: "GOR-106", label: "106", type: "classroom", x: 200, y: 20, width: 170, height: 90, floor: "1" },
  { id: "GOR-107", label: "107", type: "seminar", x: 380, y: 20, width: 170, height: 90, floor: "1" },
  { id: "GOR-108", label: "108", type: "seminar", x: 560, y: 20, width: 170, height: 90, floor: "1" },
  { id: "GOR-109", label: "109", type: "classroom", x: 640, y: 140, width: 130, height: 90, floor: "1" },
  { id: "GOR-110", label: "110", type: "classroom", x: 640, y: 250, width: 130, height: 90, floor: "1" },
  { id: "GOR-1WC", label: "WC", type: "restroom", x: 20, y: 140, width: 100, height: 70, floor: "1" },
  { id: "GOR-111", label: "111", type: "office", x: 20, y: 230, width: 100, height: 80, floor: "1" },

  // Floor 2
  { id: "GOR-201", label: "201", type: "classroom", x: 20, y: 380, width: 170, height: 90, floor: "2" },
  { id: "GOR-202", label: "202", type: "classroom", x: 200, y: 380, width: 170, height: 90, floor: "2" },
  { id: "GOR-203", label: "203", type: "classroom", x: 380, y: 380, width: 170, height: 90, floor: "2" },
  { id: "GOR-204", label: "204", type: "seminar", x: 560, y: 380, width: 170, height: 90, floor: "2" },
  { id: "GOR-205", label: "205", type: "classroom", x: 20, y: 20, width: 170, height: 90, floor: "2" },
  { id: "GOR-206", label: "206", type: "classroom", x: 200, y: 20, width: 170, height: 90, floor: "2" },
  { id: "GOR-207", label: "207", type: "seminar", x: 380, y: 20, width: 170, height: 90, floor: "2" },
  { id: "GOR-208", label: "208", type: "office", x: 560, y: 20, width: 170, height: 90, floor: "2" },
  { id: "GOR-209", label: "209", type: "classroom", x: 640, y: 140, width: 130, height: 90, floor: "2" },
  { id: "GOR-210", label: "210", type: "office", x: 640, y: 250, width: 130, height: 90, floor: "2" },
  { id: "GOR-2WC", label: "WC", type: "restroom", x: 20, y: 140, width: 100, height: 70, floor: "2" },
  { id: "GOR-211", label: "211", type: "office", x: 20, y: 230, width: 100, height: 80, floor: "2" },

  // Floor 3
  { id: "GOR-301", label: "301", type: "classroom", x: 20, y: 380, width: 170, height: 90, floor: "3" },
  { id: "GOR-302", label: "302", type: "classroom", x: 200, y: 380, width: 170, height: 90, floor: "3" },
  { id: "GOR-303", label: "303", type: "seminar", x: 380, y: 380, width: 170, height: 90, floor: "3" },
  { id: "GOR-304", label: "304", type: "seminar", x: 560, y: 380, width: 170, height: 90, floor: "3" },
  { id: "GOR-305", label: "305", type: "classroom", x: 20, y: 20, width: 170, height: 90, floor: "3" },
  { id: "GOR-306", label: "306", type: "office", x: 200, y: 20, width: 170, height: 90, floor: "3" },
  { id: "GOR-307", label: "307", type: "office", x: 380, y: 20, width: 170, height: 90, floor: "3" },
  { id: "GOR-318", label: "318", type: "classroom", x: 560, y: 20, width: 170, height: 90, floor: "3" },
  { id: "GOR-309", label: "309", type: "utility", x: 640, y: 140, width: 130, height: 90, floor: "3" },
  { id: "GOR-310", label: "310", type: "office", x: 640, y: 250, width: 130, height: 90, floor: "3" },
  { id: "GOR-3WC", label: "WC", type: "restroom", x: 20, y: 140, width: 100, height: 70, floor: "3" },
  { id: "GOR-311", label: "311", type: "utility", x: 20, y: 230, width: 100, height: 80, floor: "3" },
];

const GORE_HALL_HALLWAYS: FloorPlanHallway[] = [
  { id: "GOR-H1", x: 20, y: 115, width: 750, height: 22 },
  { id: "GOR-H2", x: 20, y: 355, width: 750, height: 22 },
  { id: "GOR-H3", x: 125, y: 137, width: 22, height: 218 },
  { id: "GOR-H4", x: 635, y: 137, width: 22, height: 218 },
];

// Smith Hall - 3 floors, large lecture halls, Starbucks, bridge to Gore
const SMITH_HALL_ROOMS: FloorPlanRoom[] = [
  // Floor 1
  { id: "SMI-120", label: "120", type: "lecture-hall", x: 20, y: 20, width: 340, height: 150, floor: "1" },
  { id: "SMI-130", label: "130", type: "lecture-hall", x: 20, y: 190, width: 340, height: 150, floor: "1" },
  { id: "SMI-140", label: "140", type: "lecture-hall", x: 420, y: 20, width: 180, height: 120, floor: "1" },
  { id: "SMI-141", label: "141", type: "classroom", x: 420, y: 160, width: 180, height: 100, floor: "1" },
  { id: "SMI-SBX", label: "Starbucks", type: "common", x: 420, y: 280, width: 180, height: 100, floor: "1" },
  { id: "SMI-1WC", label: "WC", type: "restroom", x: 640, y: 200, width: 120, height: 60, floor: "1" },
  { id: "SMI-1ST", label: "Stairs", type: "stairwell", x: 640, y: 280, width: 120, height: 80, floor: "1" },
  { id: "SMI-BRG", label: "Bridge to Gore", type: "hallway", x: 640, y: 80, width: 130, height: 40, floor: "1" },

  // Floor 2
  { id: "SMI-220", label: "220", type: "classroom", x: 20, y: 20, width: 170, height: 140, floor: "2" },
  { id: "SMI-221", label: "221", type: "classroom", x: 200, y: 20, width: 160, height: 140, floor: "2" },
  { id: "SMI-230", label: "230", type: "classroom", x: 20, y: 190, width: 170, height: 140, floor: "2" },
  { id: "SMI-231", label: "231", type: "seminar", x: 200, y: 190, width: 160, height: 140, floor: "2" },
  { id: "SMI-240", label: "240", type: "classroom", x: 420, y: 20, width: 180, height: 120, floor: "2" },
  { id: "SMI-241", label: "241", type: "office", x: 420, y: 160, width: 180, height: 100, floor: "2" },
  { id: "SMI-242", label: "242", type: "office", x: 420, y: 280, width: 180, height: 100, floor: "2" },
  { id: "SMI-2WC", label: "WC", type: "restroom", x: 640, y: 200, width: 120, height: 60, floor: "2" },
  { id: "SMI-2ST", label: "Stairs", type: "stairwell", x: 640, y: 280, width: 120, height: 80, floor: "2" },

  // Floor 3
  { id: "SMI-320", label: "320", type: "office", x: 20, y: 20, width: 170, height: 140, floor: "3" },
  { id: "SMI-321", label: "321", type: "office", x: 200, y: 20, width: 160, height: 140, floor: "3" },
  { id: "SMI-330", label: "330", type: "office", x: 20, y: 190, width: 170, height: 140, floor: "3" },
  { id: "SMI-331", label: "331", type: "utility", x: 200, y: 190, width: 160, height: 140, floor: "3" },
  { id: "SMI-340", label: "340", type: "office", x: 420, y: 20, width: 180, height: 120, floor: "3" },
  { id: "SMI-341", label: "341", type: "utility", x: 420, y: 160, width: 180, height: 100, floor: "3" },
  { id: "SMI-342", label: "342", type: "office", x: 420, y: 280, width: 180, height: 100, floor: "3" },
  { id: "SMI-3WC", label: "WC", type: "restroom", x: 640, y: 200, width: 120, height: 60, floor: "3" },
  { id: "SMI-3ST", label: "Stairs", type: "stairwell", x: 640, y: 280, width: 120, height: 80, floor: "3" },
];

const SMITH_HALL_HALLWAYS: FloorPlanHallway[] = [
  { id: "SMI-H1", x: 370, y: 20, width: 40, height: 360 },
  { id: "SMI-H2", x: 610, y: 20, width: 22, height: 360 },
];

export const GORE_HALL: BuildingFloorPlan = {
  building: "Gore Hall",
  floors: ["1", "2", "3"],
  svgViewBox: "0 0 790 490",
  rooms: GORE_HALL_ROOMS,
  hallways: GORE_HALL_HALLWAYS,
};

export const SMITH_HALL: BuildingFloorPlan = {
  building: "Smith Hall",
  floors: ["1", "2", "3"],
  svgViewBox: "0 0 790 400",
  rooms: SMITH_HALL_ROOMS,
  hallways: SMITH_HALL_HALLWAYS,
};

export const FLOOR_PLANS: Record<string, BuildingFloorPlan> = {
  "Gore Hall": GORE_HALL,
  "Smith Hall": SMITH_HALL,
};

export function hasFloorPlan(building: string): boolean {
  return building in FLOOR_PLANS;
}

export function getFloorPlan(building: string): BuildingFloorPlan | null {
  return FLOOR_PLANS[building] || null;
}

// Room type colors for display
export const ROOM_TYPE_COLORS: Record<string, string> = {
  classroom: "#e8f4fd",
  seminar: "#e0f2fe",
  "lecture-hall": "#dbeafe",
  office: "#f0fdf4",
  restroom: "#fef3c7",
  utility: "#f3e8ff",
  common: "#fce7f3",
  hallway: "#f5f5f5",
  stairwell: "#f1f5f9",
};
