/**
 * Pure game-logic helpers for Line Dodge.
 * Kept free of React / DOM so they can be unit-tested in Node.
 */

/**
 * Return the next difficulty state based on elapsed seconds.
 *
 * Timeline (matches the original Phaser game):
 *   0-1 s  → lineGen stays at its initial value
 *   2-30 s → lineGen = 6
 *  31-60 s → lineGen = 5
 *  61-89 s → lineGen = 4
 *  ≥ 90 s  → endGame = true  (blitz mode)
 */
export function getDifficultyState(elapsedTime, endGame, currentLineGen) {
  let nextLineGen = currentLineGen;
  let nextEndGame = endGame;

  if (elapsedTime > 1 && endGame === false) {
    nextLineGen = 6;
    if (elapsedTime > 30) {
      nextLineGen = 5;
      if (elapsedTime > 45) {
        nextEndGame = true;
        if (elapsedTime >= 90) {
          nextEndGame = true;
        }
      }
    }
  }

  return { lineGen: nextLineGen, endGame: nextEndGame };
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Return a random integer in [min, max]. */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Axis-aligned bounding-box overlap check. */
export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
