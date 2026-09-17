import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidRoleBadgeProps {
  roles: string[];
  currentIndex: number;
  onSelectIndex?: (index: number) => void;
  onNext?: () => void;
  isDay: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function LiquidRoleBadge({
  roles,
  currentIndex,
  onSelectIndex,
  onNext,
  isDay,
  size = 'md',
  className = '',
}: LiquidRoleBadgeProps) {
  const isSm = size === 'sm';
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Horizontal padding to add to measured text width (for pill capsule breathing room)
  const paddingH = isSm ? 30 : 38;
  const minWidth = isSm ? 120 : 150;

  // Measure text dimensions for each role
  const measureAll = useCallback(() => {
    if (!measureContainerRef.current) return;
    const spans = measureContainerRef.current.querySelectorAll<HTMLSpanElement>('.measure-role-item');
    const measured: number[] = [];
    spans.forEach((span) => {
      // Use getBoundingClientRect for sub-pixel accuracy
      const rect = span.getBoundingClientRect();
      measured.push(Math.ceil(rect.width));
    });
    if (measured.length > 0) {
      setWidths(measured);
    }
  }, []);

  useLayoutEffect(() => {
    measureAll();
  }, [measureAll, roles, size]);

  useEffect(() => {
    // Re-measure on window resize or when fonts finish loading
    window.addEventListener('resize', measureAll);
    if ('fonts' in document) {
      document.fonts.ready.then(measureAll);
    }
    return () => window.removeEventListener('resize', measureAll);
  }, [measureAll]);

  const currentMeasuredWidth = widths[currentIndex]
    ? Math.max(minWidth, widths[currentIndex] + paddingH)
    : undefined;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev.slice(-2), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);

    if (onNext) {
      onNext();
    } else if (onSelectIndex) {
      onSelectIndex((currentIndex + 1) % roles.length);
    }
  };

  const activeColor = isDay ? '#0066FF' : '#00FF66';
  const inactiveDotBg = isDay ? 'rgba(0, 102, 255, 0.25)' : 'rgba(0, 200, 83, 0.25)';

  return (
    <div className={`inline-flex items-center ${isSm ? 'gap-2' : 'gap-3'} ${className}`}>
      {/* Hidden off-screen measurement elements with exact font styling */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          visibility: 'hidden',
          pointerEvents: 'none',
          height: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {roles.map((role, idx) => (
          <span
            key={idx}
            className={`measure-role-item font-mono font-black uppercase ${
              isSm ? 'text-xs tracking-wider' : 'text-sm tracking-widest'
            }`}
          >
            {role}
          </span>
        ))}
      </div>

      {/* Main Liquid Morph Glass Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        title="Click to switch discipline"
        aria-label={`Current discipline: ${roles[currentIndex]}. Click to switch.`}
        animate={{
          width: currentMeasuredWidth ?? 'auto',
          scaleY: [1, 0.94, 1.025, 0.99, 1],
        }}
        transition={{
          width: {
            type: 'spring',
            stiffness: 240,
            damping: 22,
            mass: 0.85,
          },
          scaleY: {
            duration: 0.48,
            ease: [0.25, 1, 0.35, 1],
          },
        }}
        whileHover={{
          scale: 1.035,
          y: -1.5,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        whileTap={{
          scale: 0.96,
          y: 0.5,
          transition: { duration: 0.1 },
        }}
        style={{
          height: isSm ? 32 : 40,
        }}
        className={`group relative overflow-hidden rounded-full cursor-pointer select-none flex items-center justify-center ${
          isDay ? 'liquid-glass-btn-day' : 'liquid-glass-btn-night'
        }`}
      >
        {/* Ambient liquid glow layer behind glass */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isDay
              ? 'radial-gradient(ellipse at center, rgba(0, 102, 255, 0.16) 0%, rgba(255, 255, 255, 0) 75%)'
              : 'radial-gradient(ellipse at center, rgba(0, 255, 102, 0.2) 0%, rgba(0, 0, 0, 0) 75%)',
          }}
        />

        {/* Diagonal Liquid Specular Wave Sweep on role transition */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`sheen-${currentIndex}`}
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '230%', opacity: [0, 0.85, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-y-0 w-1/2 pointer-events-none skew-x-[-22deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
            }}
          />
        </AnimatePresence>

        {/* Interactive Click Water Ripple */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              borderRadius: '50%',
              background: isDay
                ? 'radial-gradient(circle, rgba(0, 102, 255, 0.45) 0%, rgba(255,255,255,0.8) 50%, transparent 80%)'
                : 'radial-gradient(circle, rgba(0, 255, 102, 0.5) 0%, rgba(255,255,255,0.8) 50%, transparent 80%)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Text Container with smooth liquid blur crossfade */}
        <div
          className={`relative z-10 font-mono font-extrabold uppercase whitespace-nowrap px-3.5 flex items-center justify-center ${
            isSm ? 'text-xs tracking-wider' : 'text-sm sm:text-[15px] tracking-widest'
          }`}
          style={{
            color: activeColor,
            textShadow: isDay
              ? '0 1px 1px rgba(255, 255, 255, 0.9), 0 0 6px rgba(0, 102, 255, 0.2)'
              : '0 0 8px rgba(0, 255, 102, 0.5), 0 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={currentIndex}
              initial={{
                opacity: 0,
                y: 6,
                filter: 'blur(3.5px)',
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -6,
                filter: 'blur(3.5px)',
                scale: 0.97,
              }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block whitespace-nowrap"
            >
              {roles[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Role Navigation Dots Indicator */}
      <div className={`flex items-center ${isSm ? 'gap-1' : 'gap-1.5'}`}>
        {roles.map((_, i) => {
          const isActive = i === currentIndex;
          const targetWidth = isActive ? (isSm ? 14 : 18) : (isSm ? 3.5 : 4);
          const targetHeight = isSm ? 3.5 : 4;

          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onSelectIndex?.(i)}
              aria-label={`Jump to ${roles[i]}`}
              animate={{
                width: targetWidth,
                height: targetHeight,
                backgroundColor: isActive ? activeColor : inactiveDotBg,
                boxShadow: isActive
                  ? isDay
                    ? '0 0 8px #0066FF'
                    : '0 0 8px #00FF66'
                  : 'none',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 24,
                mass: 0.6,
              }}
              whileHover={{
                scale: 1.25,
                backgroundColor: activeColor,
              }}
              className="rounded-full cursor-pointer p-0 border-none outline-none focus:outline-none"
            />
          );
        })}
      </div>
    </div>
  );
}
