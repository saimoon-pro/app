import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import gsap from 'gsap';

export default function ProfileMachine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;

    // Entrance animation
    const tl = gsap.timeline({ delay: 0.9 });
    tl.fromTo(
      containerRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );

    return () => { tl.kill(); };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: 320,
        height: 320,
        opacity: reducedMotion ? 1 : 0,
      }}
    >
      {/* Radio Wave Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 0.8, 1.6, 2.4, 3.2].map((delay, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              border: '1px solid rgba(0, 229, 255, 0.3)',
              animation: reducedMotion ? 'none' : `radio-wave 4s ease-out ${delay}s infinite`,
              opacity: reducedMotion ? 0.1 : undefined,
            }}
          />
        ))}
      </div>

      {/* Outer Ring with Tick Marks */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: '1px dashed rgba(0, 200, 83, 0.25)',
          animation: reducedMotion ? 'none' : 'machine-rotate 30s linear infinite',
        }}
      >
        {/* Tick marks via conic gradient mask */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg 2deg, rgba(0, 200, 83, 0.2) 2deg 4deg, transparent 4deg 8deg)',
            WebkitMask: 'radial-gradient(transparent 62%, black 63%, black 64%, transparent 65%)',
            mask: 'radial-gradient(transparent 62%, black 63%, black 64%, transparent 65%)',
          }}
        />
      </div>

      {/* Middle Counter-Rotating Ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 20,
          border: '2px solid transparent',
          borderTopColor: 'rgba(0, 229, 255, 0.4)',
          borderBottomColor: 'rgba(0, 229, 255, 0.15)',
          animation: reducedMotion ? 'none' : 'machine-rotate-reverse 15s linear infinite',
        }}
      />

      {/* Inner Decorative Ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 40,
          border: '1px solid rgba(0, 200, 83, 0.15)',
          background: 'radial-gradient(circle, rgba(0, 200, 83, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Profile Image Wrapper */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: 80,
          border: '2px solid rgba(0, 200, 83, 0.3)',
          boxShadow: '0 0 40px rgba(0, 200, 83, 0.15), inset 0 0 30px rgba(0, 200, 83, 0.08)',
          animation: reducedMotion ? 'none' : 'profile-breathe 4s ease-in-out infinite',
        }}
      >
        <img
          src="/images/profile-photo.jpg"
          alt="Muhammad Saimoon Hassan"
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Center Pulsing Dot */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: 8,
          height: 8,
          background: '#00C853',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 12px rgba(0, 200, 83, 0.6)',
          animation: reducedMotion ? 'none' : 'pulse-glow 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}
