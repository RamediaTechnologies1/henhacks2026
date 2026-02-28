import type { Trade } from "./types";

export const UDEL_MAP_CENTER: [number, number] = [39.6795, -75.7528];
export const UDEL_MAP_ZOOM = 15;

export const UDEL_BUILDINGS: { name: string; lat: number; lng: number }[] = [
  { name: "Gore Hall", lat: 39.6812, lng: -75.7528 },
  { name: "Smith Hall", lat: 39.6800, lng: -75.7520 },
  { name: "Memorial Hall", lat: 39.6795, lng: -75.7515 },
  { name: "Perkins Student Center", lat: 39.6790, lng: -75.7535 },
  { name: "Morris Library", lat: 39.6805, lng: -75.7530 },
  { name: "Trabant University Center", lat: 39.6783, lng: -75.7510 },
  { name: "ISE Lab", lat: 39.6778, lng: -75.7505 },
  { name: "Evans Hall", lat: 39.6815, lng: -75.7540 },
  { name: "Brown Lab", lat: 39.6808, lng: -75.7525 },
  { name: "Colburn Lab", lat: 39.6803, lng: -75.7518 },
  { name: "Spencer Lab", lat: 39.6798, lng: -75.7512 },
  { name: "DuPont Hall", lat: 39.6810, lng: -75.7535 },
  { name: "Sharp Lab", lat: 39.6807, lng: -75.7522 },
  { name: "Purnell Hall", lat: 39.6792, lng: -75.7508 },
  { name: "Kirkbride Hall", lat: 39.6788, lng: -75.7502 },
  { name: "Mitchell Hall", lat: 39.6785, lng: -75.7530 },
  { name: "Willard Hall", lat: 39.6813, lng: -75.7532 },
  { name: "STAR Campus", lat: 39.6740, lng: -75.7460 },
  { name: "Carpenter Sports Building", lat: 39.6760, lng: -75.7550 },
  { name: "Christiana Towers", lat: 39.6710, lng: -75.7490 },
  { name: "Campus Center", lat: 39.6780, lng: -75.7506 },
];

export const DEPARTMENT_EMAIL: Record<Trade, string> = {
  plumbing: "plumbing-team@facilities.udel.edu",
  electrical: "electrical-team@facilities.udel.edu",
  hvac: "hvac-team@facilities.udel.edu",
  structural: "structural-team@facilities.udel.edu",
  custodial: "custodial-team@facilities.udel.edu",
  landscaping: "grounds-team@facilities.udel.edu",
  safety_hazard: "safety@facilities.udel.edu",
};

export const PRIORITY_BASE_SCORE: Record<string, number> = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 1,
};

// Deduplication window: same building + same trade within 7 days
export const DEDUP_WINDOW_DAYS = 7;

// Pattern detection: 3+ reports same trade in 90 days → preventive maintenance alert
export const PATTERN_THRESHOLD = 3;
export const PATTERN_WINDOW_DAYS = 90;

export const UDEL_COLORS = {
  blue: "#00539F",
  gold: "#FFD200",
};
