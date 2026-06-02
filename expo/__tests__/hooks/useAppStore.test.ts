import { computeRatingTotals, computeCommunityScoreFromRatings } from '@/hooks/useAppStore';
import type { PlateRating } from '@/types';

function makeRating(rating: number, id = Math.random().toString()): PlateRating {
  return {
    id,
    fromPlate: 'ABC123',
    toPlate: 'XYZ789',
    rating,
    comment: '',
    interactionType: 'message',
    timestamp: new Date().toISOString(),
    isAnonymous: false,
  };
}

// ─── computeRatingTotals ──────────────────────────────────────────────────

describe('computeRatingTotals', () => {
  it('returns zeros for an empty array', () => {
    const result = computeRatingTotals([]);
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
    expect(result.averageRating).toBe(0);
    expect(result.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('calculates correct average for a single rating', () => {
    const result = computeRatingTotals([makeRating(4)]);
    expect(result.count).toBe(1);
    expect(result.averageRating).toBe(4);
    expect(result.sum).toBe(4);
  });

  it('calculates correct average for multiple ratings', () => {
    const ratings = [makeRating(2), makeRating(4), makeRating(3)];
    const result = computeRatingTotals(ratings);
    expect(result.count).toBe(3);
    expect(result.sum).toBe(9);
    expect(result.averageRating).toBeCloseTo(3);
  });

  it('builds the correct distribution', () => {
    const ratings = [makeRating(1), makeRating(1), makeRating(3), makeRating(5)];
    const result = computeRatingTotals(ratings);
    expect(result.distribution[1]).toBe(2);
    expect(result.distribution[2]).toBe(0);
    expect(result.distribution[3]).toBe(1);
    expect(result.distribution[4]).toBe(0);
    expect(result.distribution[5]).toBe(1);
  });

  it('clamps out-of-range ratings: below 1 → 1', () => {
    const result = computeRatingTotals([makeRating(0)]);
    expect(result.distribution[1]).toBe(1);
    expect(result.distribution[5]).toBe(0);
  });

  it('clamps out-of-range ratings: above 5 → 5', () => {
    const result = computeRatingTotals([makeRating(10)]);
    expect(result.distribution[5]).toBe(1);
    expect(result.sum).toBe(10); // sum uses raw value; distribution uses clamped
  });

  it('handles floating point ratings by rounding for distribution', () => {
    // 3.6 rounds to 4; 2.4 rounds to 2
    const result = computeRatingTotals([makeRating(3.6), makeRating(2.4)]);
    expect(result.distribution[4]).toBe(1);
    expect(result.distribution[2]).toBe(1);
  });

  it('all-5 ratings → average of 5', () => {
    const ratings = Array.from({ length: 10 }, () => makeRating(5));
    const result = computeRatingTotals(ratings);
    expect(result.averageRating).toBe(5);
    expect(result.distribution[5]).toBe(10);
  });
});

// ─── computeCommunityScoreFromRatings ─────────────────────────────────────

describe('computeCommunityScoreFromRatings', () => {
  it('returns 0 for an empty array', () => {
    expect(computeCommunityScoreFromRatings([])).toBe(0);
  });

  it('each rating contributes basePoints(10) + rating * 5', () => {
    // Single rating of 3: 10 + 3*5 = 25
    expect(computeCommunityScoreFromRatings([makeRating(3)])).toBe(25);
  });

  it('accumulates scores across multiple ratings', () => {
    // rating 1: 10 + 5 = 15; rating 5: 10 + 25 = 35; total = 50
    expect(computeCommunityScoreFromRatings([makeRating(1), makeRating(5)])).toBe(50);
  });

  it('score increases with higher ratings', () => {
    const lowScore = computeCommunityScoreFromRatings([makeRating(1)]);
    const highScore = computeCommunityScoreFromRatings([makeRating(5)]);
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('is linear: N identical ratings = N × single rating score', () => {
    const single = computeCommunityScoreFromRatings([makeRating(4)]);
    const triple = computeCommunityScoreFromRatings([makeRating(4), makeRating(4), makeRating(4)]);
    expect(triple).toBe(single * 3);
  });
});
