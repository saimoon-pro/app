import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import { SkipForward } from 'lucide-react';

const REGULATOR_VIDEOS: Record<number, string> = {
  1: assetUrl('backgrounds/Regulator 1_opt.mp4'),
  2: assetUrl('backgrounds/Regulator 2_opt.mp4'),
  3: assetUrl('backgrounds/Regulator 3_opt.mp4'),
  4: assetUrl('backgrounds/Regulator 4_opt.mp4'),
  5: assetUrl('backgrounds/Regulator 5_opt.mp4'),
  6: assetUrl('backgrounds/Regulator 6_opt.mp4'),
};

const INTRO_VIDEO = assetUrl('backgrounds/Intro_opt.mp4');
const CONTACT_VIDEO = assetUrl('backgrounds/Contact Screen_opt.mp4');

// ── Smooth Easy Ease Speed Ramp: 0-4s at 2x, 5-7s at 1x, 7-10s at 2x ──
function getIntroSpeedRampRate(t: number): number {
  const smoothstep = (min: number, max: number, v: number) => {
    const x = Math.max(0, Math.min(1, (v - min) / (max - min)));
    return x * x * (3 - 2 * x); // Standard cubic Hermite easy-ease
  };

  if (t < 3.8) {
    return 2.0; // First 4s speed up 2x
  } else if (t < 5.0) {
    // 3.8s - 5.0s: smooth easy ease from 2.0x down to 1.0x
    const progress = smoothstep(3.8, 5.0, t);
    return 2.0 - 1.0 * progress;
  } else if (t < 7.0) {
    return 1.0; // 5-7s at 1x real-time speed
  } else if (t < 8.2) {
    // 7.0s - 8.2s: smooth easy ease from 1.0x up to 2.0x
    const progress = smoothstep(7.0, 8.2, t);
    return 1.0 + 1.0 * progress;
  } else {
    return 2.0; // 7-10s end 2x speed
  }
}

export default function BackgroundVideoSystem() {
  const introCompleted = useStore((s) => s.introCompleted);
  const setIntroCompleted = useStore((s) => s.setIntroCompleted);
  const currentRegulator = useStore((s) => s.currentRegulator);
  const activeNode = useStore((s) => s.activeNode);

  // Intro video states: 'welcome' | 'dissolving' | 'completed'
  const [introState, setIntroState] = useState<'welcome' | 'dissolving' | 'completed'>(
    introCompleted ? 'completed' : 'welcome'
  );

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);

  // Dual-Layer Constant-Luminance Dissolve System
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [layerAVideo, setLayerAVideo] = useState<string>(REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);
  const [layerBVideo, setLayerBVideo] = useState<string | null>(null);
  const [opacityA, setOpacityA] = useState<number>(0.95);
  const [opacityB, setOpacityB] = useState<number>(0);
  const [zIndexA, setZIndexA] = useState<number>(2);
  const [zIndexB, setZIndexB] = useState<number>(1);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const currentVideoSrcRef = useRef<string>(REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Velocity Physics (100% Ref-based, Zero React re-renders during scroll)
  const forwardVelocityRef = useRef(0);
  const reverseVelocityRef = useRef(0);
  const isReversingRef = useRef(false);
  const lastFrameTimeRef = useRef(performance.now());

  // Determine active target video source
  const isContactMode = activeNode === 'contact';
  const targetVideo = isContactMode
    ? CONTACT_VIDEO
    : REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1];

  // Seamless 1080p Dissolve from Intro to Regulator 1
  const triggerIntroDissolve = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== 'welcome') return prev;
      // Start Regulator 1 playback smoothly in the background
      if (videoARef.current) {
        videoARef.current.play().catch(() => {});
      }
      setTimeout(() => {
        setIntroState('completed');
        setIntroCompleted(true);
      }, 1000);
      return 'dissolving';
    });
  }, [setIntroCompleted]);

  // Safety fallback timer on Welcome Video
  useEffect(() => {
    if (introState !== 'welcome') return;
    const timer = setTimeout(() => {
      triggerIntroDissolve();
    }, 11000);
    return () => clearTimeout(timer);
  }, [introState, triggerIntroDissolve]);

  const handleWelcomeTimeUpdate = () => {
    if (welcomeVideoRef.current && introState === 'welcome') {
      const t = welcomeVideoRef.current.currentTime;
      const targetRate = getIntroSpeedRampRate(t);
      if (Math.abs(welcomeVideoRef.current.playbackRate - targetRate) > 0.01) {
        welcomeVideoRef.current.playbackRate = targetRate;
      }
      if (t >= 9.8) {
        triggerIntroDissolve();
      }
    }
  };

  // Skip intro handler
  const handleSkipIntro = useCallback(() => {
    triggerIntroDissolve();
  }, [triggerIntroDissolve]);

  // Mouse wheel listener: 2.5x sensitivity scaling for bidirectional speedup
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        // If scrolling inside an active scrollable container, don't interrupt its internal scrolling
        const scrollable = target.closest('.overflow-y-auto, .overflow-y-scroll, .overflow-x-auto');
        if (scrollable) {
          const { scrollTop, scrollHeight, clientHeight } = scrollable;
          const canDown = e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 2;
          const canUp = e.deltaY < 0 && scrollTop > 2;
          if (canDown || canUp) {
            return;
          }
        }
      }

      // Fast responsiveness multiplier
      const delta = e.deltaY;
      const sensitivity = 0.025;

      if (delta > 0) {
        // Scroll Down -> Forward acceleration from EXACT position
        forwardVelocityRef.current = Math.min(forwardVelocityRef.current + delta * sensitivity, 5.0);
        reverseVelocityRef.current = 0; // Instantly switch to forward
      } else if (delta < 0) {
        // Scroll Up -> Instant Reverse speedup from EXACT position
        reverseVelocityRef.current = Math.min(reverseVelocityRef.current + Math.abs(delta) * sensitivity, 5.0);
        forwardVelocityRef.current = 0; // Instantly switch to reverse
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Continuous physics loop for 100% seamless, continuous forward & reverse playback across all layers
  useEffect(() => {
    let animId: number;

    const updatePlayback = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = now;

      if (introState === 'welcome') {
        const welcomeVid = welcomeVideoRef.current;
        if (welcomeVid && welcomeVid.readyState >= 2) {
          const t = welcomeVid.currentTime;
          const targetRate = getIntroSpeedRampRate(t);
          if (Math.abs(welcomeVid.playbackRate - targetRate) > 0.01) {
            welcomeVid.playbackRate = targetRate;
          }
          if (t >= 9.8) {
            triggerIntroDissolve();
          }
        }
      } else if (introState === 'completed' || introState === 'dissolving') {
        const videos = [videoARef.current, videoBRef.current].filter(Boolean) as HTMLVideoElement[];

        // ── 1. ULTRA-FAST INTRA-FRAME REVERSE SCRUBBING (Scroll Up) ──
        if (reverseVelocityRef.current > 0.04) {
          isReversingRef.current = true;
          const reverseSpeed = 2.5 + reverseVelocityRef.current * 0.4;

          videos.forEach((video) => {
            if (video.readyState >= 2) {
              if (!video.paused) {
                video.pause();
              }
              const dur = video.duration || 10;
              let nextTime = video.currentTime - reverseSpeed * dt;

              if (nextTime < 0) {
                nextTime = dur + (nextTime % dur);
              } else if (nextTime > dur) {
                nextTime = nextTime % dur;
              }

              video.currentTime = nextTime;
            }
          });

          reverseVelocityRef.current *= Math.pow(0.18, dt);
        }
        // ── 2. SEAMLESS FORWARD SPEEDUP (Scroll Down) ──
        else if (forwardVelocityRef.current > 0.04) {
          const targetForwardRate = Math.min(2.5 + forwardVelocityRef.current * 0.4, 4.5);

          videos.forEach((video) => {
            if (video.readyState >= 2) {
              if (isReversingRef.current || video.paused) {
                video.play().catch(() => {});
              }
              video.playbackRate = targetForwardRate;
            }
          });

          isReversingRef.current = false;
          forwardVelocityRef.current *= Math.pow(0.18, dt);
        }
        // ── 3. BASE NORMAL PLAYBACK (Idle 1.0x) ──
        else {
          videos.forEach((video) => {
            if (video.readyState >= 2) {
              if (isReversingRef.current || video.paused) {
                video.play().catch(() => {});
                video.playbackRate = 1.0;
              } else if (video.playbackRate !== 1.0) {
                video.playbackRate = Math.max(1.0, video.playbackRate - dt * 4.0);
              }
            }
          });

          isReversingRef.current = false;
          forwardVelocityRef.current = 0;
          reverseVelocityRef.current = 0;
        }
      }

      animId = requestAnimationFrame(updatePlayback);
    };

    animId = requestAnimationFrame(updatePlayback);
    return () => cancelAnimationFrame(animId);
  }, [introState, triggerIntroDissolve]);

  // Seamless Constant-Luminance Dissolve Crossfade between Videos
  // When target video changes: incoming video is placed on TOP at zIndex 2 with opacity 0.
  // The current video stays solid underneath at zIndex 1 with full opacity.
  // Once the incoming video starts rendering frames, it smoothly dissolves in over 1000ms.
  // After 1000ms, the incoming video becomes the solid base and the old video is cleaned up.
  useEffect(() => {
    if (introState === 'welcome') return;
    if (targetVideo === currentVideoSrcRef.current) return;

    currentVideoSrcRef.current = targetVideo;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (activeLayer === 'A') {
      // Layer A is currently solid and playing. Transition Layer B on TOP of Layer A.
      setLayerBVideo(targetVideo);
      setZIndexB(2);
      setZIndexA(1);
      setOpacityB(0); // Start hidden on top

      const videoB = videoBRef.current;
      if (videoB) {
        videoB.src = targetVideo;
        videoB.load();

        let dissolved = false;
        const triggerDissolve = () => {
          if (dissolved) return;
          dissolved = true;
          videoB.removeEventListener('playing', triggerDissolve);
          videoB.removeEventListener('canplay', triggerDissolve);

          // Ensure browser has committed opacity 0 before starting 1000ms transition to 0.95
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setOpacityB(0.95);

              transitionTimerRef.current = setTimeout(() => {
                setActiveLayer('B');
                setZIndexB(1); // Layer B becomes the base
                setOpacityA(0);
                if (videoARef.current) {
                  videoARef.current.pause();
                }
              }, 1050);
            });
          });
        };

        videoB.addEventListener('playing', triggerDissolve, { once: true });
        videoB.addEventListener('canplay', triggerDissolve, { once: true });
        videoB.play().catch(() => {
          triggerDissolve();
        });
      }
    } else {
      // Layer B is currently solid and playing. Transition Layer A on TOP of Layer B.
      setLayerAVideo(targetVideo);
      setZIndexA(2);
      setZIndexB(1);
      setOpacityA(0); // Start hidden on top

      const videoA = videoARef.current;
      if (videoA) {
        videoA.src = targetVideo;
        videoA.load();

        let dissolved = false;
        const triggerDissolve = () => {
          if (dissolved) return;
          dissolved = true;
          videoA.removeEventListener('playing', triggerDissolve);
          videoA.removeEventListener('canplay', triggerDissolve);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setOpacityA(0.95);

              transitionTimerRef.current = setTimeout(() => {
                setActiveLayer('A');
                setZIndexA(1); // Layer A becomes the base
                setOpacityB(0);
                if (videoBRef.current) {
                  videoBRef.current.pause();
                }
              }, 1050);
            });
          });
        };

        videoA.addEventListener('playing', triggerDissolve, { once: true });
        videoA.addEventListener('canplay', triggerDissolve, { once: true });
        videoA.play().catch(() => {
          triggerDissolve();
        });
      }
    }
  }, [targetVideo, introState, activeLayer]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── INTRO WELCOMING SEQUENCE WITH 1080P SEAMLESS DISSOLVE ── */}
      {introState !== 'completed' && (
        <div
          className={`absolute inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
            introState === 'welcome' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Welcoming Video with Easy Ease Speed Ramp */}
          <video
            ref={welcomeVideoRef}
            src={INTRO_VIDEO}
            autoPlay
            muted
            playsInline
            onEnded={triggerIntroDissolve}
            onTimeUpdate={handleWelcomeTimeUpdate}
            className="absolute inset-0 w-full h-full object-cover"
          />


          {/* ── CINEMATIC BLACK VIGNETTE ON INTRO SCREEN (Matching Background Videos) ── */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.8) 100%)',
              backdropFilter: 'blur(0.5px)',
            }}
          />

          {/* Subtle Scanline / Cyber Grid Overlay on Intro Screen */}
          <div
            className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 200, 83, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 83, 0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Skip Intro Button */}
          <button
            onClick={handleSkipIntro}
            className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-[#00C853]/90 text-white hover:text-black font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 hover:border-[#00C853] transition-all duration-300 group shadow-lg cursor-pointer"
          >
            <span>Skip Intro</span>
            <SkipForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Welcoming Subtitle Banner */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 z-50 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
            <span className="font-mono text-xs text-white/90 tracking-widest uppercase">
              Welcome to Saimoon's Digital Universe
            </span>
          </div>
        </div>
      )}

      {/* ── SEAMLESS HOLLYWOOD CONSTANT-LUMINANCE DISSOLVE DUAL BUFFER ── */}
      {/* Layer A */}
      <video
        ref={videoARef}
        src={layerAVideo || undefined}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: opacityA,
          zIndex: zIndexA,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityA > 0 ? 'auto' : 'none',
        }}
      />

      {/* Layer B */}
      <video
        ref={videoBRef}
        src={layerBVideo || undefined}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: opacityB,
          zIndex: zIndexB,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityB > 0 ? 'auto' : 'none',
        }}
      />

      {/* Cinematic Vignette & Ambient Darkness Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.8) 100%)',
          backdropFilter: 'blur(0.5px)',
        }}
      />

      {/* Subtle Scanline / Cyber Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 200, 83, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 83, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
