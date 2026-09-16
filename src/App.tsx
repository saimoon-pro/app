import { useEffect, useState } from 'react';
import { Volume2, VolumeX, MessageCircle, FileText, ChevronDown } from 'lucide-react';
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
      if (w < 380) setOrbitalHeight(270);
      else if (w < 480) setOrbitalHeight(300);
      else if (w < 640) setOrbitalHeight(340);
      else if (w < 768) setOrbitalHeight(380);
      else setOrbitalHeight(410);
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

  // Role ticker rotation
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion]);

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

      {/* Ambient Radial Accent */}
      <div
        className="bg-gradient-wash absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 40% 50%, rgba(0, 200, 83, 0.08) 0%, transparent 60%)',
          opacity: 0,
        }}
      />

      <ParticleField />

      {/* ── MOBILE FROSTED GLASS HEADER (Audio Toggle & Top Nav Space) ── */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-3.5 sm:px-5 lg:hidden bg-[#050c07]/95 backdrop-blur-xl border-b border-[#00C853]/20 shadow-[0_4px_24px_rgba(0,0,0,0.7)] select-none">
        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-[#00C853]/30 text-xs font-mono text-[#00FF66] hover:bg-[#00C853]/15 transition-all cursor-pointer"
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span className="text-[10px] tracking-wider uppercase font-semibold">{soundEnabled ? 'MUTE' : 'AUDIO'}</span>
        </button>

        {/* Right clearance spacer for ResumeButton */}
        <div className="w-28 sm:w-36" />
      </header>

      {/* ===================== MOBILE LAYOUT (< 1024px) ===================== */}
      <div className="relative z-10 flex flex-col items-center h-full lg:hidden overflow-y-auto overflow-x-hidden mobile-layout-scroll pt-16 sm:pt-20 pb-20">

        {/* Hero Section: Name · Designation · Role · Tagline · CTAs */}
        <div className="flex flex-col items-center gap-1.5 px-4 sm:px-6 text-center" style={{ flexShrink: 0 }}>
          <h1
            className="font-display font-bold tracking-tight text-white"
            style={{ lineHeight: 1.08, textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
          >
            <span className="block" style={{ fontSize: 'clamp(28px, 7.5vw, 46px)' }}>
              {'Muhammad'.split('').map((char, i) => (
                <span key={`m${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>{char}</span>
              ))}
            </span>
            <span className="block" style={{ fontSize: 'clamp(28px, 7.5vw, 46px)' }}>
              {'Saimoon Hassan'.split('').map((char, i) => (
                <span key={`s${i}`} className="name-letter inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          {/* Designation */}
          <div className="designation flex items-center gap-2 mt-0.5" style={{ opacity: 0 }}>
            <div style={{ width: 20, height: 1.5, background: '#00C853', boxShadow: '0 0 6px #00C853' }} />
            <span className="font-display font-semibold uppercase tracking-widest text-[#00FF66]" style={{ fontSize: 11 }}>
              Creative Editor
            </span>
            <div style={{ width: 20, height: 1.5, background: '#00C853', boxShadow: '0 0 6px #00C853' }} />
          </div>

          {/* Role Ticker */}
          <div className="role-ticker flex items-center gap-2 mt-0.5" style={{ opacity: 0 }}>
            <span
              className="font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#00C853]/40 shadow-[0_0_10px_rgba(0,200,83,0.2)]"
              style={{ background: 'rgba(0, 200, 83, 0.12)', color: '#00FF66', fontSize: 10 }}
            >
              {ROLES[roleIndex]}
            </span>
            <div className="flex gap-1">
              {ROLES.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300" style={{
                  width: i === roleIndex ? 12 : 3, height: 3,
                  background: i === roleIndex ? '#00C853' : 'rgba(0, 200, 83, 0.3)',
                  boxShadow: i === roleIndex ? '0 0 6px #00C853' : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p
            className="tagline text-center text-[#B0C8BF] mt-1"
            style={{
              fontSize: 12,
              maxWidth: 340,
              paddingLeft: 8,
              paddingRight: 8,
              lineHeight: 1.55,
              opacity: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>

          {/* Mobile Quick Action CTAs */}
          <div className="flex items-center gap-2.5 mt-2 flex-shrink-0">
            <a
              href="https://wa.me/8801778011899"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00C853]/20 hover:bg-[#00C853] text-[#00FF66] hover:text-black border border-[#00C853]/50 font-mono text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,200,83,0.2)] cursor-pointer"
            >
              <MessageCircle size={14} />
              <span>Direct WhatsApp</span>
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#00C853] text-white hover:text-black border border-white/20 font-mono text-xs uppercase tracking-wider transition-all shadow-[0_2px_10px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              <FileText size={14} className="text-[#00FF66]" />
              <span>View Resume</span>
            </button>
          </div>

          {/* Scroll down indicator for mobile */}
          <button
            onClick={() => {
              const el = document.querySelector('.mobile-layout-scroll');
              if (el) el.scrollBy({ top: 320, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 mt-2.5 text-[#00FF66]/80 hover:text-[#00FF66] bg-black/40 px-3 py-1 rounded-full border border-[#00C853]/25 transition-all cursor-pointer select-none"
            aria-label="Scroll to explore services"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Explore Services</span>
            <ChevronDown size={13} className="animate-bounce text-[#00C853]" />
          </button>
        </div>

        {/* Spacer */}
        <div style={{ height: 16, flexShrink: 0 }} />

        {/* "Services" headline */}
        <div className="services-headline flex flex-col items-center gap-0.5" style={{ flexShrink: 0, opacity: 0 }}>
          <span className="font-mono uppercase tracking-[0.22em] text-[#00C853]" style={{ fontSize: 9 }}>
            — explore my universe —
          </span>
          <h2 className="font-display font-bold tracking-tight text-white" style={{ fontSize: 'clamp(26px, 6.5vw, 38px)', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            Services & Disciplines
          </h2>
        </div>

        {/* Spacer */}
        <div style={{ height: 8, flexShrink: 0 }} />

        {/* Profile + Orbital — responsive height */}
        <MobileOrbital setCursorHover={setCursorHover} />

        {/* Bottom Spacer ensuring content scrolls completely clear of fixed bottom controls */}
        <div style={{ height: 80, flexShrink: 0 }} />
      </div>

      {/* ===================== DESKTOP SPLIT LAYOUT (>= 1024px) ===================== */}
      <div className="relative z-10 hidden lg:grid lg:grid-cols-12 items-center h-full px-12 xl:px-20 2xl:px-28 pb-16">
        {/* ── LEFT SIDE: HERO HEADLINE & DETAILS ── */}
        <div className="col-span-6 flex flex-col gap-5 justify-center pr-6 max-w-xl">
          {/* Name - 2 lines */}
          <h1
            className="font-display font-bold tracking-tight text-white"
            style={{ fontSize: 'clamp(46px, 4.4vw, 64px)', lineHeight: 1.04, textShadow: '0 4px 28px rgba(0,0,0,0.95)' }}
          >
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
            <div style={{ width: 36, height: 2, background: '#00C853', boxShadow: '0 0 10px #00C853' }} />
            <span className="font-display text-base font-bold uppercase tracking-[0.2em] text-[#00FF66]" style={{ textShadow: '0 0 12px rgba(0,200,83,0.7)' }}>
              Creative Editor
            </span>
          </div>

          {/* Role Ticker */}
          <div className="role-ticker flex items-center gap-3" style={{ opacity: 0 }}>
            <span
              className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#00C853]/40 shadow-[0_0_15px_rgba(0,200,83,0.25)]"
              style={{ background: 'rgba(0, 200, 83, 0.15)', color: '#00FF66' }}
            >
              {ROLES[roleIndex]}
            </span>
            <div className="flex gap-1.5">
              {ROLES.map((_, i) => (
                <div key={i} className="rounded-full transition-all duration-300" style={{
                  width: i === roleIndex ? 18 : 4, height: 4,
                  background: i === roleIndex ? '#00C853' : 'rgba(0, 200, 83, 0.3)',
                  boxShadow: i === roleIndex ? '0 0 8px #00C853' : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <p
            className="tagline text-sm text-[#C2D8CE] leading-relaxed max-w-md"
            style={{ opacity: 0, textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
          >
            Where creativity meets technology. I craft visual experiences
            that move people — from pixels to motion to intelligent systems.
          </p>

          {/* Services Section Header in Left Hero Column */}
          <div className="services-headline flex flex-col gap-1 pt-1" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00A84D] shadow-[0_0_8px_#00C853] animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#00A84D]">
                — EXPLORE MY UNIVERSE —
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
              Services & Disciplines
            </h2>
          </div>

          {/* Quick Direct Action CTA */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://wa.me/8801778011899"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C853]/20 hover:bg-[#00C853] text-[#00FF66] hover:text-black border border-[#00C853]/50 font-mono text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,200,83,0.2)] hover:shadow-[0_0_25px_rgba(0,200,83,0.45)] cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Direct WhatsApp</span>
            </a>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-[#00C853] text-white hover:text-black border border-white/20 hover:border-[#00C853] font-mono text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,200,83,0.4)] cursor-pointer group"
            >
              <FileText size={15} className="text-[#00FF66] group-hover:text-black transition-colors" />
              <span>View Resume / CV</span>
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
          background: 'rgba(5, 15, 8, 0.85)',
          border: '1.5px solid rgba(0, 200, 83, 0.4)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0,200,83,0.2)',
          color: soundEnabled ? '#00FF66' : '#8BAAA0',
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
