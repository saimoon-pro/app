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

    // Create particles
    const particleCount = window.innerWidth < 768 ? 20 : window.innerWidth < 1024 ? 40 : 70;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.12 + 0.06,
      });
    }

    const mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        if (!reducedMotion) {
          // Mouse repulsion
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100 * 0.5;
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
        ctx.fillStyle = `rgba(0, 200, 83, ${p.opacity})`;
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
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
