import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

const REGULATOR_VIDEOS: Record<number, string> = {
  1: assetUrl('backgrounds/Regulator 1_opt.mp4'),
  2: assetUrl('backgrounds/Regulator 2_opt.mp4'),
  3: assetUrl('backgrounds/Regulator 3_opt.mp4'),
  4: assetUrl('backgrounds/Regulator 4_opt.mp4'),
  5: assetUrl('backgrounds/Regulator 5_opt.mp4'),
  6: assetUrl('backgrounds/Regulator 6_opt.mp4'),
};

const INTRO_VIDEO = assetUrl('backgrounds/Intro.mp4');
const CONTACT_VIDEO = assetUrl('backgrounds/Contact Screen_opt.mp4');

export default function BackgroundVideoSystem() {
  const introCompleted = useStore((s) => s.introCompleted);
  const setIntroCompleted = useStore((s) => s.setIntroCompleted);
  const currentRegulator = useStore((s) => s.currentRegulator);
  const activeNode = useStore((s) => s.activeNode);
  const timeOfDay = useStore((s) => s.timeOfDay);

  const dayFactor = (() => {
    if (timeOfDay >= 5.5 && timeOfDay < 7.0) return (timeOfDay - 5.5) / 1.5;
    if (timeOfDay >= 7.0 && timeOfDay < 11.0) return 0.5 + ((timeOfDay - 7.0) / 4.0) * 0.5;
    if (timeOfDay >= 11.0 && timeOfDay < 14.5) return 1.0;
    if (timeOfDay >= 14.5 && timeOfDay < 17.5) return 1.0 - ((timeOfDay - 14.5) / 3.0) * 0.5;
    if (timeOfDay >= 17.5 && timeOfDay < 19.5) return 0.5 * (1.0 - (timeOfDay - 17.5) / 2.0);
    return 0.0;
  })();

  // Intro video states: 'welcome' | 'dissolving' | 'completed'
  const [introState, setIntroState] = useState<'welcome' | 'dissolving' | 'completed'>(
    introCompleted ? 'completed' : 'welcome'
  );

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);

  // Intro video audio states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

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

  // Auto-play intro video with audio, handling browser autoplay policies gracefully
  useEffect(() => {
    if (introState !== 'welcome') return;
    const vid = welcomeVideoRef.current;
    if (!vid) return;

    vid.volume = 1.0;
    vid.muted = false;

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAudioMuted(false);
        })
        .catch((err) => {
          // Autoplay policy prevented unmuted audio playback without user gesture
          console.warn('Browser autoplay prevented audio. Playing muted until interaction:', err);
          vid.muted = true;
          vid.play().catch(() => {});
          setIsAudioMuted(true);
        });
    }

    // Touch/click/key anywhere immediately enables full audio
    const unlockSound = () => {
      const v = welcomeVideoRef.current;
      if (v && introState === 'welcome') {
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(() => {});
        setIsAudioMuted(false);
        setUserInteracted(true);
      }
    };

    window.addEventListener('pointerdown', unlockSound, { once: true });
    window.addEventListener('keydown', unlockSound, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockSound);
      window.removeEventListener('keydown', unlockSound);
    };
  }, [introState]);

  const toggleIntroSound = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = welcomeVideoRef.current;
    if (!vid) return;

    if (vid.muted || isAudioMuted) {
      vid.muted = false;
      vid.volume = 1.0;
      vid.play().catch(() => {});
      setIsAudioMuted(false);
      setUserInteracted(true);
    } else {
      vid.muted = true;
      setIsAudioMuted(true);
    }
  }, [isAudioMuted]);

  const handleIntroOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const vid = welcomeVideoRef.current;
    if (vid && (vid.muted || isAudioMuted)) {
      vid.muted = false;
      vid.volume = 1.0;
      vid.play().catch(() => {});
      setIsAudioMuted(false);
      setUserInteracted(true);
    }
  };

  // Seamless 1080p Dissolve from Intro to Regulator 1
  const triggerIntroDissolve = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== 'welcome') return prev;
      // Start Regulator 1 playback smoothly in the background
      if (videoARef.current) {
        videoARef.current.play().catch(() => {});
      }

      // Smooth audio fadeout over 800ms
      if (welcomeVideoRef.current) {
        const vid = welcomeVideoRef.current;
        const initialVol = vid.volume;
        const fadeStart = performance.now();
        const fadeDuration = 800;
        const fadeStep = () => {
          const elapsed = performance.now() - fadeStart;
          const p = Math.min(elapsed / fadeDuration, 1);
          vid.volume = Math.max(0, initialVol * (1 - p));
          if (p < 1) {
            requestAnimationFrame(fadeStep);
          } else {
            vid.pause();
          }
        };
        requestAnimationFrame(fadeStep);
      }

      setTimeout(() => {
        setIntroState('completed');
        setIntroCompleted(true);
      }, 1000);
      return 'dissolving';
    });
  }, [setIntroCompleted]);

  // Safety fallback timer on Welcome Video (5.56s duration)
  useEffect(() => {
    if (introState !== 'welcome') return;
    const timer = setTimeout(() => {
      triggerIntroDissolve();
    }, 6200);
    return () => clearTimeout(timer);
  }, [introState, triggerIntroDissolve]);

  const handleWelcomeTimeUpdate = () => {
    if (welcomeVideoRef.current && introState === 'welcome') {
      const t = welcomeVideoRef.current.currentTime;
      if (welcomeVideoRef.current.playbackRate !== 1.0) {
        welcomeVideoRef.current.playbackRate = 1.0;
      }
      if (t >= 5.3) {
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
          if (welcomeVid.playbackRate !== 1.0) {
            welcomeVid.playbackRate = 1.0;
          }
          if (welcomeVid.currentTime >= 5.3) {
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
          onClick={handleIntroOverlayClick}
          className={`absolute inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
            introState === 'welcome' ? 'opacity-100 pointer-events-auto cursor-pointer' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Welcoming Video with High-Fidelity Audio */}
          <video
            ref={welcomeVideoRef}
            src={INTRO_VIDEO}
            autoPlay
            playsInline
            preload="auto"
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

          {/* Top Control Bar: Sound Toggle + Skip Intro Button */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            {/* Audio Toggle Button */}
            <button
              onClick={toggleIntroSound}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider backdrop-blur-md border transition-all duration-300 cursor-pointer shadow-lg group ${
                isAudioMuted
                  ? 'bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-black/60 hover:bg-[#00C853]/90 text-[#00C853] hover:text-black border-[#00C853]/40 hover:border-[#00C853]'
              }`}
              title={isAudioMuted ? 'Sound muted by browser - click to enable audio' : 'Sound playing'}
            >
              {isAudioMuted ? (
                <>
                  <VolumeX size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Sound Muted (Click)</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-[#00C853] group-hover:scale-110 transition-transform" />
                  <span>Sound ON</span>
                </>
              )}
            </button>

            {/* Skip Intro Button */}
            <button
              onClick={handleSkipIntro}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-[#00C853]/90 text-white hover:text-black font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 hover:border-[#00C853] transition-all duration-300 group shadow-lg cursor-pointer"
            >
              <span>Skip Intro</span>
              <SkipForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Audio Tap-to-Unmute Banner (if browser blocked initial audio) */}
          {isAudioMuted && !userInteracted && (
            <div
              onClick={toggleIntroSound}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/25 backdrop-blur-md border border-amber-500/50 z-50 shadow-2xl cursor-pointer hover:bg-amber-500/40 transition-all duration-200 animate-bounce"
            >
              <VolumeX size={16} className="text-amber-300" />
              <span className="font-mono text-xs text-amber-200 tracking-wider uppercase font-semibold">
                Tap anywhere to enable sound
              </span>
            </div>
          )}

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

      {/* ── DYNAMIC WHITE VIGNETTE (DAY MODE) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.38) 50%, rgba(240, 246, 255, 0.88) 100%)',
          backdropFilter: 'blur(0.5px)',
          opacity: Math.max(0, Math.min(1, dayFactor)),
        }}
      />

      {/* ── DYNAMIC DARK CYBER VIGNETTE (NIGHT MODE) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.85) 100%)',
          backdropFilter: 'blur(0.5px)',
          opacity: Math.max(0, Math.min(1, 1 - dayFactor)),
        }}
      />

      {/* Subtle Scanline / Cyber Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            dayFactor > 0.5
              ? 'linear-gradient(rgba(0, 102, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 102, 255, 0.2) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0, 200, 83, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 83, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
