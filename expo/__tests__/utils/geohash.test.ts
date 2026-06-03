import { encodeGeohash, decodeBbox, neighbors, neighborsOf, gh } from '@/utils/geohash';

describe('encodeGeohash', () => {
  it('encodes known coordinates to the correct geohash', () => {
    // Reference values captured from the implementation
    expect(encodeGeohash(37.7749, -122.4194, 6)).toBe('9q8yyk'); // San Francisco, CA
    expect(encodeGeohash(40.7128, -74.006, 6)).toBe('dr5reg');   // New York, NY
    expect(encodeGeohash(51.5074, -0.1278, 6)).toBe('gcpvj0');   // London, UK
  });

  it('produces longer hashes at higher precision', () => {
    const p4 = encodeGeohash(37.7749, -122.4194, 4);
    const p8 = encodeGeohash(37.7749, -122.4194, 8);
    expect(p4).toHaveLength(4);
    expect(p8).toHaveLength(8);
    expect(p8.startsWith(p4)).toBe(true);
  });

  it('uses default precision of 6', () => {
    expect(encodeGeohash(37.7749, -122.4194)).toHaveLength(6);
  });

  it('only uses characters from the base32 alphabet', () => {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    const hash = encodeGeohash(48.8566, 2.3522, 8); // Paris
    for (const ch of hash) {
      expect(BASE32).toContain(ch);
    }
  });

  it('handles edge coordinates: poles and antimeridian', () => {
    expect(() => encodeGeohash(90, 0, 4)).not.toThrow();
    expect(() => encodeGeohash(-90, 0, 4)).not.toThrow();
    expect(() => encodeGeohash(0, 180, 4)).not.toThrow();
    expect(() => encodeGeohash(0, -180, 4)).not.toThrow();
  });

  it('encodes the equator/prime-meridian origin', () => {
    const hash = encodeGeohash(0, 0, 6);
    expect(hash).toHaveLength(6);
    // 0,0 maps to 's00000' prefix area
    expect(hash.startsWith('s')).toBe(true);
  });
});

describe('decodeBbox', () => {
  it('returns a bounding box that contains the original coordinates', () => {
    const lat = 37.7749;
    const lng = -122.4194;
    const hash = encodeGeohash(lat, lng, 6);
    const { latMin, latMax, lonMin, lonMax } = decodeBbox(hash);
    expect(lat).toBeGreaterThanOrEqual(latMin);
    expect(lat).toBeLessThanOrEqual(latMax);
    expect(lng).toBeGreaterThanOrEqual(lonMin);
    expect(lng).toBeLessThanOrEqual(lonMax);
  });

  it('bounding box shrinks as precision increases', () => {
    const lat = 48.8566;
    const lng = 2.3522;
    const bbox4 = decodeBbox(encodeGeohash(lat, lng, 4));
    const bbox8 = decodeBbox(encodeGeohash(lat, lng, 8));
    const area4 = (bbox4.latMax - bbox4.latMin) * (bbox4.lonMax - bbox4.lonMin);
    const area8 = (bbox8.latMax - bbox8.latMin) * (bbox8.lonMax - bbox8.lonMin);
    expect(area8).toBeLessThan(area4);
  });

  it('throws on invalid geohash characters', () => {
    expect(() => decodeBbox('invalid!')).toThrow('Invalid geohash');
  });

  it('round-trips correctly: encode then decode contains original point', () => {
    const cases: [number, number][] = [
      [35.6762, 139.6503],  // Tokyo
      [-33.8688, 151.2093], // Sydney
      [55.7558, 37.6173],   // Moscow
      [-23.5505, -46.6333], // São Paulo
    ];
    for (const [lat, lng] of cases) {
      const hash = encodeGeohash(lat, lng, 7);
      const { latMin, latMax, lonMin, lonMax } = decodeBbox(hash);
      expect(lat).toBeGreaterThanOrEqual(latMin);
      expect(lat).toBeLessThanOrEqual(latMax);
      expect(lng).toBeGreaterThanOrEqual(lonMin);
      expect(lng).toBeLessThanOrEqual(lonMax);
    }
  });
});

describe('neighbors', () => {
  it('returns exactly 8 neighbors', () => {
    const result = neighbors(encodeGeohash(37.7749, -122.4194, 6));
    expect(result).toHaveLength(8);
  });

  it('all neighbors are the same precision as the input', () => {
    const hash = encodeGeohash(37.7749, -122.4194, 6);
    for (const n of neighbors(hash)) {
      expect(n).toHaveLength(hash.length);
    }
  });

  it('all neighbors are unique', () => {
    const hash = encodeGeohash(37.7749, -122.4194, 6);
    const result = neighbors(hash);
    expect(new Set(result).size).toBe(8);
  });

  it('neighborsOf is an alias for neighbors', () => {
    const hash = encodeGeohash(40.7128, -74.006, 6);
    expect(neighborsOf(hash)).toEqual(neighbors(hash));
  });
});

describe('gh helper object', () => {
  it('encodeToPrecision defaults to precision 7', () => {
    expect(gh.encodeToPrecision(37.7749, -122.4194)).toHaveLength(7);
  });

  it('encodeToPrecision respects custom precision', () => {
    expect(gh.encodeToPrecision(37.7749, -122.4194, 5)).toHaveLength(5);
  });

  it('gh.neighbors delegates to neighborsOf', () => {
    const hash = encodeGeohash(37.7749, -122.4194, 6);
    expect(gh.neighbors(hash)).toEqual(neighborsOf(hash));
  });
});
