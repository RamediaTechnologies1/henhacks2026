import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UDEL_BUILDINGS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestBuilding(
  lat: number,
  lng: number,
  maxDistance: number = 200
): { building: string; distance: number } | null {
  let nearest: { building: string; distance: number } | null = null;

  for (const bldg of UDEL_BUILDINGS) {
    const dist = haversineDistance(lat, lng, bldg.lat, bldg.lng);
    if (!nearest || dist < nearest.distance) {
      nearest = { building: bldg.name, distance: dist };
    }
  }

  if (nearest && nearest.distance > maxDistance) {
    return null;
  }

  return nearest;
}
