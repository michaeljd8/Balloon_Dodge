(function (global) {
  function getDifficultyState(elapsedTime, endGame, currentLineGen) {
    var nextLineGen = currentLineGen;
    var nextEndGame = endGame;

    if (elapsedTime > 1 && endGame === false) {
      nextLineGen = 6;
      if (elapsedTime > 30) {
        nextLineGen = 5;
        if (elapsedTime > 60) {
          nextLineGen = 4;
          if (elapsedTime >= 90) {
            nextEndGame = true;
          }
        }
      }
    }

    return {
      lineGen: nextLineGen,
      endGame: nextEndGame
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  var api = {
    getDifficultyState: getDifficultyState,
    clamp: clamp
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.GameLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
