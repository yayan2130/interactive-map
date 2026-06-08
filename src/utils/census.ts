import { useEffect, useState } from "react";
import { ActivityCycle, CensusMap, Zone } from "../types";

/**
 * From an establishment's activities, pick the one whose next cycle is soonest.
 * "Now" (nextCycleStartsAt === null) wins; otherwise smallest minutes.
 */
export function pickSoonest(
  activities: ActivityCycle[]
): ActivityCycle | null {
  if (!activities.length) return null;
  return [...activities].sort((a, b) => {
    const av = a.nextCycleStartsAt === null ? -1 : a.minutesForTheNextCycle ?? Infinity;
    const bv = b.nextCycleStartsAt === null ? -1 : b.minutesForTheNextCycle ?? Infinity;
    return av - bv;
  })[0];
}

/**
 * Resolve a zone's establishmentId. Prefers the explicit `establishment_id`
 * field, falling back to the `p=<hex>` value embedded in the fib URL.
 */
export function getEstablishmentId(zone: Zone | null): string | null {
  if (!zone) return null;
  if (zone.establishment_id) return zone.establishment_id;
  const match = zone.fib?.match(/[?&]p=([0-9a-fA-F]+)/);
  return match ? match[1] : null;
}

/**
 * Poll the static census.json (written by scraper/fetchCensus.js) on an
 * interval and return a map keyed by establishmentId.
 */
export function useCensus(intervalMs = 60000): CensusMap {
  const [census, setCensus] = useState<CensusMap>({});

  useEffect(() => {
    let cancelled = false;
    const url = `${import.meta.env.BASE_URL}census.json`;

    const load = async () => {
      try {
        const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.establishments) {
          setCensus(data.establishments as CensusMap);
        }
      } catch {
        // census.json may not exist yet — leave the map empty
      }
    };

    load();
    const timer = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return census;
}
