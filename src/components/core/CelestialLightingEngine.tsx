import { useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';

const FLARE_SVG = assetUrl('images/Flare.svg');

export default function CelestialLightingEngine() {
  const timeOfDay = useStore((s) => s.timeOfDay);
  const setTimeOfDay = useStore((s) => s.setTimeOfDay);
  const isAutoClock = useStore((s) => s.isAutoClock);

  // Auto 24-hour real-time clock synchronization loop
  useEffect(() => {
    if (!isAutoClock) return;

    const syncTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const mins = d.getMinutes();
      const secs = d.getSeconds();
      const current = hours + mins / 60 + secs / 3600;
      setTimeOfDay(current);
    };

    syncTime();
    const interval = setInterval(syncTime, 1000);
    return () => clearInterval(interval);
  }, [isAutoClock, setTimeOfDay]);

  // Compute Celestial Physics & Day/Night Factor
  const {
    dayFactor,
    sunX,
    sunY,
    moonX,
    moonY,
    shadowX,
    shadowY,
    sunOpacity,
    moonOpacity,
    isDaytime,
    timeStage,
  } = useMemo(() => {
    // 24-hour cycle:
    // Sunrise: 05:30 - 07:00
    // Morning: 07:00 - 11:00
    // Peak Noon / Day: 11:00 - 14:30 (zenith)
    // Afternoon: 14:30 - 17:30
    // Sunset / Dusk: 17:30 - 19:30
    // Night / Midnight: 19:30 - 05:30

    let factor = 0;
    let stage: 'night' | 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'sunset' = 'night';

    if (timeOfDay >= 5.5 && timeOfDay < 7.0) {
      // Sunrise
      const p = (timeOfDay - 5.5) / 1.5;
      factor = p * 0.5;
      stage = 'sunrise';
    } else if (timeOfDay >= 7.0 && timeOfDay < 11.0) {
      // Morning
      const p = (timeOfDay - 7.0) / 4.0;
      factor = 0.5 + p * 0.45;
      stage = 'morning';
    } else if (timeOfDay >= 11.0 && timeOfDay < 14.5) {
      // High Noon
      factor = 1.0;
      stage = 'noon';
    } else if (timeOfDay >= 14.5 && timeOfDay < 17.5) {
      // Afternoon
      const p = (timeOfDay - 14.5) / 3.0;
      factor = 1.0 - p * 0.45;
      stage = 'afternoon';
    } else if (timeOfDay >= 17.5 && timeOfDay < 19.5) {
      // Sunset
      const p = (timeOfDay - 17.5) / 2.0;
      factor = 0.55 * (1.0 - p);
      stage = 'sunset';
    } else {
      // Night
      factor = 0.0;
      stage = 'night';
    }

    const daytime = timeOfDay >= 5.5 && timeOfDay <= 19.5;

    // Sun screen position along celestial parabolic arc
    // Normalizing daylight hours (5.5 to 19.5 = 14 hours) to 0.0 -> 1.0
    const daylightProgress = Math.max(0, Math.min(1, (timeOfDay - 5.5) / 14.0));
    // Horizon X: from 12% on left at sunrise to 88% on right at sunset
    const calcSunX = 12 + daylightProgress * 76;
    // Parabolic height: highest at noon (y: 12%), lower at horizon (y: 65%)
    const arcHeight = Math.sin(daylightProgress * Math.PI);
    const calcSunY = 65 - arcHeight * 53;

    // Moon screen position along night celestial parabolic arc (19.5 to 5.5 = 10 hours)
    let nightProgress = 0;
    if (timeOfDay >= 19.5) {
      nightProgress = (timeOfDay - 19.5) / 10.0;
    } else if (timeOfDay < 5.5) {
      nightProgress = (timeOfDay + 4.5) / 10.0;
    } else {
      nightProgress = 0.5;
    }
    nightProgress = Math.max(0, Math.min(1, nightProgress));
    const calcMoonX = 14 + nightProgress * 72;
    const moonArcHeight = Math.sin(nightProgress * Math.PI);
    const calcMoonY = 62 - moonArcHeight * 48;

    // Sun directional shadow calculation
    // Morning (Sun on left): shadows cast to the right (positive shadowX)
    // Noon (Sun overhead): shadows cast straight down (shadowX ~ 0)
    // Afternoon/Sunset (Sun on right): shadows cast to the left (negative shadowX)
    let sX = 0;
    let sY = 8;
    if (daytime) {
      const sunCenterDelta = (calcSunX - 50) / 50; // -1.0 on left to +1.0 on right
      sX = -sunCenterDelta * 14 * factor; // opposite to sun position
      sY = 6 + (1 - arcHeight * 0.4) * 8 * factor;
    } else {
      sX = 0;
      sY = 6;
    }

    return {
      dayFactor: factor,
      sunX: calcSunX,
      sunY: calcSunY,
      moonX: calcMoonX,
      moonY: calcMoonY,
      shadowX: sX,
      shadowY: sY,
      sunOpacity: daytime && factor > 0.02 ? Math.min(1, factor * 1.5) : 0,
      moonOpacity: !daytime ? Math.min(1, (1 - factor) * 1.3) : 0,
      isDaytime: daytime,
      timeStage: stage,
    };
  }, [timeOfDay]);

  // Push reactive CSS variables to :root for globally synced sunlight & shadows
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--day-factor', dayFactor.toFixed(3));
    root.style.setProperty('--sun-x', `${sunX.toFixed(1)}%`);
    root.style.setProperty('--sun-y', `${sunY.toFixed(1)}%`);
    root.style.setProperty('--sun-shadow-x', `${shadowX.toFixed(1)}px`);
    root.style.setProperty('--sun-shadow-y', `${shadowY.toFixed(1)}px`);
    root.style.setProperty('--sun-intensity', dayFactor.toFixed(2));
  }, [dayFactor, sunX, sunY, shadowX, shadowY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* ── CELESTIAL VIRTUAL SUN (DAY MODE) ── */}
      {isDaytime && sunOpacity > 0.01 && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out"
          style={{
            left: `${sunX}%`,
            top: `${sunY}%`,
            opacity: sunOpacity,
          }}
        >
          {/* ── REAL LIFE OPTICAL SUN FLARE (Primary Optical Diffraction Flare) ── */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              width: 720,
              height: 720,
              animation: 'solar-optical-flare 8s ease-in-out infinite',
              filter: 'drop-shadow(0 0 35px rgba(255, 220, 140, 0.75))',
            }}
          >
            <img
              src={FLARE_SVG}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                filter:
                  timeStage === 'sunrise' || timeStage === 'sunset'
                    ? 'sepia(0.4) saturate(200%) hue-rotate(-15deg) contrast(115%)'
                    : 'saturate(140%) contrast(110%)',
              }}
            />
          </div>

          {/* ── SECONDARY ROTATING OPTICAL SHIMMER LAYER (Solar Heat Scintillation) ── */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 select-none opacity-80"
            style={{
              width: 580,
              height: 580,
              animation: 'solar-corona-shimmer 6s ease-in-out infinite',
            }}
          >
            <img
              src={FLARE_SVG}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                filter:
                  timeStage === 'sunrise' || timeStage === 'sunset'
                    ? 'sepia(0.5) saturate(220%) hue-rotate(-20deg)'
                    : 'saturate(160%) brightness(1.1)',
                transform: 'scaleX(-1) rotate(45deg)',
              }}
            />
          </div>

          {/* Anamorphic Horizontal Glare Streak (35mm Cine-Lens Glare with Breathing) */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 850,
              height: 3.5,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(200,230,255,0.2) 15%, rgba(255,245,210,0.6) 35%, rgba(255,255,255,0.95) 50%, rgba(255,245,210,0.6) 65%, rgba(200,230,255,0.2) 85%, transparent 100%)',
              filter: 'blur(0.8px)',
              boxShadow: '0 0 12px rgba(255, 235, 180, 0.8), 0 0 24px rgba(200, 230, 255, 0.5)',
              animation: 'solar-anamorphic-streak 4s ease-in-out infinite',
            }}
          />

          {/* Outer Sun Ambient Glow & Corona Flares */}
          <div
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 360,
              height: 360,
              background:
                timeStage === 'sunrise' || timeStage === 'sunset'
                  ? 'radial-gradient(circle, rgba(255, 170, 60, 0.4) 0%, rgba(255, 120, 30, 0.2) 35%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255, 250, 220, 0.45) 0%, rgba(255, 220, 120, 0.22) 40%, transparent 70%)',
              filter: 'blur(26px)',
            }}
          />

          {/* Core Radiant Sun Orb */}
          <div
            className="relative rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 64,
              height: 64,
              background:
                timeStage === 'sunrise' || timeStage === 'sunset'
                  ? 'radial-gradient(circle at 35% 35%, #FFF7ED 0%, #FDBA74 40%, #EA580C 100%)'
                  : 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FEF08A 35%, #F59E0B 100%)',
              boxShadow:
                timeStage === 'sunrise' || timeStage === 'sunset'
                  ? '0 0 35px #FB923C, 0 0 70px rgba(234, 88, 12, 0.6), inset 0 0 15px #FFFFFF'
                  : '0 0 45px #FDE047, 0 0 90px rgba(250, 204, 21, 0.7), inset 0 0 20px #FFFFFF',
              border: '2px solid rgba(255, 255, 255, 0.9)',
            }}
          />
        </div>
      )}

      {/* ── CELESTIAL VIRTUAL MOON (NIGHT MODE) ── */}
      {!isDaytime && moonOpacity > 0.01 && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out"
          style={{
            left: `${moonX}%`,
            top: `${moonY}%`,
            opacity: moonOpacity,
          }}
        >
          {/* Outer Lunar Ambient Bloom / Moonlight Diffusion */}
          <div
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 380,
              height: 380,
              background:
                'radial-gradient(circle, rgba(186, 230, 253, 0.28) 0%, rgba(147, 197, 253, 0.12) 35%, transparent 70%)',
              filter: 'blur(32px)',
              animation: 'lunar-ambient-pulse 6s ease-in-out infinite',
            }}
          />

          {/* Cool Silver Anamorphic Moonlight Streak */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 600,
              height: 2.5,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(186, 230, 253, 0.2) 20%, rgba(255, 255, 255, 0.85) 50%, rgba(186, 230, 253, 0.2) 80%, transparent 100%)',
              filter: 'blur(1px)',
              boxShadow: '0 0 16px rgba(186, 230, 253, 0.6)',
            }}
          />

          {/* Secondary Starlight Cross Diffraction Spike */}
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 2.5,
              height: 180,
              background:
                'linear-gradient(180deg, transparent 0%, rgba(186, 230, 253, 0.25) 25%, rgba(255, 255, 255, 0.75) 50%, rgba(186, 230, 253, 0.25) 75%, transparent 100%)',
              filter: 'blur(0.8px)',
            }}
          />

          {/* Glowing Lunar Corona Ring */}
          <div
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 105,
              height: 105,
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(186, 230, 253, 0.25) 50%, transparent 72%)',
              filter: 'blur(6px)',
            }}
          />

          {/* ── REALISTIC DETAILED LUNAR SPHERICAL BODY ── */}
          <div
            className="relative rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            style={{
              width: 68,
              height: 68,
              background:
                'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 35%, #94A3B8 70%, #475569 100%)',
              boxShadow:
                '0 0 30px rgba(186, 230, 253, 0.8), 0 0 60px rgba(147, 197, 253, 0.45), inset -8px -6px 14px rgba(15, 23, 42, 0.7), inset 2px 2px 5px rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
            }}
          >
            {/* Lunar Maria & Surface Crater Topology */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-65 pointer-events-none">
              {/* Oceanus Procellarum & Mare Imbrium (Dark Basaltic Plains) */}
              <path
                d="M 28 35 Q 38 24 50 28 Q 58 32 62 42 Q 54 52 42 48 Q 28 44 28 35 Z"
                fill="#334155"
                filter="blur(2.5px)"
              />
              <path
                d="M 52 46 Q 64 42 72 50 Q 75 62 65 68 Q 54 66 52 56 Z"
                fill="#334155"
                filter="blur(2.2px)"
              />
              <path
                d="M 32 60 Q 42 55 48 64 Q 45 74 35 76 Q 26 72 32 60 Z"
                fill="#334155"
                filter="blur(2.5px)"
              />
              {/* Tycho & Copernicus Crater Rings */}
              <circle cx="48" cy="74" r="5" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" opacity="0.8" />
              <circle cx="34" cy="42" r="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" opacity="0.75" />
              <circle cx="68" cy="38" r="3.2" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" opacity="0.7" />
              <circle cx="58" cy="62" r="3" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" opacity="0.6" />
              {/* Subtle Crater Ray Streaks */}
              <line x1="48" y1="74" x2="30" y2="58" stroke="#F1F5F9" strokeWidth="0.6" opacity="0.4" />
              <line x1="48" y1="74" x2="68" y2="60" stroke="#F1F5F9" strokeWidth="0.6" opacity="0.4" />
              <line x1="48" y1="74" x2="44" y2="90" stroke="#F1F5F9" strokeWidth="0.5" opacity="0.35" />
            </svg>
            {/* Crescent Shadow Overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(15, 23, 42, 0.45) 85%)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
