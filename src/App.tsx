import { useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sheetsService } from '@/services/googleSheets';
import ProfileMachine from '@/components/core/ProfileMachine';
import OrbitalNav from '@/components/core/OrbitalNav';
import ContentPanel from '@/components/core/ContentPanel';
import CustomCursor from '@/components/core/CustomCursor';
import ParticleField from '@/components/core/ParticleField';
import gsap from 'gsap';

const ROLES = [
  'Video Editor',
  'Motion Designer',
  'UI-UX Designer',
  'Web Developer',
  'AI Automation Founder',
];

// Self-contained orbital section with explicit height so it never bleeds into siblings
// Height = (radius * 2 + 80) for the orbital ring + 40px for bottom node label overhang
function MobileOrbital({ setCursorHover }: { setCursorHover: (v: boolean) => void }) {
  const [orbitalHeight, setOrbitalHeight] = useState(400);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // OrbitalNav total size = radius*2 + 80; add ~40px for label text below bottom node
      if (w < 400) setOrbitalHeight(340);        // radius=110 → 300 + 40
      else if (w < 480) setOrbitalHeight(360);   // radius=110 → 300 + 60
      else if (w < 600) setOrbitalHeight(400);   // radius=130 → 340 + 60
      else setOrbitalHeight(450);                // radius=155 → 390 + 60
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: '100%', height: orbitalHeight }}
    >
      <div className="relative">
        <ProfileMachine />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onMouseEnter={() => setCursorHover(true)}
          onMouseLeave={() => setCursorHover(false)}
        >
          <OrbitalNav />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [, setLoaded] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleSound = useStore((s) => s.toggleSound);
  const setContent = useStore((s) => s.setContent);
  const setIsLoading = useStore((s) => s.setIsLoading);
  const setCursorHover = useStore((s) => s.setCursorHover);
  const reducedMotion = useStore((s) => s.reducedMotion);
  useReducedMotion();

  // Load content from CMS
  useEffect(() => {
    const load = async () => {
      try {
        const content = await sheetsService.getContent();
        setContent(content);
      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    const interval = sheetsService.startPolling(() => {
      sheetsService.getContent().then(setContent);
    });

    return () => clearInterval(interval);
  }, [setContent, setIsLoading]);

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.to('.bg-gradient-wash', { opacity: 1, duration: 0.8, ease: 'power2.out' });

    const nameLetters = document.querySelectorAll('.name-letter');
    tl.fromTo(
      nameLetters,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' },
      '-=0.4'
    );

    tl.fromTo(
      '.designation',
      { opacity: 0, y: 10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    tl.fromTo(
      '.role-ticker',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    tl.fromTo(
      '.tagline',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    tl.fromTo(
      '.services-headline',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.3'
    );

    tl.eventCallback('onComplete', () => setLoaded(true));

    return () => { tl.kill(); };
  }, []);

  // Role ticker rotation
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Mouse move for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    useStore.getState().setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#F8FAFB' }}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient Background */}
      <div
        className="bg-gradient-wash absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 40% 50%, rgba(0, 200, 83, 0.04) 0%, transparent 50%)',
          opacity: 0,
        }}
      />

      <ParticleField />

      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.015,
        }}
      />

      {/* ===================== MOBILE LAYOUT (< 1024px) ===================== */}
      <div className="relative z-10 flex flex-col items-center h-full lg:hidden overflow-y-auto overflow-x-hidden mobile-layout-scroll">

        {/* ── TOP SPACER ── */}
        <div style={{ height: 32, flexShrink: 0 }} />

        {/* ── SECTION 1: Name · Designation · Role ── */}
        <div className="flex flex-col items-center gap-2 px-6 text-center" style={{ flexShrink: 0 }}>
          <h1
            className="font-display font-bold tracking-tight"
            style={{ lineHeight: 1.08, color: '#0A1A0F' }}
          >
            <span className="block" style={{ fontSize: 'clamp(32px, 9vw, 50px)' }}>
              {'Muhammad'.split('').map((char, i) => (
                <span key={`m${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>{char}</span>
              ))}
            </span>
            <span className="block" style={{ fontSize: 'clamp(32px, 9vw, 50px)' }}>
              {'Saimoon Hassan'.split('').map((char, i) => (
                <span key={`s${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Designation */}
          <div className="designation flex items-center gap-2" style={{ opacity: 0 }}>
            <div style={{ width: 24, height: 1, background: '#00C853' }} />
            <span className="font-display font-medium uppercase tracking-widest" style={{ fontSize: 11, color: '#00C853' }}>
              Creative Editor
            </span>
            <div style={{ width: 24, height: 1, background: '#00C853' }} />
          </div>

          {/* Role Ticker */}
          <div className="role-ticker flex items-center gap-2" style={{ opacity: 0 }}>
            <span
              className="font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ fontSize: 9, background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
            >
              {ROLES[roleIndex]}
            </span>
            <div className="flex gap-0.5">
              {ROLES.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300" style={{
                  width: i === roleIndex ? 10 : 3, height: 3,
                  background: i === roleIndex ? '#00C853' : 'rgba(0, 200, 83, 0.2)',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: 32, flexShrink: 0 }} />

        {/* ── SECTION 2: "Services" headline ── */}
        <div className="services-headline flex flex-col items-center gap-1" style={{ flexShrink: 0, opacity: 0 }}>
          <span className="font-mono uppercase tracking-[0.22em]" style={{ fontSize: 9, color: 'rgba(90,122,106,0.5)' }}>
            — explore my —
          </span>
          <h2 className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(36px, 10vw, 52px)', color: '#0A1A0F', lineHeight: 1 }}>
            Services
          </h2>
        </div>

        {/* ── SPACER ── */}
        <div style={{ height: 24, flexShrink: 0 }} />

        {/* ── SECTION 3: Profile + Orbital — explicit fixed height ── */}
        <MobileOrbital setCursorHover={setCursorHover} />

        {/* ── SPACER ── */}
        <div style={{ height: 32, flexShrink: 0 }} />

        {/* ── SECTION 4: Tagline ── */}
        <p
          className="tagline text-center"
          style={{
            flexShrink: 0,
            fontSize: 12,
            maxWidth: 300,
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 48,
            color: '#5A7A6A',
            lineHeight: 1.75,
            opacity: 0,
          }}
        >
          Where creativity meets technology. I craft visual experiences
          that move people — from pixels to motion to intelligent systems.
        </p>
      </div>

      {/* ===================== DESKTOP LAYOUT (>= 1024px) ===================== */}
      <div className="relative z-10 hidden lg:flex items-center h-full px-12 lg:px-20">
        {/* Left: Hero Text — max-width keeps it clear of orbital icons */}
        <div className="flex flex-col gap-4" style={{ maxWidth: 440, marginRight: 'auto' }}>
          {/* Name - 2 lines */}
          <h1 className="font-display font-bold tracking-tight" style={{ fontSize: 56, lineHeight: 1.05, color: '#0A1A0F' }}>
            <span className="block">
              {'Muhammad'.split('').map((char, i) => (
                <span key={`dm${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>{char}</span>
              ))}
            </span>
            <span className="block">
              {'Saimoon Hassan'.split('').map((char, i) => (
                <span key={`ds${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Designation */}
          <div className="designation flex items-center gap-3" style={{ opacity: 0 }}>
            <div style={{ width: 32, height: 1.5, background: '#00C853' }} />
            <span className="font-display text-base font-medium uppercase tracking-[0.15em]" style={{ color: '#00C853' }}>
              Creative Editor
            </span>
          </div>

          {/* Role Ticker */}
          <div className="role-ticker flex items-center gap-3" style={{ opacity: 0 }}>
            <span
              className="font-mono text-xs uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
            >
              {ROLES[roleIndex]}
            </span>
            <div className="flex gap-1">
              {ROLES.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300" style={{
                  width: i === roleIndex ? 16 : 4, height: 4,
                  background: i === roleIndex ? '#00C853' : 'rgba(0, 200, 83, 0.2)',
                }} />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p className="tagline text-sm" style={{ color: '#5A7A6A', lineHeight: 1.6, opacity: 0 }}>
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>
        </div>

        {/* Center: Services headline + Profile + Orbital */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          {/* Services Headline */}
          <div className="services-headline flex flex-col items-center gap-1 mb-12" style={{ opacity: 0 }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(90, 122, 106, 0.5)' }}>
              — explore my —
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight" style={{ color: '#0A1A0F' }}>
              Services
            </h2>
          </div>

          <div className="relative">
            <ProfileMachine />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              onMouseEnter={() => setCursorHover(true)}
              onMouseLeave={() => setCursorHover(false)}
            >
              <OrbitalNav />
            </div>
          </div>
        </div>
      </div>

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="fixed bottom-4 left-4 lg:bottom-6 lg:left-6 z-50 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
        style={{
          width: 36, height: 36,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 200, 83, 0.15)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          color: soundEnabled ? '#00C853' : '#5A7A6A',
        }}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* Keyboard Hint */}
      <div
        className="fixed bottom-6 right-6 z-50 font-mono text-[10px] uppercase tracking-wider hidden lg:block"
        style={{ color: 'rgba(90, 122, 106, 0.4)' }}
      >
        Press 1-6 to navigate
      </div>

      <ContentPanel />
      <CustomCursor />
    </div>
  );
}
