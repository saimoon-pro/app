import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';

function useProfileSize() {
  const [size, setSize] = useState(300);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (w < 380) {
        setSize(142);
      } else if (w < 480) {
        setSize(160);
      } else if (w < 640) {
        setSize(180);
      } else if (w < 768) {
        setSize(200);
      } else if (w < 1024) {
        setSize(225);
      } else {
        const availableH = h - 165;
        const maxRadiusByH = (availableH / 2) - 62;
        const maxRadiusByW = (w * 0.46 / 2) - 45;
        const radius = Math.round(Math.max(160, Math.min(245, Math.min(maxRadiusByH, maxRadiusByW))));
        // Perfectly proportional center machine guaranteeing clean 30px+ clearance to outer orbit cogs
        setSize(Math.round(radius * 1.3));
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

export default function ProfileMachine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const profileSize = useProfileSize();

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

  // Proportions: Image takes up the maximum visual area, tightly framed by cyber rings
  const cyanRingInset = Math.max(4, Math.round(profileSize * 0.022));
  const innerDecorInset = Math.max(8, Math.round(profileSize * 0.042));
  const imageInset = Math.max(12, Math.round(profileSize * 0.065));
  const imageSize = profileSize - imageInset * 2;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: profileSize,
        height: profileSize,
        opacity: reducedMotion ? 1 : 0,
      }}
    >
      {/* Radio Wave Rings expanding from behind the enlarged image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 0.8, 1.6, 2.4, 3.2].map((delay, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: imageSize,
              height: imageSize,
              border: '1.5px solid rgba(0, 229, 255, 0.35)',
              animation: reducedMotion ? 'none' : `radio-wave 4s ease-out ${delay}s infinite`,
              opacity: reducedMotion ? 0.1 : undefined,
            }}
          />
        ))}
      </div>

      {/* Outer Ring with Tick Marks */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '1px dashed rgba(0, 200, 83, 0.3)',
          animation: reducedMotion ? 'none' : 'machine-rotate 30s linear infinite',
        }}
      >
        {/* Tick marks via conic gradient mask */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg 2deg, rgba(0, 200, 83, 0.25) 2deg 4deg, transparent 4deg 8deg)',
            WebkitMask: 'radial-gradient(transparent 72%, black 73%, black 74%, transparent 75%)',
            mask: 'radial-gradient(transparent 72%, black 73%, black 74%, transparent 75%)',
          }}
        />
      </div>

      {/* Middle Counter-Rotating Cyan Accent Ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: cyanRingInset,
          border: '2px solid transparent',
          borderTopColor: 'rgba(0, 229, 255, 0.5)',
          borderBottomColor: 'rgba(0, 229, 255, 0.2)',
          animation: reducedMotion ? 'none' : 'machine-rotate-reverse 15s linear infinite',
        }}
      />

      {/* Inner Decorative Ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: innerDecorInset,
          border: '1px solid rgba(0, 200, 83, 0.25)',
          background: 'radial-gradient(circle, rgba(0, 200, 83, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Enlarged Prominent Profile Image Wrapper */}
      <div
        className="absolute rounded-full overflow-hidden transition-all duration-300"
        style={{
          inset: imageInset,
          border: '2.5px solid rgba(0, 230, 118, 0.7)',
          boxShadow: '0 0 35px rgba(0, 200, 83, 0.4), 0 0 70px rgba(0, 200, 83, 0.2), inset 0 0 25px rgba(0, 0, 0, 0.3)',
          animation: reducedMotion ? 'none' : 'profile-breathe 4s ease-in-out infinite',
        }}
      >
        <img
          src={assetUrl('images/profile-photo.png')}
          alt="Muhammad Saimoon Hassan — Professional Video Editor, UI/UX Designer, Web Developer & AI Automation Expert from Bangladesh"
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="eager"
          fetchPriority="high"
          width={imageSize}
          height={imageSize}
          decoding="async"
        />
      </div>
    </div>
  );
}
