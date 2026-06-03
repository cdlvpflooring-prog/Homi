import { safeJsonParse, upsertEvent, computeGeohash6, computeNeighborChannels } from '@/utils/eventsStore';
import type { EventItem } from '@/types/events';

// Prevent the corruption handler from actually clearing storage/reloading in tests
jest.useFakeTimers();

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 'evt-1',
    type: 'hazard',
    lat: 37.7749,
    lng: -122.4194,
    geohash: '9q8yy9',
    details: {},
    confidence: 1,
    reports_count: 1,
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// ─── safeJsonParse ──────────────────────────────────────────────────────────

describe('safeJsonParse', () => {
  describe('valid inputs', () => {
    it('parses a JSON object string', () => {
      expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    });

    it('parses a JSON array string', () => {
      expect(safeJsonParse('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('parses a JSON number string', () => {
      expect(safeJsonParse('42')).toBe(42);
    });

    it('parses "true" string to boolean true', () => {
      expect(safeJsonParse('true')).toBe(true);
    });

    it('parses "false" string to boolean false', () => {
      expect(safeJsonParse('false')).toBe(false);
    });

    it('parses a JSON string literal', () => {
      expect(safeJsonParse('"hello"')).toBe('hello');
    });

    it('returns a custom fallback type correctly', () => {
      expect(safeJsonParse('{"x":5}', { x: 0 })).toEqual({ x: 5 });
    });
  });

  describe('empty / null inputs', () => {
    it('returns fallback for null', () => {
      expect(safeJsonParse(null)).toBeNull();
      expect(safeJsonParse(null, false)).toBe(false);
    });

    it('returns fallback for empty string', () => {
      expect(safeJsonParse('')).toBeNull();
    });

    it('returns fallback for whitespace-only string', () => {
      expect(safeJsonParse('   ')).toBeNull();
    });
  });

  describe('corrupted data patterns', () => {
    const CORRUPTED = ['object', 'undefined', '[object Object]', 'NaN', 'function', 'null'];

    for (const pattern of CORRUPTED) {
      it(`returns fallback for corrupted pattern: "${pattern}"`, () => {
        const result = safeJsonParse(pattern, 'fallback');
        expect(result).toBe('fallback');
      });
    }

    it('returns fallback for the single "o" corruption', () => {
      expect(safeJsonParse('o', 'fallback')).toBe('fallback');
    });

    it('returns fallback for incomplete JSON', () => {
      // Short strings that are not valid JSON
      expect(safeJsonParse('x', 'fallback')).toBe('fallback');
    });
  });

  describe('invalid JSON strings', () => {
    it('returns fallback for malformed JSON', () => {
      expect(safeJsonParse('{bad json}', 'fallback')).toBe('fallback');
    });

    it('returns fallback for truncated JSON', () => {
      expect(safeJsonParse('{"a":', 'fallback')).toBe('fallback');
    });
  });

  describe('fallback parameter', () => {
    it('uses provided fallback value', () => {
      expect(safeJsonParse(null, [])).toEqual([]);
      expect(safeJsonParse(null, 99)).toBe(99);
      expect(safeJsonParse(null, { default: true })).toEqual({ default: true });
    });
  });
});

// ─── upsertEvent ────────────────────────────────────────────────────────────

describe('upsertEvent', () => {
  it('inserts a new event into an empty record', () => {
    const evt = makeEvent({ id: 'new-1' });
    const result = upsertEvent({}, evt);
    expect(result['new-1']).toEqual(evt);
  });

  it('merges fields when the event already exists', () => {
    const original = makeEvent({ id: 'e1', reports_count: 1 });
    const current = { e1: original };
    const incoming = makeEvent({ id: 'e1', reports_count: 5, confidence: 0.9 });
    const result = upsertEvent(current, incoming);
    expect(result['e1'].reports_count).toBe(5);
    expect(result['e1'].confidence).toBe(0.9);
    // Original fields not in incoming are preserved (spread semantics)
    expect(result['e1'].id).toBe('e1');
  });

  it('does not mutate the original record', () => {
    const original = makeEvent({ id: 'e1' });
    const current = { e1: original };
    const incoming = makeEvent({ id: 'e1', reports_count: 99 });
    upsertEvent(current, incoming);
    expect(current['e1'].reports_count).toBe(1);
  });

  it('preserves unrelated events when inserting', () => {
    const existing = makeEvent({ id: 'existing' });
    const incoming = makeEvent({ id: 'new' });
    const result = upsertEvent({ existing }, incoming);
    expect(result['existing']).toEqual(existing);
    expect(result['new']).toEqual(incoming);
  });

  it('preserves unrelated events when updating', () => {
    const a = makeEvent({ id: 'a' });
    const b = makeEvent({ id: 'b' });
    const updatedA = makeEvent({ id: 'a', reports_count: 10 });
    const result = upsertEvent({ a, b }, updatedA);
    expect(result['b']).toEqual(b);
  });
});

// ─── computeGeohash6 ────────────────────────────────────────────────────────

describe('computeGeohash6', () => {
  it('returns a 6-character geohash', () => {
    expect(computeGeohash6(37.7749, -122.4194)).toHaveLength(6);
  });

  it('returns the same result as encodeGeohash at precision 6', () => {
    const { encodeGeohash } = require('@/utils/geohash');
    expect(computeGeohash6(40.7128, -74.006)).toBe(encodeGeohash(40.7128, -74.006, 6));
  });
});

// ─── computeNeighborChannels ─────────────────────────────────────────────────

describe('computeNeighborChannels', () => {
  it('returns 9 channels (center + 8 neighbors)', () => {
    const channels = computeNeighborChannels(37.7749, -122.4194);
    expect(channels).toHaveLength(9);
  });

  it('first element is the center geohash', () => {
    const center = computeGeohash6(37.7749, -122.4194);
    const channels = computeNeighborChannels(37.7749, -122.4194);
    expect(channels[0]).toBe(center);
  });

  it('all channels are 6-character geohashes', () => {
    const channels = computeNeighborChannels(51.5074, -0.1278);
    for (const ch of channels) {
      expect(ch).toHaveLength(6);
    }
  });

  it('all channels are unique', () => {
    const channels = computeNeighborChannels(35.6762, 139.6503);
    expect(new Set(channels).size).toBe(9);
  });
});
