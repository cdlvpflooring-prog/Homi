import { generateCode } from '@/hooks/useReferral';

const SAFE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ─── generateCode ─────────────────────────────────────────────────────────

describe('generateCode', () => {
  it('always returns a 6-character string', () => {
    expect(generateCode('PLATE1')).toHaveLength(6);
    expect(generateCode('abc123')).toHaveLength(6);
    expect(generateCode('')).toHaveLength(6);
    expect(generateCode()).toHaveLength(6);
  });

  it('only uses characters from the safe alphabet (no 0, O, I, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode(`seed-${i}`);
      for (const ch of code) {
        expect(SAFE_ALPHABET).toContain(ch);
      }
    }
  });

  it('does not contain ambiguous characters 0, O, I, 1', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode(`seed-${i}`);
      expect(code).not.toMatch(/[0OI1]/);
    }
  });

  it('is deterministic: same seed → same code', () => {
    const code1 = generateCode('ABC-123');
    const code2 = generateCode('ABC-123');
    expect(code1).toBe(code2);
  });

  it('different seeds produce different codes', () => {
    const codes = new Set(
      Array.from({ length: 20 }, (_, i) => generateCode(`seed-${i}`))
    );
    // Highly unlikely all 20 are the same; expect reasonable diversity
    expect(codes.size).toBeGreaterThan(10);
  });

  it('normalizes the seed by stripping non-alphanumeric characters', () => {
    // "ABC-123" and "ABC123" should strip to the same base and produce the same code
    expect(generateCode('ABC-123')).toBe(generateCode('ABC123'));
    expect(generateCode('hello world')).toBe(generateCode('helloworld'));
  });

  it('handles plate-like seeds correctly', () => {
    const code = generateCode('CA·ABC1234');
    expect(code).toHaveLength(6);
    for (const ch of code) {
      expect(SAFE_ALPHABET).toContain(ch);
    }
  });

  it('output is uppercase', () => {
    const code = generateCode('test-seed');
    expect(code).toBe(code.toUpperCase());
  });

  it('generates a code even when called with no seed (uses Date.now/random)', () => {
    const code = generateCode();
    expect(code).toHaveLength(6);
    for (const ch of code) {
      expect(SAFE_ALPHABET).toContain(ch);
    }
  });
});
