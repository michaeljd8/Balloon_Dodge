import { getDifficultyState, clamp, randomInt, rectsOverlap } from './gameLogic';

describe('getDifficultyState', () => {
  test('keeps difficulty unchanged before game starts', () => {
    expect(getDifficultyState(1, false, 1)).toEqual({ lineGen: 1, endGame: false });
  });

  test('increases line generation pace over time', () => {
    expect(getDifficultyState(2, false, 1)).toEqual({ lineGen: 6, endGame: false });
    expect(getDifficultyState(31, false, 6)).toEqual({ lineGen: 5, endGame: false });
    expect(getDifficultyState(61, false, 5)).toEqual({ lineGen: 4, endGame: false });
  });

  test('starts end-game blitz at 90 seconds', () => {
    expect(getDifficultyState(90, false, 4)).toEqual({ lineGen: 4, endGame: true });
  });

  test('does not reset endGame once set', () => {
    expect(getDifficultyState(95, true, 4)).toEqual({ lineGen: 4, endGame: true });
  });
});

describe('clamp', () => {
  test('constrains values to the provided range', () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
    expect(clamp(15, 10, 20)).toBe(15);
  });
});

describe('randomInt', () => {
  test('returns values in range', () => {
    for (let i = 0; i < 50; i++) {
      const v = randomInt(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe('rectsOverlap', () => {
  test('returns true for overlapping rectangles', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
  });

  test('returns false for non-overlapping rectangles', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 10, h: 10 })).toBe(false);
  });
});
