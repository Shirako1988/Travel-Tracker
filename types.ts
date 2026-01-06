export enum TravelPace {
  FAST = 'Fast',
  NORMAL = 'Normal',
  SLOW = 'Slow'
}

export interface PaceDetails {
  speed: number; // miles per hour
  effect: string;
  milesPerDay: number; // assuming 8 hours
}

export interface TravelLogEntry {
  id: string;
  day: number;
  hour: number;
  distanceDelta: number;
  description: string;
  isForcedMarch: boolean;
  conSaveDC?: number;
}

export interface AppState {
  totalDistance: number;
  traveledDistance: number;
  pace: TravelPace;
  day: number;
  hoursTraveledToday: number;
  logs: TravelLogEntry[];
  exhaustion: number; // Just for visual tracking if desired
}