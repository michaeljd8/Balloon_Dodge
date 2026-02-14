const test = require('node:test');
const assert = require('node:assert/strict');
const { getDifficultyState, clamp } = require('./gameLogic');

test('getDifficultyState keeps difficulty unchanged before game starts', () => {
  assert.deepEqual(getDifficultyState(1, false, 1), { lineGen: 1, endGame: false });
});

test('getDifficultyState increases line generation pace over time', () => {
  assert.deepEqual(getDifficultyState(2, false, 1), { lineGen: 6, endGame: false });
  assert.deepEqual(getDifficultyState(31, false, 6), { lineGen: 5, endGame: false });
  assert.deepEqual(getDifficultyState(61, false, 5), { lineGen: 4, endGame: false });
});

test('getDifficultyState starts end-game blitz at 90 seconds', () => {
  assert.deepEqual(getDifficultyState(90, false, 4), { lineGen: 4, endGame: true });
});

test('clamp constrains values to the provided range', () => {
  assert.equal(clamp(5, 10, 20), 10);
  assert.equal(clamp(25, 10, 20), 20);
  assert.equal(clamp(15, 10, 20), 15);
});
