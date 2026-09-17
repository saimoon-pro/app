import { useEffect, useState } from 'react';
import { Volume2, VolumeX, MessageCircle, FileText, ChevronDown, Sun, Moon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sheetsService } from '@/services/googleSheets';
import ProfileMachine from '@/components/core/ProfileMachine';
import OrbitalNav from '@/components/core/OrbitalNav';
import ContentPanel from '@/components/core/ContentPanel';
import CustomCursor from '@/components/core/CustomCursor';
import ParticleField from '@/components/core/ParticleField';
import ResumeButton from '@/components/core/ResumeButton';
import BackgroundVideoSystem from '@/components/core/BackgroundVideoSystem';
import GearRegulator from '@/components/core/GearRegulator';
import LeadCaptureModal from '@/components/core/LeadCaptureModal';
import CelestialLightingEngine from '@/components/core/CelestialLightingEngine';
import CelestialSlider from '@/components/core/CelestialSlider';
import LiquidRoleBadge from '@/components/core/LiquidRoleBadge';
import gsap from 'gsap';

const ROLES = [
  'Video Editor',
  'Motion Designer',
  'UI-UX Designer',
  'Web Developer',
  'AI Automation Founder',
];

function MobileOrbital({ setCursorHover }: { setCursorHover: (v: boolean) => void }) {
  const [orbitalHeight, setOrbitalHeight] = useState(380);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 380) setOrbitalHeight(315);
      else if (w < 480) setOrbitalHeight(345);
      else if (w < 640) setOrbitalHeight(380);
      else if (w < 768) setOrbitalHeight(410);
      else setOrbitalHeight(440);
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
  const setResumeModalOpen = useStore((s) => s.setResumeModalOpen);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;
  const { playClick, playPanelOpen } = useSound();
  useReducedMotion();

  // Load content from CMS and poll for live updates
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

    // Start auto polling for live Google Sheets changes every 30 seconds
    const interval = sheetsService.startPolling(async () => {
      try {
        const content = await sheetsService.getContent();
        setContent(content);
      } catch (e) {
        console.error('Auto poll failed:', e);
      }
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

  // Role ticker rotation (auto cycles every 2.8s, resets on manual click)
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % ROLES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [reducedMotion, roleIndex]);

  // Global Keyboard Navigation:
  // - Left & Right Arrow keys change regulator atmosphere (1-6)
  // - Key 1: Video Editing ('video')
  // - Key 2: Graphics / Graphical Works ('design')
  // - Key 3: Website Projects ('web')
  // - Key 4: Career ('career')
  // - Key 5: AI Assistant ('ai')
  // - Key 6: Contact ('contact')
  // - Key 0 / Escape: Return to Main Window (closes open panels/modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in forms, inputs, textareas, or contentEditable
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          (typeof target.closest === 'function' && target.closest('input, textarea, [contenteditable="true"]')))
      ) {
        return;
      }

      // 1. Regulator change via Left/Right arrow keys
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        playClick();
        const cur = useStore.getState().currentRegulator;
        const next = cur > 1 ? cur - 1 : 6;
        useStore.getState().setCurrentRegulator(next);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        playClick();
        const cur = useStore.getState().currentRegulator;
        const next = cur < 6 ? cur + 1 : 1;
        useStore.getState().setCurrentRegulator(next);
        return;
      }

      // 2. Return to Main Window via '0' key or Escape key
      if (e.key === '0' || e.key === 'Escape') {
        e.preventDefault();
        playClick();
        if (useStore.getState().activeNode) {
          useStore.getState().setActiveNode(null);
        }
        if (useStore.getState().resumeModalOpen) {
          useStore.getState().setResumeModalOpen(false);
        }
        if (useStore.getState().aiChatOpen) {
          useStore.getState().setAiChatOpen(false);
        }
        return;
      }

      // 3. Number keys 1-6 direct section navigation
      const keyMap: Record<string, 'video' | 'design' | 'web' | 'career' | 'ai' | 'contact'> = {
        '1': 'video',
        '2': 'design',
        '3': 'web',
        '4': 'career',
        '5': 'ai',
        '6': 'contact',
      };

      if (e.key in keyMap) {
        e.preventDefault();
        const targetNode = keyMap[e.key];
        playClick();
        setTimeout(() => playPanelOpen(), 150);
        useStore.getState().setActiveNode(targetNode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playClick, playPanelOpen]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: '#050c07' }}
    >
      {/* ── CINEMATIC DYNAMIC VIDEO BACKGROUND SYSTEM ── */}
      <BackgroundVideoSystem />

      {/* ── CELESTIAL REAL-TIME 24H LIGHTING ENGINE & VIRTUAL SUN ── */}
      <CelestialLightingEngine />

      {/* ── CELESTIAL CLOCK SCRUBBER SLIDER CONTROLLER (TOP CENTER) ── */}
      <CelestialSlider />

      {/* Ambient Radial Accent */}
      <div
        className="bg-gradient-wash absolute inset-0 pointer-events-none"
        style={{
          background: isDay
            ? 'radial-gradient(circle at 40% 50%, rgba(0, 102, 255, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(circle at 40% 50%, rgba(0, 200, 83, 0.08) 0%, transparent 60%)',
          opacity: 0,
        }}
      />

      <ParticleField />

      {/* ── MOBILE FROSTED GLASS HEADER (Audio Toggle & Top Nav Space) ── */}
      <header className={`fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-3.5 sm:px-5 lg:hidden ${isDay ? 'bg-white/85 border-b border-[#0066FF]/20 shadow-[0_4px_24px_rgba(0,0,0,0.15)]' : 'bg-[#050c07]/95 border-b border-[#00C853]/20 shadow-[0_4px_24px_rgba(0,0,0,0.7)]'} backdrop-blur-xl select-none`}>
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDay ? 'bg-blue-500/10 border border-[#0066FF]/30 text-[#0066FF]' : 'bg-white/5 border border-[#00C853]/30 text-[#00FF66]'} text-xs font-mono transition-all cursor-pointer`}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span className="text-[10px] tracking-wider uppercase font-semibold">{soundEnabled ? 'MUTE' : 'AUDIO'}</span>
        </button>

        {/* Center Compact Day/Night Switcher for Mobile */}
        <button
          onClick={() => {
            playClick();
            useStore.getState().setTimeOfDay(isDay ? 23.0 : 12.0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isDay
              ? 'bg-amber-500/15 border border-amber-500/35 text-amber-900 shadow-[0_2px_8px_rgba(245,158,11,0.15)]'
              : 'bg-emerald-500/15 border border-emerald-500/35 text-[#00FF66] shadow-[0_2px_8px_rgba(0,255,102,0.15)]'
          } text-xs font-mono transition-all cursor-pointer`}
          aria-label={isDay ? 'Switch to Night Mode' : 'Switch to Day Mode'}
        >
          {isDay ? <Sun size={13} className="text-amber-600" /> : <Moon size={13} className="text-[#00FF66]" />}
          <span className="text-[10px] tracking-wider uppercase font-bold">{isDay ? 'DAY' : 'NIGHT'}</span>
        </button>

        {/* Right clearance spacer for ResumeButton */}
        <div className="w-28 sm:w-36" />
      </header>

      {/* ===================== MOBILE LAYOUT (< 1024px) ===================== */}
      <div className="relative z-10 flex flex-col items-center h-full lg:hidden overflow-y-auto overflow-x-hidden mobile-layout-scroll pt-20 sm:pt-24 pb-36">

        {/* Hero Section Card: Name · Designation · Role · Tagline · CTAs */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-6 text-center max-w-md w-full" style={{ flexShrink: 0 }}>
          {/* Name - 2 lines with bolder typography and tighter line-height */}
          <h1
            className={`font-display font-black tracking-tight ${isDay ? 'headline-3d-bevel-blue' : 'headline-3d-bevel'}`}
            style={{ lineHeight: 1.04 }}
          >
            <span className="block whitespace-nowrap" style={{ fontSize: 'clamp(32px, 8.4vw, 46px)' }}>
              {'Muhammad'.split('').map((char, i) => (
                <span key={`m${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>{char}</span>
              ))}
            </span>
            <span className="block whitespace-nowrap" style={{ fontSize: 'clamp(32px, 8.4vw, 46px)' }}>
              {'Saimoon Hassan'.split('').map((char, i) => (
                <span key={`s${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Designation */}
          <div className="designation flex items-center gap-2.5 mt-0.5" style={{ opacity: 0 }}>
            <div style={{ width: 28, height: 2.5, background: isDay ? '#0066FF' : '#00C853', boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00C853' }} />
            <span className={`font-display font-black uppercase tracking-[0.24em] text-base sm:text-lg ${isDay ? 'tagline-glossy-bevel-blue' : 'tagline-glossy-bevel'}`}>
              Creative Editor
            </span>
            <div style={{ width: 28, height: 2.5, background: isDay ? '#0066FF' : '#00C853', boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00C853' }} />
          </div>

          {/* Role Ticker with Liquid Morph Glass */}
          <div className="role-ticker flex items-center justify-center gap-2 mt-0.5" style={{ opacity: 0 }}>
            <LiquidRoleBadge
              roles={ROLES}
              currentIndex={roleIndex}
              onSelectIndex={(idx) => {
                playClick();
                setRoleIndex(idx);
              }}
              onNext={() => {
                playClick();
                setRoleIndex((prev) => (prev + 1) % ROLES.length);
              }}
              isDay={isDay}
              size="sm"
            />
          </div>

          {/* Tagline - Clear, legible, breathing */}
          <p
            className="tagline text-center mt-1 font-medium transition-colors duration-500"
            style={{
              fontSize: 14.5,
              maxWidth: 360,
              paddingLeft: 12,
              paddingRight: 12,
              lineHeight: 1.6,
              opacity: 0,
              color: isDay ? '#0F172A' : '#F1F5F9',
              textShadow: isDay ? '0 1px 1px rgba(255,255,255,0.85)' : '0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>

          {/* Mobile Quick Action CTAs - Native App Dual Buttons */}
          <div className="flex items-center gap-3 mt-3 w-full max-w-xs justify-center flex-shrink-0">
            <a
              href="https://wa.me/8801778011899"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl ${isDay ? 'whatsapp-tactile-btn-blue' : 'whatsapp-tactile-btn'} font-mono text-xs sm:text-sm uppercase tracking-wider font-black cursor-pointer select-none min-h-[44px]`}
            >
              <MessageCircle size={17} strokeWidth={2.5} className="text-white" />
              <span>WHATSAPP</span>
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl resume-tactile-white-btn font-mono text-xs sm:text-sm uppercase tracking-wider font-bold cursor-pointer select-none min-h-[44px]"
            >
              <FileText size={17} strokeWidth={2.2} className={isDay ? "text-[#0066FF]" : "text-[#00C853]"} />
              <span>RESUME / CV</span>
            </button>
          </div>

          {/* Scroll down indicator for mobile - App Style Pill */}
          <button
            onClick={() => {
              const el = document.querySelector('.mobile-layout-scroll');
              if (el) el.scrollBy({ top: 380, behavior: 'smooth' });
            }}
            className={`flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full ${
              isDay
                ? 'bg-white/70 hover:bg-white/90 border border-[#0066FF]/25 text-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.1)]'
                : 'bg-black/50 hover:bg-black/70 border border-[#00FF66]/25 text-[#00FF66] shadow-[0_2px_8px_rgba(0,255,102,0.1)]'
            } backdrop-blur-md transition-all cursor-pointer select-none`}
            aria-label="Scroll to explore services"
          >
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-extrabold">Explore Services</span>
            <ChevronDown size={14} className="animate-bounce" style={{ color: isDay ? '#0066FF' : '#00C853' }} />
          </button>
        </div>

        {/* Breathing Spacer between Hero and Services */}
        <div className="mt-10 sm:mt-14" style={{ flexShrink: 0 }} />

        {/* "Services & Disciplines" Headline */}
        <div className="services-headline flex flex-col items-center gap-1 text-center px-4" style={{ flexShrink: 0, opacity: 0 }}>
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: isDay ? '#0066FF' : '#00C853',
                boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00C853',
              }}
            />
            <span className="font-mono uppercase tracking-[0.26em] font-black text-xs" style={{ color: isDay ? '#0066FF' : '#00C853' }}>
              — explore my universe —
            </span>
          </div>
          <h2
            className="font-display font-black tracking-tight transition-colors duration-500"
            style={{
              fontSize: 'clamp(28px, 7.5vw, 40px)',
              lineHeight: 1.08,
              color: isDay ? '#0A2540' : '#FFFFFF',
              textShadow: isDay ? '0 1px 2px rgba(0, 102, 255, 0.15)' : '0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            Services & Disciplines
          </h2>
        </div>

        {/* Breathing Spacer */}
        <div style={{ height: 16, flexShrink: 0 }} />

        {/* Profile + Orbital Wheel — responsive height with full breathing space */}
        <MobileOrbital setCursorHover={setCursorHover} />

        {/* Bottom Spacer ensuring content scrolls completely clear of fixed bottom controls */}
        <div style={{ height: 96, flexShrink: 0 }} />
      </div>

      {/* ===================== DESKTOP SPLIT LAYOUT (>= 1024px) ===================== */}
      <div className="relative z-10 hidden lg:grid lg:grid-cols-12 items-center h-full px-12 xl:px-20 2xl:px-28 pb-16">
        {/* ── LEFT SIDE: HERO HEADLINE & DETAILS ── */}
        <div className="col-span-6 flex flex-col gap-5 justify-center pr-4 max-w-2xl">
          {/* Name - 2 lines */}
          <h1
            className={`font-display font-black tracking-tight ${isDay ? 'headline-3d-bevel-blue' : 'headline-3d-bevel'}`}
            style={{ fontSize: 'clamp(46px, 4.4vw, 68px)', lineHeight: 1.04 }}
          >
            <span className="block whitespace-nowrap">
              {'Muhammad'.split('').map((char, i) => (
                <span key={`dm${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>{char}</span>
              ))}
            </span>
            <span className="block whitespace-nowrap">
              {'Saimoon Hassan'.split('').map((char, i) => (
                <span key={`ds${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Designation */}
          <div className="designation flex items-center gap-3.5" style={{ opacity: 0 }}>
            <div style={{ width: 44, height: 3, background: isDay ? '#0066FF' : '#00C853', boxShadow: isDay ? '0 0 8px #0066FF' : '0 0 8px #00C853' }} />
            <span
              className={`font-display text-2xl sm:text-3xl font-black uppercase tracking-[0.24em] ${isDay ? 'tagline-glossy-bevel-blue' : 'tagline-glossy-bevel'}`}
            >
              Creative Editor
            </span>
            <div style={{ width: 44, height: 3, background: isDay ? '#0066FF' : '#00C853', boxShadow: isDay ? '0 0 8px #0066FF' : '0 0 8px #00C853' }} />
          </div>

          {/* Role Ticker with Liquid Morph Glass */}
          <div className="role-ticker flex items-center gap-3.5" style={{ opacity: 0 }}>
            <LiquidRoleBadge
              roles={ROLES}
              currentIndex={roleIndex}
              onSelectIndex={(idx) => {
                playClick();
                setRoleIndex(idx);
              }}
              onNext={() => {
                playClick();
                setRoleIndex((prev) => (prev + 1) % ROLES.length);
              }}
              isDay={isDay}
              size="md"
            />
          </div>

          {/* Tagline */}
          <p
            className="tagline text-base sm:text-[17px] leading-relaxed max-w-lg font-medium transition-colors duration-500"
            style={{
              opacity: 0,
              color: isDay ? '#0F172A' : '#F1F5F9',
              textShadow: isDay ? '0 1px 1px rgba(255,255,255,0.85)' : '0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>

          {/* Services Section Header in Left Hero Column */}
          <div className="services-headline flex flex-col gap-1 pt-1" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  background: isDay ? '#0066FF' : '#00C853',
                  boxShadow: isDay ? '0 0 8px #0066FF' : '0 0 8px #00C853',
                }}
              />
              <span
                className="font-mono text-xs font-black uppercase tracking-[0.28em]"
                style={{ color: isDay ? '#0066FF' : '#00C853' }}
              >
                — EXPLORE MY UNIVERSE —
              </span>
            </div>
            <h2
              className="font-display text-3xl sm:text-[34px] font-black tracking-tight transition-colors duration-500"
              style={{
                color: isDay ? '#0A2540' : '#FFFFFF',
                textShadow: isDay ? '0 1px 2px rgba(0, 102, 255, 0.15)' : '0 2px 6px rgba(0,0,0,0.7)',
              }}
            >
              Services & Disciplines
            </h2>
          </div>

          {/* Quick Direct Action CTA */}
          <div className="flex items-center gap-4 pt-1">
            <a
              href="https://wa.me/8801778011899"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${isDay ? 'whatsapp-tactile-btn-blue' : 'whatsapp-tactile-btn'} font-mono text-sm uppercase tracking-wider font-black cursor-pointer select-none`}
            >
              <MessageCircle size={17} strokeWidth={2.5} className="text-white" />
              <span>WHATSAPP</span>
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl resume-tactile-white-btn font-mono text-sm uppercase tracking-wider font-bold cursor-pointer group select-none"
            >
              <FileText
                size={17}
                strokeWidth={2.2}
                className={isDay ? "text-[#0066FF] group-hover:scale-110 transition-transform" : "text-[#00C853] group-hover:scale-110 transition-transform"}
              />
              <span>VIEW RESUME / CV</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDE: PROFILE MACHINE & GLOWING STATIONARY ORBITAL OPTIONS (ZERO OVERLAP) ── */}
        <div className="col-span-6 flex items-center justify-center relative">
          <div className="relative flex items-center justify-center">
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

      {/* ── 3D GEAR REGULATOR AT BOTTOM CENTER ── */}
      <GearRegulator />

      {/* ── TIMED RELAX LEAD CAPTURE POPUP (3 MINUTE RECURRING) ── */}
      <LeadCaptureModal />

      {/* Sound Toggle Button (Desktop only, mobile has it in header) */}
      <button
        onClick={toggleSound}
        className="fixed bottom-4 left-4 lg:bottom-6 lg:left-6 z-50 hidden lg:flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{
          width: 38, height: 38,
          background: isDay ? 'rgba(255, 255, 255, 0.9)' : 'rgba(5, 15, 8, 0.85)',
          border: isDay ? '1.5px solid rgba(0, 102, 255, 0.4)' : '1.5px solid rgba(0, 200, 83, 0.4)',
          boxShadow: isDay ? '0 2px 12px rgba(0, 0, 0, 0.15), 0 0 10px rgba(0,102,255,0.25)' : '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0,200,83,0.2)',
          color: soundEnabled ? (isDay ? '#0066FF' : '#00FF66') : (isDay ? '#64748B' : '#8BAAA0'),
        }}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <ResumeButton />

      <ContentPanel />
      <CustomCursor />

      {/* ═══════════ HIDDEN SEO SEMANTIC CONTENT ═══════════ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        <article itemScope itemType="https://schema.org/Person">
          <h1 itemProp="name">Muhammad Saimoon Hassan</h1>
          <p itemProp="description">
            Muhammad Saimoon Hassan (Saimoon) is a top-rated professional video editor, creative designer,
            UI/UX designer, website developer, AI automation expert, content writer, and digital service
            provider from Dhaka, Bangladesh. Founder of Helixonix Corp. With over 340 commercial videos
            edited and 25+ websites delivered, Saimoon provides world-class digital services to clients
            worldwide.
          </p>
          <span itemProp="jobTitle">Senior Video Editor</span>
          <span itemProp="jobTitle">Creative Designer</span>
          <span itemProp="jobTitle">UI/UX Designer</span>
          <span itemProp="jobTitle">Full Stack Web Developer</span>
          <span itemProp="jobTitle">AI Automation Founder</span>
          <span itemProp="jobTitle">Content Writer</span>
          <span itemProp="email">muhammadsaimoonhassan@gmail.com</span>
          <span itemProp="telephone">+8801778011899</span>
          <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="addressLocality">Dhaka</span>
            <span itemProp="addressCountry">Bangladesh</span>
          </div>
        </article>
      </div>
    </div>
  );
}
