import React, { useRef, useEffect, useCallback, useState } from 'react';
import { getDifficultyState, clamp, randomInt, rectsOverlap } from './gameLogic';

/* ── constants ──────────────────────────────────────────── */
const DRAG = 0.99;
const SET_VEL = 75;
const INITIAL_SCORE_OFFSET = 85; // original game started the score at 85

/* ── component ──────────────────────────────────────────── */
export default function Game() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null); // mutable game state lives here
  const rafRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | playing | over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem('highScore');
    return stored ? Number(stored) : 0;
  });

  /* ── helpers ──────────────────────────────────────────── */
  const getSize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const headerH = vh * 0.25; // header + score area
    const size = Math.min(vw, vh - headerH);
    return size;
  }, []);

  /* ── initialise / reset mutable state ─────────────────── */
  const initState = useCallback(() => {
    const size = getSize();
    const radius = size * 0.05;
    return {
      size,
      // circle
      cx: size / 2,
      cy: size / 2,
      radius,
      velx: randomInt(-75, 75),
      vely: randomInt(-75, 75),
      moveDirection: null,
      // lines
      lines: [],
      lineGen: 1,
      lineVelMin: 2,
      lineVelMax: 200,
      lineColor: '#ff0000',
      lastLineTime: performance.now(),
      // difficulty
      startTime: performance.now(),
      endGame: false,
      blitzCounter: 0,
      blitzTimer: 500,
      startBlitz: true,
      nextBlitz: 0,
      bgColor: '#000000',
    };
  }, [getSize]);

  /* ── line factory ─────────────────────────────────────── */
  const createLines = (s) => {
    const size = s.size;
    const mkW = () => randomInt(size * 0.1, size * 0.25);
    const thin = size * 0.01;
    const rndY = () => randomInt(size * 0.1, size * 0.9);
    const rndX = () => randomInt(size * 0.1, size * 0.9);

    // horizontal from left
    s.lines.push({
      x: -size * 0.25,
      y: rndY(),
      w: mkW(),
      h: thin,
      vx: randomInt(s.lineVelMin, s.lineVelMax),
      vy: 0,
    });
    // horizontal from right
    s.lines.push({
      x: size + size * 0.25,
      y: rndY(),
      w: mkW(),
      h: thin,
      vx: -randomInt(s.lineVelMin, s.lineVelMax),
      vy: 0,
    });
    // vertical from top
    s.lines.push({
      x: rndX(),
      y: -size * 0.25,
      w: thin,
      h: mkW(),
      vx: 0,
      vy: randomInt(s.lineVelMin, s.lineVelMax),
    });
    // vertical from bottom
    s.lines.push({
      x: rndX(),
      y: size + size * 0.25,
      w: thin,
      h: mkW(),
      vx: 0,
      vy: -randomInt(s.lineVelMin, s.lineVelMax),
    });
  };

  /* ── game loop ────────────────────────────────────────── */
  const loop = useCallback(
    (now) => {
      const s = stateRef.current;
      if (!s) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = s.size;
      const dt = 1 / 60; // fixed step (≈ 60 fps)

      /* elapsed seconds */
      const elapsed =
        INITIAL_SCORE_OFFSET +
        Math.floor((now - s.startTime) / 1000);
      setScore(elapsed);

      /* difficulty */
      const diff = getDifficultyState(elapsed, s.endGame, s.lineGen);
      s.lineGen = diff.lineGen;
      s.endGame = diff.endGame;

      /* blitz mode */
      if (s.endGame) {
        s.blitzCounter++;
        if (s.startBlitz) {
          s.lines = [];
          s.bgColor = '#ff0000';
          s.lineColor = '#000000';
          s.startBlitz = false;
        }
        s.lineGen = 2;
        s.lineVelMin = 250;
        s.lineVelMax = 300;

        if (s.blitzCounter >= s.blitzTimer) {
          s.bgColor = '#000000';
          s.lineColor = '#ff0000';
          s.lineGen = 4;
          s.lineVelMin = 2;
          s.lineVelMax = 200;
          s.nextBlitz =
            s.blitzTimer + randomInt(1500, 2500);
          if (s.blitzCounter >= s.nextBlitz) {
            s.startBlitz = true;
            s.blitzTimer = randomInt(400, 1000);
            s.blitzCounter = 0;
          }
        }
      }

      /* spawn lines */
      const lineTimer = (now - s.lastLineTime) / 1000;
      if (lineTimer >= s.lineGen) {
        createLines(s);
        s.lastLineTime = now;
      }

      /* move lines & cull off-screen */
      s.lines.forEach((l) => {
        l.x += l.vx * dt;
        l.y += l.vy * dt;
      });
      s.lines = s.lines.filter(
        (l) =>
          l.x + l.w > -size * 0.5 &&
          l.x < size * 1.5 &&
          l.y + l.h > -size * 0.5 &&
          l.y < size * 1.5
      );

      /* move circle */
      s.velx *= DRAG;
      s.vely *= DRAG;
      s.cx += s.velx * dt;
      s.cy += s.vely * dt;
      s.cx = clamp(s.cx, s.radius, size - s.radius);
      s.cy = clamp(s.cy, s.radius, size - s.radius);

      /* collision */
      const circleBox = {
        x: s.cx - s.radius,
        y: s.cy - s.radius,
        w: s.radius * 2,
        h: s.radius * 2,
      };
      for (const l of s.lines) {
        if (rectsOverlap(circleBox, l)) {
          // game over
          const hs = Math.max(elapsed, highScore);
          setHighScore(hs);
          localStorage.setItem('highScore', String(hs));
          setPhase('over');
          stateRef.current = null;
          return; // stop loop
        }
      }

      /* ── draw ──────────────────────────────────────────── */
      ctx.fillStyle = s.bgColor;
      ctx.fillRect(0, 0, size, size);

      // lines
      ctx.fillStyle = s.lineColor;
      s.lines.forEach((l) => ctx.fillRect(l.x, l.y, l.w, l.h));

      // circle
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // corner buttons (visual only — touch handled by overlays)
      const btnSize = size * 0.12;
      const positions = [
        [0, 0],
        [size - btnSize, 0],
        [0, size - btnSize],
        [size - btnSize, size - btnSize],
      ];
      const arrows = ['↘', '↙', '↗', '↖'];
      positions.forEach(([bx, by], i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(bx, by, btnSize, btnSize);
        ctx.fillStyle = '#4444ff';
        ctx.font = `${btnSize * 0.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arrows[i], bx + btnSize / 2, by + btnSize / 2);
      });

      rafRef.current = requestAnimationFrame(loop);
    },
    [highScore, setHighScore, setPhase, setScore]
  );

  /* ── button handlers ──────────────────────────────────── */
  const nudge = (dvx, dvy) => {
    const s = stateRef.current;
    if (!s) return;
    s.velx += dvx;
    s.vely += dvy;
  };

  /* ── start / restart ──────────────────────────────────── */
  const startGame = useCallback(() => {
    const s = initState();
    stateRef.current = s;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = s.size;
      canvas.height = s.size;
    }
    setPhase('playing');
    setScore(INITIAL_SCORE_OFFSET);
    rafRef.current = requestAnimationFrame(loop);
  }, [initState, loop]);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* resize handler */
  useEffect(() => {
    const onResize = () => {
      if (stateRef.current) {
        const newSize = getSize();
        const ratio = newSize / stateRef.current.size;
        stateRef.current.size = newSize;
        stateRef.current.radius = newSize * 0.05;
        stateRef.current.cx *= ratio;
        stateRef.current.cy *= ratio;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = newSize;
          canvas.height = newSize;
        }
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getSize]);

  /* ── render ───────────────────────────────────────────── */
  const size = getSize();
  const btnSize = size * 0.12;

  return (
    <div className="game-wrapper">
      {/* header */}
      <div className="header">
        <h1>LINE DODGE!</h1>
      </div>

      {/* score row */}
      <div className="score-row">
        <div className="score-box">Score: {score}</div>
        <div className="score-box">High Score: {highScore}</div>
      </div>

      {/* canvas area */}
      <div className="canvas-area" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} width={size} height={size} />

        {/* overlay buttons — only visible while playing */}
        {phase === 'playing' && (
          <>
            <button
              className="ctrl-btn tl"
              style={{ width: btnSize, height: btnSize }}
              onPointerDown={() => nudge(SET_VEL, SET_VEL)}
              aria-label="Move down-right"
            />
            <button
              className="ctrl-btn tr"
              style={{ width: btnSize, height: btnSize }}
              onPointerDown={() => nudge(-SET_VEL, SET_VEL)}
              aria-label="Move down-left"
            />
            <button
              className="ctrl-btn bl"
              style={{ width: btnSize, height: btnSize }}
              onPointerDown={() => nudge(SET_VEL, -SET_VEL)}
              aria-label="Move up-right"
            />
            <button
              className="ctrl-btn br"
              style={{ width: btnSize, height: btnSize }}
              onPointerDown={() => nudge(-SET_VEL, -SET_VEL)}
              aria-label="Move up-left"
            />
          </>
        )}

        {/* start / game-over overlay */}
        {phase === 'idle' && (
          <button className="overlay-btn" onClick={startGame}>
            Start Game
          </button>
        )}
        {phase === 'over' && (
          <button className="overlay-btn" onClick={startGame}>
            GAME OVER!<br />Restart
          </button>
        )}
      </div>
    </div>
  );
}
