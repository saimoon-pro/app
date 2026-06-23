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

    // Start polling for updates
    const interval = sheetsService.startPolling(() => {
      sheetsService.getContent().then(setContent);
    });

    return () => clearInterval(interval);
  }, [setContent, setIsLoading]);

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    // Fade in background elements
    tl.to('.bg-gradient-wash', { opacity: 1, duration: 0.8, ease: 'power2.out' });

    // Hero name animation (letter stagger)
    const nameLetters = document.querySelectorAll('.name-letter');
    tl.fromTo(
      nameLetters,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' },
      '-=0.4'
    );

    // Role ticker
    tl.fromTo(
      '.role-ticker',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    // Tagline
    tl.fromTo(
      '.tagline',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
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

  const name = "Muhammad Saimoon Hassan";

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

      {/* Particle Field */}
      <ParticleField />

      {/* Subtle Noise Texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.015,
        }}
      />

      {/* Main Layout */}
      <div className="relative z-10 flex items-center h-full px-12 lg:px-20">
        {/* Left: Hero Text */}
        <div className="flex flex-col gap-4 max-w-md">
          {/* Name */}
          <h1 className="font-display font-bold tracking-tight" style={{ fontSize: 56, lineHeight: 1.05, color: '#0A1A0F' }}>
            {name.split('').map((char, i) => (
              <span
                key={i}
                className="name-letter inline-block"
                style={{ opacity: 0 }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

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
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === roleIndex ? 16 : 4,
                    height: 4,
                    background: i === roleIndex ? '#00C853' : 'rgba(0, 200, 83, 0.2)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p className="tagline text-sm" style={{ color: '#5A7A6A', lineHeight: 1.6, opacity: 0 }}>
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>
        </div>

        {/* Center: Profile Machine + Orbital Nav */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="relative">
            <ProfileMachine />
            {/* Orbital Navigation positioned around the profile */}
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
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
        style={{
          width: 40,
          height: 40,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 200, 83, 0.15)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          color: soundEnabled ? '#00C853' : '#5A7A6A',
        }}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {/* Keyboard Hint */}
      <div
        className="fixed bottom-6 right-6 z-50 font-mono text-[10px] uppercase tracking-wider hidden lg:block"
        style={{ color: 'rgba(90, 122, 106, 0.4)' }}
      >
        Press 1-6 to navigate
      </div>

      {/* Content Panel */}
      <ContentPanel />

      {/* Custom Cursor */}
      <CustomCursor />
    </div>
  );
}
