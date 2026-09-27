import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import { videoCacheService } from '@/services/videoCacheService';
import { markIntroSeen, saveAudioPref } from '@/lib/cookieManager';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';

const REGULATOR_VIDEOS: Record<number, string> = {
  1: assetUrl('backgrounds/Regulator 1_opt.mp4'),
  2: assetUrl('backgrounds/Regulator 2_opt.mp4'),
  3: assetUrl('backgrounds/Regulator 3_opt.mp4'),
  4: assetUrl('backgrounds/Regulator 4_opt.mp4'),
  5: assetUrl('backgrounds/Regulator 5_opt.mp4'),
  6: assetUrl('backgrounds/Regulator 6_opt.mp4'),
};

const REGULATOR_REV_VIDEOS: Record<number, string> = {
  1: assetUrl('backgrounds/Regulator 1_rev.mp4'),
  2: assetUrl('backgrounds/Regulator 2_rev.mp4'),
  3: assetUrl('backgrounds/Regulator 3_rev.mp4'),
  4: assetUrl('backgrounds/Regulator 4_rev.mp4'),
  5: assetUrl('backgrounds/Regulator 5_rev.mp4'),
  6: assetUrl('backgrounds/Regulator 6_rev.mp4'),
};

const REGULATOR_DURATIONS: Record<number, number> = {
  1: 10,
  2: 10,
  3: 20.02,
  4: 20.053367,
  5: 15,
  6: 10,
};

const INTRO_VIDEO = assetUrl('backgrounds/Intro.mp4');
const CONTACT_VIDEO = assetUrl('backgrounds/Contact Screen_opt.mp4');
const CONTACT_REV_VIDEO = assetUrl('backgrounds/Contact Screen_rev.mp4');
const CONTACT_DURATION = 15.04;

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

  // Intro video audio states - default to muted for seamless zero-error autoplay
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Dual-Layer Constant-Luminance Dissolve System (Each layer has Forward + Reverse paired videos)
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [layerAVideo, setLayerAVideo] = useState<string>(REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);
  const [layerARevVideo, setLayerARevVideo] = useState<string>(REGULATOR_REV_VIDEOS[currentRegulator] || REGULATOR_REV_VIDEOS[1]);
  const [layerBVideo, setLayerBVideo] = useState<string | null>(null);
  const [layerBRevVideo, setLayerBRevVideo] = useState<string | null>(null);
  const [opacityA, setOpacityA] = useState<number>(0.95);
  const [opacityB, setOpacityB] = useState<number>(0);
  const [zIndexA, setZIndexA] = useState<number>(2);
  const [zIndexB, setZIndexB] = useState<number>(1);

  // References to Forward and Reverse video elements for Layer A and Layer B
  const videoA_FwdRef = useRef<HTMLVideoElement>(null);
  const videoA_RevRef = useRef<HTMLVideoElement>(null);
  const videoB_FwdRef = useRef<HTMLVideoElement>(null);
  const videoB_RevRef = useRef<HTMLVideoElement>(null);

  const currentVideoSrcRef = useRef<string>(REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize media caching engine & start background preloading queue
  useEffect(() => {
    videoCacheService.registerServiceWorker();
    videoCacheService.preloadIntroVideo().catch(() => {});
    videoCacheService.startBackgroundPreloadQueue();
  }, []);

  // Clean up transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Direction & Velocity Physics (100% Ref-based, Zero React re-renders during scroll)
  const currentDirectionRef = useRef<'forward' | 'reverse'>('forward');
  const forwardVelocityRef = useRef<number>(0);
  const reverseVelocityRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Determine active target video sources
  const isContactMode = activeNode === 'contact';
  const targetVideo = isContactMode
    ? CONTACT_VIDEO
    : REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1];
  const targetRevVideo = isContactMode
    ? CONTACT_REV_VIDEO
    : REGULATOR_REV_VIDEOS[currentRegulator] || REGULATOR_REV_VIDEOS[1];
  const targetDuration = isContactMode
    ? CONTACT_DURATION
    : REGULATOR_DURATIONS[currentRegulator] || 10;

  const soundEnabled = useStore((s) => s.soundEnabled);

  // Sync intro video audio with global soundEnabled if already interacted
  useEffect(() => {
    const vid = welcomeVideoRef.current;
    if (vid && introState === 'welcome' && !isAudioMuted) {
      vid.muted = !soundEnabled;
    }
  }, [soundEnabled, introState, isAudioMuted]);

  // Auto-play intro video with safe autoplay + entrance-unmute handling
  useEffect(() => {
    if (introState !== 'welcome') return;
    const vid = welcomeVideoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.volume = 1.0;
    vid.muted = false; // Try unmuted entrance

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAudioMuted(false);
          vid.loop = false;
        })
        .catch((err) => {
          // Browser autoplay prevented unmuted audio; fall back to muted looping preview until user interacts
          console.warn('Browser autoplay required user gesture for unmuted audio. Starting muted preview until interaction:', err);
          vid.muted = true;
          vid.currentTime = 0;
          vid.loop = true;
          vid.play().catch(() => {});
          setIsAudioMuted(true);
        });
    }

          vid.play().catch(() => {});
          setIsAudioMuted(true);
        });
    }

    // Capture user interaction anywhere to activate unmuted audio from start
    const unlockSound = () => {
      const v = welcomeVideoRef.current;
      if (!v || introState !== 'welcome') return;
      if (v.muted || isAudioMuted) {
        v.currentTime = 0; // Play from beginning as entry signal
        v.muted = false;
        v.volume = 1.0;
        v.loop = false; // Play to completion and then dissolve
        v.play()
          .then(() => {
            setIsAudioMuted(false);
            setUserInteracted && setUserInteracted(true);
          })
          .catch(() => {});
        useStore.getState().setSoundEnabled(true);
        saveAudioPref && saveAudioPref(true);
      }
    };
      }
    };

    window.addEventListener('pointerdown', unlockSound, { capture: true, passive: true });
    window.addEventListener('mousedown', unlockSound, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockSound, { capture: true, passive: true });
    window.addEventListener('keydown', unlockSound, { capture: true, passive: true });
    window.addEventListener('click', unlockSound, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockSound, { capture: true });
      window.removeEventListener('mousedown', unlockSound, { capture: true });
      window.removeEventListener('touchstart', unlockSound, { capture: true });
      window.removeEventListener('keydown', unlockSound, { capture: true });
      window.removeEventListener('click', unlockSound, { capture: true });
    };
  }, [introState, soundEnabled, isAudioMuted]);
>>>>>>> 9f31e91b2e0f1463f12521a6ed41f8cb25149906

  const toggleIntroSound = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = welcomeVideoRef.current;
    if (!vid) return;

    if (vid.muted || isAudioMuted) {
      // Enabling sound: Rewind to 0 so the user gets the intro with sound from the very start
      vid.currentTime = 0;
      vid.muted = false;
      vid.volume = 1.0;
      vid.loop = false;
      vid.play().then(() => {
        setIsAudioMuted(false);
        setUserInteracted && setUserInteracted(true);
      }).catch(() => {});
      useStore.getState().setSoundEnabled(true);
      saveAudioPref && saveAudioPref(true);

    } else {
      // Mute
      vid.muted = true;
      setIsAudioMuted(true);
      useStore.getState().setSoundEnabled(false);
      saveAudioPref && saveAudioPref(false);

    }
  }, [isAudioMuted]);

  const handleIntroOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const vid = welcomeVideoRef.current;
    if (vid && (vid.muted || isAudioMuted)) {
      vid.currentTime = 0;
      vid.muted = false;
      vid.volume = 1.0;
      vid.loop = false;
      vid.play()
        .then(() => {
          setIsAudioMuted(false);
          setUserInteracted && setUserInteracted(true);
        })
        .catch(() => {});
      useStore.getState().setSoundEnabled(true);
      saveAudioPref && saveAudioPref(true);

    }
  };

  // Seamless 1080p Dissolve from Intro to Regulator 1
  const triggerIntroDissolve = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== 'welcome') return prev;
      // Start Regulator 1 playback smoothly in the background
      if (videoA_FwdRef.current) {
        videoA_FwdRef.current.play().catch(() => {});
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
      }, 1000);
      return 'dissolving';
    });
  }, [setIntroCompleted]);

  // Safety fallback timer on Welcome Video (5.56s duration)
  useEffect(() => {
    if (introState !== 'welcome') return;
    const timer = setTimeout(() => {
      if (!isAudioMuted) {
        triggerIntroDissolve();
      }
    }, isAudioMuted ? 16000 : 6200);
    return () => clearTimeout(timer);
  }, [introState, isAudioMuted, triggerIntroDissolve]);

  const handleWelcomeTimeUpdate = () => {
    if (welcomeVideoRef.current && introState === 'welcome') {
      const vid = welcomeVideoRef.current;
      const t = vid.currentTime;
      if (vid.playbackRate !== 1.0) {
        vid.playbackRate = 1.0;
      }
      if (t >= 5.3) {
        if (!isAudioMuted && !vid.muted) {
          triggerIntroDissolve();
        } else {
          // Loop seamlessly while muted so user can click to hear full intro with sound from start
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      }
    }
  };

  // Skip intro handler
  const handleSkipIntro = useCallback(() => {
    triggerIntroDissolve();
  }, [triggerIntroDissolve]);

  // Synchronize playback seamlessly between forward & reverse videos
  const syncToReverse = useCallback(() => {
    const pairs = [
      { fwd: videoA_FwdRef.current, rev: videoA_RevRef.current },
      { fwd: videoB_FwdRef.current, rev: videoB_RevRef.current },
    ];

    pairs.forEach(({ fwd, rev }) => {
      if (!fwd || !rev) return;
      const dur = fwd.duration || targetDuration;
      const fwdTime = fwd.currentTime;
      // Exact reverse time: (dur - fwdTime) % dur
      const revTime = Math.max(0, Math.min(dur, (dur - (fwdTime % dur)) % dur));
      rev.currentTime = revTime;

      // Instant frame-accurate swap
      const targetRevRate = Math.min(2.5, 1.0 + reverseVelocityRef.current * 1.0);
      rev.playbackRate = targetRevRate;
      fwd.style.opacity = '0';
      rev.style.opacity = '1';
      fwd.pause();
      rev.play().catch(() => {});
    });
  }, [targetDuration]);

  const syncToForward = useCallback(() => {
    const pairs = [
      { fwd: videoA_FwdRef.current, rev: videoA_RevRef.current },
      { fwd: videoB_FwdRef.current, rev: videoB_RevRef.current },
    ];

    pairs.forEach(({ fwd, rev }) => {
      if (!fwd || !rev) return;
      const dur = rev.duration || targetDuration;
      const revTime = rev.currentTime;
      // Exact forward time: (dur - revTime) % dur
      const fwdTime = Math.max(0, Math.min(dur, (dur - (revTime % dur)) % dur));
      fwd.currentTime = fwdTime;

      // Instant frame-accurate swap
      const targetFwdRate = Math.min(2.5, 1.0 + forwardVelocityRef.current * 1.0);
      fwd.playbackRate = targetFwdRate;
      rev.style.opacity = '0';
      fwd.style.opacity = '1';
      rev.pause();
      fwd.play().catch(() => {});
    });
  }, [targetDuration]);

  // Scroll & Mouse Wheel / Touch Physics Listener
  // Sensitivity directly scales playback speed up to 2.5x
  useEffect(() => {
    const WHEEL_SENSITIVITY = 0.007;

    const applyScrollDelta = (deltaY: number, target: HTMLElement | null) => {
      if (introState !== 'completed' && introState !== 'dissolving') return;
      if (!deltaY) return;

      // Check if user is scrolling inside an internal scrollable panel
      if (target && typeof target.closest === 'function') {
        const scrollable = target.closest('.overflow-y-auto, .overflow-y-scroll, .overflow-x-auto');
        if (scrollable) {
          const { scrollTop, scrollHeight, clientHeight } = scrollable;
          const canDown = deltaY > 0 && scrollTop + clientHeight < scrollHeight - 2;
          const canUp = deltaY < 0 && scrollTop > 2;
          if (canDown || canUp) {
            return;
          }
        }
      }

      const absDelta = Math.abs(deltaY);
      // Impulse directly proportional to mouse wheel / touch scroll sensitivity
      const impulse = Math.min(absDelta * WHEEL_SENSITIVITY, 1.5);

      if (deltaY < 0) {
        // ── SCROLL UP -> REVERSE PLAYBACK & SPEED UP TO 2.5X ──
        reverseVelocityRef.current = Math.min(reverseVelocityRef.current + impulse, 1.5);
        forwardVelocityRef.current = 0;

        if (currentDirectionRef.current !== 'reverse') {
          currentDirectionRef.current = 'reverse';
          syncToReverse();
        } else {
          const targetRevRate = Math.min(2.5, 1.0 + reverseVelocityRef.current * 1.0);
          const pairs = [
            { rev: videoA_RevRef.current },
            { rev: videoB_RevRef.current },
          ];
          pairs.forEach(({ rev }) => {
            if (rev && rev.readyState >= 2) rev.playbackRate = targetRevRate;
          });
        }
      } else {
        // ── SCROLL DOWN -> FORWARD PLAYBACK & SPEED UP TO 2.5X ──
        forwardVelocityRef.current = Math.min(forwardVelocityRef.current + impulse, 1.5);
        reverseVelocityRef.current = 0;

        if (currentDirectionRef.current !== 'forward') {
          currentDirectionRef.current = 'forward';
          syncToForward();
        } else {
          const targetFwdRate = Math.min(2.5, 1.0 + forwardVelocityRef.current * 1.0);
          const pairs = [
            { fwd: videoA_FwdRef.current },
            { fwd: videoB_FwdRef.current },
          ];
          pairs.forEach(({ fwd }) => {
            if (fwd && fwd.readyState >= 2) fwd.playbackRate = targetFwdRate;
          });
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      applyScrollDelta(e.deltaY, e.target as HTMLElement | null);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = (touchStartY - currentY) * 2.0;
        touchStartY = currentY;
        applyScrollDelta(deltaY, e.target as HTMLElement | null);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [introState, syncToReverse, syncToForward]);

  // Continuous physics animation loop for hardware-accelerated forward & reverse playback
  useEffect(() => {
    let animId: number;

    const updatePlayback = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = now;

      if (introState === 'welcome') {
        animId = requestAnimationFrame(updatePlayback);
        return;
      } else if (introState === 'completed' || introState === 'dissolving') {
        const pairs = [
          { fwd: videoA_FwdRef.current, rev: videoA_RevRef.current },
          { fwd: videoB_FwdRef.current, rev: videoB_RevRef.current },
        ];

        if (currentDirectionRef.current === 'reverse') {
          // ── 1. HARDWARE-ACCELERATED REVERSE SPEEDUP (Scroll Up) ──
          // Speed scales smoothly from 1.0x to 2.5x based on scrolling velocity/sensitivity
          const targetRevRate = Math.min(2.5, 1.0 + reverseVelocityRef.current * 1.0);

          pairs.forEach(({ rev }) => {
            if (rev && rev.readyState >= 2) {
              if (rev.paused) rev.play().catch(() => {});
              rev.playbackRate = targetRevRate;
            }
          });

          // Exponential friction decay (smooth ~1.1s tactile glide after scroll stops)
          reverseVelocityRef.current *= Math.pow(0.04, dt);

          // Once reverse momentum finishes, seamlessly return to forward at exact point!
          if (reverseVelocityRef.current < 0.05) {
            reverseVelocityRef.current = 0;
            currentDirectionRef.current = 'forward';
            syncToForward();
          }
        } else {
          // ── 2. HARDWARE-ACCELERATED FORWARD SPEEDUP (Scroll Down) ──
          // Speed scales smoothly from 1.0x to 2.5x based on scrolling velocity/sensitivity
          if (forwardVelocityRef.current > 0.05) {
            const targetFwdRate = Math.min(2.5, 1.0 + forwardVelocityRef.current * 1.0);

            pairs.forEach(({ fwd }) => {
              if (fwd && fwd.readyState >= 2) {
                if (fwd.paused) fwd.play().catch(() => {});
                fwd.playbackRate = targetFwdRate;
              }
            });

            forwardVelocityRef.current *= Math.pow(0.04, dt);
          } else {
            // ── 3. BASE NORMAL PLAYBACK (Idle 1.0x Forward) ──
            forwardVelocityRef.current = 0;
            pairs.forEach(({ fwd }) => {
              if (fwd && fwd.readyState >= 2) {
                if (fwd.playbackRate !== 1.0) {
                  fwd.playbackRate = 1.0;
                }
                if (fwd.paused) fwd.play().catch(() => {});
              }
            });
          }
        }
      }

      animId = requestAnimationFrame(updatePlayback);
    };

    animId = requestAnimationFrame(updatePlayback);
    return () => cancelAnimationFrame(animId);
  }, [introState, triggerIntroDissolve, syncToForward]);

  // Seamless Constant-Luminance Dissolve Crossfade between Regulators
  useEffect(() => {
    if (introState === 'welcome') return;
    if (targetVideo === currentVideoSrcRef.current) return;

    currentVideoSrcRef.current = targetVideo;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (activeLayer === 'A') {
      // Transition Layer B on TOP of Layer A
      setLayerBVideo(targetVideo);
      setLayerBRevVideo(targetRevVideo);
      setZIndexB(2);
      setZIndexA(1);
      setOpacityB(0); // Start hidden on top

      const videoB_Fwd = videoB_FwdRef.current;
      const videoB_Rev = videoB_RevRef.current;

      if (videoB_Fwd) {
        videoB_Fwd.src = targetVideo;
        videoB_Fwd.load();
        if (videoB_Rev) {
          videoB_Rev.src = targetRevVideo;
          videoB_Rev.load();
        }

        let dissolved = false;
        const triggerDissolve = () => {
          if (dissolved) return;
          dissolved = true;
          videoB_Fwd.removeEventListener('playing', triggerDissolve);
          videoB_Fwd.removeEventListener('canplay', triggerDissolve);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setOpacityB(0.95);

              transitionTimerRef.current = setTimeout(() => {
                setActiveLayer('B');
                setZIndexB(1); // Layer B becomes base
                setOpacityA(0);
                if (videoA_FwdRef.current) videoA_FwdRef.current.pause();
                if (videoA_RevRef.current) videoA_RevRef.current.pause();
              }, 1050);
            });
          });
        };

        videoB_Fwd.addEventListener('playing', triggerDissolve, { once: true });
        videoB_Fwd.addEventListener('canplay', triggerDissolve, { once: true });
        videoB_Fwd.play().catch(() => {
          triggerDissolve();
        });
      }
    } else {
      // Transition Layer A on TOP of Layer B
      setLayerAVideo(targetVideo);
      setLayerARevVideo(targetRevVideo);
      setZIndexA(2);
      setZIndexB(1);
      setOpacityA(0); // Start hidden on top

      const videoA_Fwd = videoA_FwdRef.current;
      const videoA_Rev = videoA_RevRef.current;

      if (videoA_Fwd) {
        videoA_Fwd.src = targetVideo;
        videoA_Fwd.load();
        if (videoA_Rev) {
          videoA_Rev.src = targetRevVideo;
          videoA_Rev.load();
        }

        let dissolved = false;
        const triggerDissolve = () => {
          if (dissolved) return;
          dissolved = true;
          videoA_Fwd.removeEventListener('playing', triggerDissolve);
          videoA_Fwd.removeEventListener('canplay', triggerDissolve);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setOpacityA(0.95);

              transitionTimerRef.current = setTimeout(() => {
                setActiveLayer('A');
                setZIndexA(1); // Layer A becomes base
                setOpacityB(0);
                if (videoB_FwdRef.current) videoB_FwdRef.current.pause();
                if (videoB_RevRef.current) videoB_RevRef.current.pause();
              }, 1050);
            });
          });
        };

        videoA_Fwd.addEventListener('playing', triggerDissolve, { once: true });
        videoA_Fwd.addEventListener('canplay', triggerDissolve, { once: true });
        videoA_Fwd.play().catch(() => {
          triggerDissolve();
        });
      }
    }
  }, [targetVideo, targetRevVideo, introState, activeLayer]);

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
            muted={isAudioMuted}
            loop={isAudioMuted}
            preload="auto"
            onEnded={() => {
              if (!isAudioMuted) {
                triggerIntroDissolve();
              }
            }}
            onTimeUpdate={handleWelcomeTimeUpdate}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform',
            }}
          />

          {/* ── CINEMATIC BLACK VIGNETTE ON INTRO SCREEN (Matching Background Videos) ── */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.8) 100%)',
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
                  ? 'bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 border-amber-400/60 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-black/60 hover:bg-[#00C853]/90 text-[#00C853] hover:text-black border-[#00C853]/40 hover:border-[#00C853]'
              }`}
              title={isAudioMuted ? 'Sound muted - click to enable audio' : 'Sound playing'}
            >
              {isAudioMuted ? (
                <>
                  <Volume2 size={15} className="text-amber-400 group-hover:scale-110 transition-transform animate-bounce" />
                  <span>Unmute Audio</span>

                </>
              ) : (
                <>
                  <Volume2 size={15} className="text-[#00C853] group-hover:scale-110 transition-transform" />
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

          {/* Welcoming Subtitle Banner / Tap to Enter Audio Indicator */}
          <div
            onClick={handleIntroOverlayClick}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/40 hover:border-[#00C853] transition-all cursor-pointer z-50 shadow-xl group"
          >
            {isAudioMuted ? (
              <>
                <Volume2 size={15} className="text-[#00C853] animate-pulse group-hover:scale-110 transition-transform" />
                <span className="font-mono text-xs text-white/95 tracking-widest uppercase">
                  Click Anywhere to Enter With Audio
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
                <span className="font-mono text-xs text-white/90 tracking-widest uppercase">
                  Welcome to Saimoon's Digital Universe
                </span>
              </>
            )}
          </div>
          </div>
        </div>
      )}

      {/* ── SEAMLESS HOLLYWOOD CONSTANT-LUMINANCE DISSOLVE DUAL BUFFER ── */}
      <video
        ref={videoARef}
        src={layerAVideo || undefined}
        autoPlay={introCompleted}
        loop
        muted
        playsInline
        preload={introCompleted ? "auto" : "metadata"}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: introState === 'welcome' ? 0 : opacityA,
          zIndex: zIndexA,
        }}
      />
        style={{
          opacity: introState === 'welcome' ? 0 : opacityA,
          zIndex: zIndexA,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityA > 0 ? 'auto' : 'none',
        }}
      >
        <video
          ref={videoA_FwdRef}
          src={layerAVideo || undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 1,
            transform: 'translate3d(0, 0, 0)',
          }}
        />
        <video
          ref={videoA_RevRef}
          src={layerARevVideo || undefined}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 0,
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      <video
        ref={videoBRef}
        src={layerBVideo || undefined}
        autoPlay={introCompleted}
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: opacityB,
          zIndex: zIndexB,
        }}
      />
        style={{
          opacity: opacityB,
          zIndex: zIndexB,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'opacity',
          transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: opacityB > 0 ? 'auto' : 'none',
        }}
      >
        <video
          ref={videoB_FwdRef}
          src={layerBVideo || undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 1,
            transform: 'translate3d(0, 0, 0)',
          }}
        />
        <video
          ref={videoB_RevRef}
          src={layerBRevVideo || undefined}
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: 0,
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
