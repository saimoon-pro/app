import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const storeHover = useStore((s) => s.cursorHover);
  const isDay = useStore((s) => s.timeOfDay >= 7.5 && s.timeOfDay <= 17.5);

  const activeHover = isHovered || storeHover;

  useEffect(() => {
    // Check for touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const dotSize = activeHover ? 18 : 13;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Instant 1:1 hardware coordinate update for dot (zero lag)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - dotSize / 2}px, ${
          e.clientY - dotSize / 2
        }px, 0) scale(${isMouseDown ? 0.78 : 1})`;
        dotRef.current.style.opacity = '1';
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable = target.closest(
        'button, a, input, textarea, select, [role="button"], .cursor-pointer, .clickable'
      );
      setIsHovered(!!isClickable);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let raf: number;
    let currentScale = 0.95;

    const animate = () => {
      // Snappy GPU lerp for outer follower ring
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.35;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.35;

      const targetScale = activeHover
        ? (isMouseDown ? 1.15 : 1.4)
        : (isMouseDown ? 0.65 : 0.95);
      currentScale += (targetScale - currentScale) * 0.25;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 20}px, ${
          ringPos.current.y - 20
        }px, 0) scale(${currentScale.toFixed(3)})`;
        ringRef.current.style.opacity = isVisible ? (activeHover ? '1' : '0.85') : '0';
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(raf);
    };
  }, [activeHover, isMouseDown, isVisible]);

  // Hide on touch devices
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  // Day Theme: Vivid Royal Blue (#0066FF) with Crisp White Border & Deep Shadow
  // Night Theme: High-Luminance Neon Emerald (#00FF66) with Pure White Core & Cosmic Glow
  const themeDotBg = isDay ? '#0066FF' : '#00FF66';
  const themeDotShadow = isDay
    ? '0 0 10px rgba(0, 102, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px #FFFFFF'
    : '0 0 14px #00FF66, 0 0 24px rgba(0, 255, 102, 0.7), 0 2px 8px rgba(0, 0, 0, 0.9), inset 0 1px 2px #FFFFFF';

  const themeRingBorder = isDay
    ? '2.5px solid #0066FF'
    : '2.5px solid #00FF66';

  const themeRingShadow = isDay
    ? '0 0 14px rgba(0, 102, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.2)'
    : '0 0 16px rgba(0, 255, 102, 0.6), 0 2px 8px rgba(0, 0, 0, 0.6)';

  const themeRingBg = activeHover
    ? isDay
      ? 'rgba(0, 102, 255, 0.12)'
      : 'rgba(0, 255, 102, 0.15)'
    : 'transparent';

  const dotSize = activeHover ? 18 : 13;

  return (
    <>
      {/* High-Contrast Core Dot - Instant Hardware Tracking */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center will-change-transform"
        style={{
          width: dotSize,
          height: dotSize,
          background: themeDotBg,
          border: '2px solid #FFFFFF',
          boxShadow: themeDotShadow,
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        {/* Precision Center Reticle Light Core */}
        <div
          className="w-1.5 h-1.5 rounded-full bg-white pointer-events-none"
          style={{
            transform: activeHover ? 'scale(1.4)' : 'scale(1)',
            boxShadow: '0 0 4px #FFFFFF',
          }}
        />
      </div>

      {/* High-Contrast Magnetic Outer Ring - Zero Backdrop Blur, Pure GPU Transform */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full will-change-transform transition-[opacity,background-color] duration-150 ease-out"
        style={{
          width: 40,
          height: 40,
          border: themeRingBorder,
          boxShadow: themeRingShadow,
          backgroundColor: themeRingBg,
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      />

      {/* Hide default cursor on desktop, allow on touch */}
      <style>{`
        * { cursor: none !important; }
        @media (pointer: coarse) {
          * { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
