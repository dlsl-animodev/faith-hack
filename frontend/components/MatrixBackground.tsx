'use client';

import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Column {
  x: number;
  y: number;
  speed: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZE = 14;
const COL_WIDTH = 20;
const FRAME_INTERVAL = 33; // ~30fps

const CHARS =
  '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  'アイウエオカキクケコサシスセソタチツテト' +
  '@#$%&*!?<>/\\|^~`';

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Full-viewport Matrix-style falling character rain.
 * Runs behind all page content (z-index: 0, pointer-events: none).
 * Uses requestAnimationFrame throttled to ~30fps.
 */
export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameId = useRef<number>(0);
  const lastFrame = useRef<number>(0);
  const columns = useRef<Column[]>([]);

  // ── Init columns ──────────────────────────────────────────────────────────

  function initColumns(width: number, height: number) {
    const count = Math.ceil(width / COL_WIDTH);
    columns.current = Array.from({ length: count }, (_, i) => ({
      x: i * COL_WIDTH,
      // Random starting y so columns don't all begin at top simultaneously
      y: Math.random() * -height,
      speed: 1 + Math.random() * 2, // 1–3 rows per frame
    }));
  }

  // ── Draw frame ────────────────────────────────────────────────────────────

  function draw(ctx: CanvasRenderingContext2D, height: number) {
    // Semi-transparent black overlay creates the trail/fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.fillRect(0, 0, ctx.canvas.width, height);

    ctx.font = `${FONT_SIZE}px Consolas, 'Courier New', monospace`;

    for (const col of columns.current) {
      // Draw trail — fading characters above the lead
      const trailLength = 20;
      for (let i = 1; i <= trailLength; i++) {
        const trailY = col.y - i * FONT_SIZE;
        if (trailY < 0) continue;
        const alpha = 1 - i / trailLength;
        ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.12})`;
        ctx.fillText(randomChar(), col.x, trailY);
      }

      // Draw lead character — dim white or green
      if (col.y > 0) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 255, 65, 0.20)';
        ctx.fillText(randomChar(), col.x, col.y);
      }

      // Advance column
      col.y += col.speed * FONT_SIZE;

      // Reset column when it scrolls off-screen
      if (col.y > height + FONT_SIZE * 20) {
        col.y = Math.random() * -height * 0.5;
        col.speed = 1 + Math.random() * 2;
      }
    }
  }

  // ── Animation loop ────────────────────────────────────────────────────────

  function animate(now: number) {
    // Throttle to ~30fps
    if (now - lastFrame.current < FRAME_INTERVAL) {
      frameId.current = requestAnimationFrame(animate);
      return;
    }
    lastFrame.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx, canvas.height);
    frameId.current = requestAnimationFrame(animate);
  }

  // ── Effect: mount & resize ────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initColumns(canvas.width, canvas.height);
    };

    setSize();

    // Start animation
    frameId.current = requestAnimationFrame(animate);

    const onResize = () => {
      cancelAnimationFrame(frameId.current);
      setSize();
      frameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        
      }}
      aria-hidden="true"
    />
  );
}
