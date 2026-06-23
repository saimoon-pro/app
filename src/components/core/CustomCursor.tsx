import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const cursorHover = useStore((s) => s.cursorHover);

  useEffect(() => {
    // Check for touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', onMouseMove);

    let raf: number;
    const animate = () => {
      // Lerp ring position
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        const ringSize = cursorHover ? 40 : 20;
        ringRef.current.style.transform = `translate(${ringPos.current.x - ringSize / 2}px, ${ringPos.current.y - ringSize / 2}px)`;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.opacity = cursorHover ? '0.6' : '0.3';
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [cursorHover]);

  // Hide on touch devices
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: 8,
          height: 8,
          background: '#00C853',
          boxShadow: '0 0 8px rgba(0, 200, 83, 0.4)',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          width: 20,
          height: 20,
          border: '2px solid rgba(0, 200, 83, 0.3)',
          transition: 'width 0.3s, height 0.3s, opacity 0.3s',
        }}
      />
      {/* Hide default cursor */}
      <style>{`
        * { cursor: none !important; }
        @media (pointer: coarse) {
          * { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
