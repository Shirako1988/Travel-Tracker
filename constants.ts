import { PaceDetails, TravelPace } from './types';

export const PACE_RULES: Record<TravelPace, PaceDetails> = {
  [TravelPace.FAST]: {
    speed: 4,
    milesPerDay: 30,
    effect: "-5 penalty to passive Wisdom (Perception)"
  },
  [TravelPace.NORMAL]: {
    speed: 3,
    milesPerDay: 24,
    effect: "None"
  },
  [TravelPace.SLOW]: {
    speed: 2,
    milesPerDay: 18,
    effect: "Able to use stealth"
  }
};

export const MAX_TRAVEL_HOURS = 8;
export const FORCED_MARCH_BASE_DC = 10;
export const FORCED_MARCH_DC_INC = 1;