import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Optimized particle count for high frame rate
    const particleCount = window.innerWidth < 768 ? 15 : 28;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.8 + 1.2,
        opacity: Math.random() * 0.1 + 0.05,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let raf: number;
    const animate = () => {
      if (document.hidden || !useStore.getState().introCompleted) {
        raf = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (!reducedMotion) {
          // Optimized squared-distance repulsion check
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100 * 0.4;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          // Apply velocity
          p.x += p.vx;
          p.y += p.vy;

          // Damping
          p.vx *= 0.99;
          p.vy *= 0.99;

          // Wrap around
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDay
          ? `rgba(0, 102, 255, ${p.opacity * 1.5})`
          : `rgba(0, 200, 83, ${p.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isDay]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
