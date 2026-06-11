import { useEffect, useState } from "react";
import { ActivityCycle, CensusMap, Zone } from "../types";

/**
 * Choose the activity to summarize on the zone badge.
 *
 * A zone counts as free ("Now") only when EVERY activity is idle — no running
 * cycle (nextCycleStartsAt === null, shown as "Now"). If any activity is mid-
 * cycle we surface its countdown instead (the soonest one), so a "Now" badge
 * always means the whole zone is open and never hides a session in progress.
 */
export function pickSoonest(
  activities: ActivityCycle[]
): ActivityCycle | null {
  if (!activities.length) return null;
  const running = activities.filter((a) => a.nextCycleStartsAt !== null);
  if (running.length === 0) return activities[0]; // all free -> "Now"
  return running.reduce((soonest, a) =>
    (a.minutesForTheNextCycle ?? Infinity) <
    (soonest.minutesForTheNextCycle ?? Infinity)
      ? a
      : soonest
  );
}

/** Pull the `p=<hex>` establishmentId out of a fib/CensusDisplay URL. */
function parseEstablishmentId(url?: string): string | null {
  const match = url?.match(/[?&]p=([0-9a-fA-F]+)/);
  return match ? match[1] : null;
}

/**
 * Resolve a zone's primary establishmentId. Prefers the explicit
 * `establishment_id` field, falling back to the `p=<hex>` value in the fib URL.
 */
export function getEstablishmentId(zone: Zone | null): string | null {
  if (!zone) return null;
  if (zone.establishment_id) return zone.establishment_id;
  return parseEstablishmentId(zone.fib);
}

/** The second establishmentId for combined zones (from the `fib2` URL). */
export function getSecondEstablishmentId(zone: Zone | null): string | null {
  return parseEstablishmentId(zone?.fib2);
}

/**
 * All distinct establishmentIds a zone draws census from (primary + fib2).
 * Used to aggregate cycles for the map badge.
 */
export function getEstablishmentIds(zone: Zone | null): string[] {
  const ids: string[] = [];
  const primary = getEstablishmentId(zone);
  if (primary) ids.push(primary);
  const second = getSecondEstablishmentId(zone);
  if (second && !ids.includes(second)) ids.push(second);
  return ids;
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
