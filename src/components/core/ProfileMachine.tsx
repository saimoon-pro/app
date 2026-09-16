import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import gsap from 'gsap';

function useProfileSize() {
  const [size, setSize] = useState(320);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const min = Math.min(w, h);

      if (min < 480) {
        setSize(175);
      } else if (min < 640) {
        setSize(200);
      } else if (min < 768) {
        setSize(230);
      } else if (h < 700) {
        setSize(270);
      } else if (min < 1024) {
        setSize(280);
      } else if (w < 1440) {
        setSize(310);
      } else {
        setSize(340);
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

  // Inset ratios relative to size
  const innerRingInset = Math.round(profileSize * 0.0625);  // 20/320
  const decorRingInset = Math.round(profileSize * 0.125);   // 40/320
  const imageInset = Math.round(profileSize * 0.25);         // 80/320
  const waveSize = Math.round(profileSize * 0.3125);         // 100/320

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
      {/* Radio Wave Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 0.8, 1.6, 2.4, 3.2].map((delay, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: waveSize,
              height: waveSize,
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
          inset: innerRingInset,
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
          inset: decorRingInset,
          border: '1px solid rgba(0, 200, 83, 0.15)',
          background: 'radial-gradient(circle, rgba(0, 200, 83, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Profile Image Wrapper */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: imageInset,
          border: '2px solid rgba(0, 200, 83, 0.3)',
          boxShadow: '0 0 40px rgba(0, 200, 83, 0.15), inset 0 0 30px rgba(0, 200, 83, 0.08)',
          animation: reducedMotion ? 'none' : 'profile-breathe 4s ease-in-out infinite',
        }}
      >
        <img
          src={assetUrl('images/profile-photo.jpg')}
          alt="Muhammad Saimoon Hassan — Professional Video Editor, UI/UX Designer, Web Developer & AI Automation Expert from Bangladesh"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width={profileSize - imageInset * 2}
          height={profileSize - imageInset * 2}
          decoding="async"
        />
      </div>
    </div>
  );
}
