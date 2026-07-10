export interface ActivityCycle {
  activityId: string | null;
  name: string | null;
  nextCycleStartsAt: string | null;
  minutesForTheNextCycle: number | null;
  display: string; // "Now" or "10 min"
}

export interface EstablishmentCensus {
  zoneId?: string;
  activities: ActivityCycle[];
}

// Keyed by establishmentId (the `p=` value from a zone's fib URL)
export type CensusMap = Record<string, EstablishmentCensus>;

export interface Zone {
  id: string;
  name?: string;
  image?: string;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  activity?: string;
  rotate?: boolean;
  description: {
    id: string;
    en: string;
  };
  video?: string;
  videoPortrait?: boolean;
  fib?: string;
  fib2?: string;
  fibLabel?: string;
  fib2Label?: string;
  establishment_id?: string;
  tags?: string[];
  menu?: string;
}
