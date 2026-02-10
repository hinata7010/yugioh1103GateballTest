import type { Deck } from './deck';

export interface MatchResult {
  deck: Deck;
  distance: number;
  matchPercentage: number;
}
