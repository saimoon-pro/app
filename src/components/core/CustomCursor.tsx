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
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;

  const activeHover = isHovered || storeHover;

  useEffect(() => {
    // Check for touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let raf: number;
    const animate = () => {
      // Fluid magnetic lerp for outer ring
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.22;

      const dotSize = activeHover ? 18 : 13;
      const ringSize = activeHover ? (isMouseDown ? 46 : 58) : (isMouseDown ? 26 : 38);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - dotSize / 2}px, ${
          pos.current.y - dotSize / 2
        }px) scale(${isMouseDown ? 0.78 : 1})`;
        dotRef.current.style.width = `${dotSize}px`;
        dotRef.current.style.height = `${dotSize}px`;
        dotRef.current.style.opacity = isVisible ? '1' : '0';
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - ringSize / 2}px, ${
          ringPos.current.y - ringSize / 2
        }px) scale(${isMouseDown ? 0.85 : 1})`;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
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
    ? '0 0 16px rgba(0, 102, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 0 8px rgba(0, 102, 255, 0.3)'
    : '0 0 20px rgba(0, 255, 102, 0.75), 0 2px 10px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 255, 102, 0.35)';

  const themeRingBg = activeHover
    ? isDay
      ? 'rgba(0, 102, 255, 0.12)'
      : 'rgba(0, 255, 102, 0.15)'
    : 'transparent';

  return (
    <>
      {/* High-Contrast Core Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center transition-all duration-150 ease-out"
        style={{
          background: themeDotBg,
          border: '2px solid #FFFFFF',
          boxShadow: themeDotShadow,
        }}
      >
        {/* Precision Center Reticle Light Core */}
        <div
          className="w-1.5 h-1.5 rounded-full bg-white transition-transform duration-150 pointer-events-none"
          style={{
            transform: activeHover ? 'scale(1.4)' : 'scale(1)',
            boxShadow: '0 0 4px #FFFFFF',
          }}
        />
      </div>

      {/* High-Contrast Magnetic Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full backdrop-blur-[1px] transition-[width,height,opacity,background-color] duration-200 ease-out"
        style={{
          border: themeRingBorder,
          boxShadow: themeRingShadow,
          backgroundColor: themeRingBg,
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
