import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import { videoCacheService } from '@/services/videoCacheService';
import { markIntroSeen, saveAudioPref } from '@/lib/cookieManager';

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
  const soundEnabled = useStore((s) => s.soundEnabled);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Dual-Layer Seamless Crossfade System
  const activeLayerRef = useRef<'A' | 'B'>('A');

  const [opacityA, setOpacityA] = useState<number>(0.95);
  const [opacityB, setOpacityB] = useState<number>(0);
  const [zIndexA, setZIndexA] = useState<number>(2);
  const [zIndexB, setZIndexB] = useState<number>(1);

  const vidARef = useRef<HTMLVideoElement>(null);
  const vidBRef = useRef<HTMLVideoElement>(null);

  const isContactMode = activeNode === 'contact';
  const targetVideo = isContactMode
    ? CONTACT_VIDEO
    : REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1];

  const currentVideoSrcRef = useRef<string>(
    isContactMode ? CONTACT_VIDEO : REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]
  );
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize service worker & media caching engine
  useEffect(() => {
    videoCacheService.registerServiceWorker();
    videoCacheService.preloadIntroVideo().catch(() => {});
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Sync intro video audio if user manually mutes sound via UI
  useEffect(() => {
    const vid = welcomeVideoRef.current;
    if (!vid || introState !== 'welcome') return;
    if (!soundEnabled) {
      vid.muted = true;
      setIsAudioMuted(true);
    }
  }, [soundEnabled, introState]);

  // Auto-play intro video: Starts muted to comply with browser autoplay policy
  useEffect(() => {
    if (introState !== 'welcome') return;
    const vid = welcomeVideoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.volume = 1.0;
    vid.loop = false;
    vid.muted = true;
    setIsAudioMuted(true);

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }

    const unlockSound = () => {
      const v = welcomeVideoRef.current;
      if (!v || introState !== 'welcome') return;
      if (v.muted) {
        try {
          v.muted = false;
          v.volume = 1.0;
          setIsAudioMuted(false);
          useStore.getState().setSoundEnabled(true);
          saveAudioPref(true);

          if (v.paused) {
            const playProm = v.play();
            if (playProm !== undefined) {
              playProm.catch(() => {
                v.muted = true;
                v.play().catch(() => {});
                setIsAudioMuted(true);
              });
            }
          }
        } catch {
          v.muted = true;
          v.play().catch(() => {});
          setIsAudioMuted(true);
        }
      }
    };

    const activationEvents = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];
    activationEvents.forEach((evt) => {
      window.addEventListener(evt, unlockSound, { capture: true, passive: true });
    });

    return () => {
      activationEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockSound, { capture: true });
      });
    };
  }, [introState, soundEnabled]);

  const handleIntroOverlayClick = () => {
    const v = welcomeVideoRef.current;
    if (!v || introState !== 'welcome') return;
    if (v.muted) {
      try {
        v.muted = false;
        v.volume = 1.0;
        setIsAudioMuted(false);
        useStore.getState().setSoundEnabled(true);
        saveAudioPref(true);
        if (v.paused) {
          v.play().catch(() => {
            v.muted = true;
            v.play().catch(() => {});
            setIsAudioMuted(true);
          });
        }
      } catch {
        v.muted = true;
        v.play().catch(() => {});
        setIsAudioMuted(true);
      }
    }
  };

  // Seamless 1080p Dissolve from Intro to Active Background Video
  const triggerIntroDissolve = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== 'welcome') return prev;

      // Start active background video playback
      const activeVid = activeLayerRef.current === 'A' ? vidARef.current : vidBRef.current;
      if (activeVid) {
        activeVid.play().catch(() => {});
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
        markIntroSeen();
        videoCacheService.startBackgroundPreloadQueue();
      }, 1000);
      return 'dissolving';
    });
  }, [setIntroCompleted]);

  // Safety fallback timer on Welcome Video (~5.5s duration)
  useEffect(() => {
    if (introState !== 'welcome') return;
    const timer = setTimeout(() => {
      triggerIntroDissolve();
    }, 6200);
    return () => clearTimeout(timer);
  }, [introState, triggerIntroDissolve]);

  const handleWelcomeTimeUpdate = () => {
    if (welcomeVideoRef.current && introState === 'welcome') {
      const vid = welcomeVideoRef.current;
      const t = vid.currentTime;
      const duration = vid.duration || 5.5;
      if (t >= duration - 0.25 || t >= 5.3) {
        triggerIntroDissolve();
      }
    }
  };

  // Direct Hardware Dual-Layer Crossfade Engine for Regulators
  useEffect(() => {
    // If during intro, set initial source on Layer A directly
    if (introState === 'welcome') {
      if (vidARef.current && vidARef.current.src !== targetVideo) {
        vidARef.current.src = targetVideo;
        vidARef.current.load();
      }
      currentVideoSrcRef.current = targetVideo;
      return;
    }

    if (targetVideo === currentVideoSrcRef.current) return;
    currentVideoSrcRef.current = targetVideo;

    // Clear any previous transition timeout
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    const isCurrentA = activeLayerRef.current === 'A';
    const nextLayer: 'A' | 'B' = isCurrentA ? 'B' : 'A';
    const incomingVid = nextLayer === 'B' ? vidBRef.current : vidARef.current;
    const outgoingVid = isCurrentA ? vidARef.current : vidBRef.current;

    if (!incomingVid) return;

    // Prepare incoming video
    incomingVid.src = targetVideo;
    incomingVid.currentTime = 0;
    incomingVid.playbackRate = 1.0;
    incomingVid.load();

    const onReady = () => {
      incomingVid.removeEventListener('canplay', onReady);

      incomingVid.play().then(() => {
        // Crossfade opacities
        if (nextLayer === 'B') {
          setZIndexB(2);
          setZIndexA(1);
          setOpacityB(0.95);
          setOpacityA(0);
        } else {
          setZIndexA(2);
          setZIndexB(1);
          setOpacityA(0.95);
          setOpacityB(0);
        }

        transitionTimerRef.current = setTimeout(() => {
          activeLayerRef.current = nextLayer;
          if (outgoingVid) {
            outgoingVid.pause();
          }
        }, 750);
      }).catch((err) => {
        console.warn('Playback error on crossfade:', err);
      });
    };

    // Use canplay event to ensure smooth, zero-freeze transition
    if (incomingVid.readyState >= 3) {
      onReady();
    } else {
      incomingVid.addEventListener('canplay', onReady, { once: true });
    }
  }, [targetVideo, introState]);

  // Scroll Interactive Playback Acceleration (Modulates rate between 1.0x and 1.8x without file swaps)
  useEffect(() => {
    if (introState !== 'completed') return;

    let decayTimer: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      const activeVid = activeLayerRef.current === 'A' ? vidARef.current : vidBRef.current;
      if (!activeVid) return;

      const impulse = Math.min(Math.abs(e.deltaY) * 0.003, 0.8);
      const targetRate = Math.min(1.8, 1.0 + impulse);
      activeVid.playbackRate = targetRate;

      if (decayTimer) clearTimeout(decayTimer);
      decayTimer = setTimeout(() => {
        if (activeVid && activeVid.playbackRate !== 1.0) {
          activeVid.playbackRate = 1.0;
        }
      }, 400);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (decayTimer) clearTimeout(decayTimer);
    };
  }, [introState]);

  // Active Watchdog: Guarantees active background video is always looping and never stuck
  useEffect(() => {
    if (introState !== 'completed') return;

    const watchdogInterval = setInterval(() => {
      const activeVid = activeLayerRef.current === 'A' ? vidARef.current : vidBRef.current;
      if (activeVid && activeVid.paused) {
        activeVid.play().catch(() => {});
      }
    }, 1000);

    return () => clearInterval(watchdogInterval);
  }, [introState]);

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
          <video
            ref={welcomeVideoRef}
            src={INTRO_VIDEO}
            autoPlay
            playsInline
            muted={isAudioMuted}
            loop={false}
            preload="auto"
            onEnded={() => {
              triggerIntroDissolve();
            }}
            onTimeUpdate={handleWelcomeTimeUpdate}
            onPause={() => {
              if (introState === 'welcome' && welcomeVideoRef.current) {
                const vid = welcomeVideoRef.current;
                vid.play().catch(() => {
                  vid.muted = true;
                  vid.play().catch(() => {});
                  setIsAudioMuted(true);
                });
              }
            }}
            onWaiting={() => {
              if (introState === 'welcome' && welcomeVideoRef.current && welcomeVideoRef.current.paused) {
                welcomeVideoRef.current.play().catch(() => {});
              }
            }}
            onError={() => {
              triggerIntroDissolve();
            }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.8) 100%)',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 200, 83, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 83, 0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* ── SEAMLESS DUAL-LAYER CROSSFADE BUFFERS ── */}
      {/* Layer A */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: opacityA,
          zIndex: zIndexA,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityA > 0 ? 'auto' : 'none',
        }}
      >
        <video
          ref={vidARef}
          src={REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* Layer B */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: opacityB,
          zIndex: zIndexB,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityB > 0 ? 'auto' : 'none',
        }}
      >
        <video
          ref={vidBRef}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* ── DYNAMIC WHITE VIGNETTE (DAY MODE) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.38) 50%, rgba(240, 246, 255, 0.88) 100%)',
          opacity: Math.max(0, Math.min(1, dayFactor)),
        }}
      />

      {/* ── DYNAMIC DARK CYBER VIGNETTE (NIGHT MODE) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.85) 100%)',
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
