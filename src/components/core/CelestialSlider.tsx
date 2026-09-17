import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Sun, Moon, Sunrise } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

export default function CelestialSlider() {
  const timeOfDay = useStore((s) => s.timeOfDay);
  const setTimeOfDay = useStore((s) => s.setTimeOfDay);
  const isAutoClock = useStore((s) => s.isAutoClock);
  const setIsAutoClock = useStore((s) => s.setIsAutoClock);
  const { playClick } = useSound();

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  // Convert timeOfDay (0.0 to 24.0) into slider position 0% to 100%
  // 0% (Left) = Morning (6 AM)
  // 50% (Center) = High Noon / Day Mode (12 PM)
  // 100% (Right) = Midnight / Night Mode (12 AM / 24:00)
  const timeToSliderPercent = useCallback((hours: number): number => {
    if (hours >= 6.0 && hours <= 12.0) {
      // 6 AM to 12 PM -> 0% to 50%
      return ((hours - 6.0) / 6.0) * 50;
    } else if (hours > 12.0 && hours <= 24.0) {
      // 12 PM to 24:00 -> 50% to 100%
      return 50 + ((hours - 12.0) / 12.0) * 50;
    } else {
      // 0 AM to 6 AM (Night) -> mapped to 85% to 100%
      return 100 - (hours / 6.0) * 15;
    }
  }, []);

  // Convert slider position 0% to 100% into timeOfDay (hours 0.0 to 24.0)
  const sliderPercentToTime = useCallback((pct: number): number => {
    const clamped = Math.max(0, Math.min(100, pct));
    if (clamped <= 50) {
      // 0% to 50% -> 6.0 to 12.0 hours (Morning to Noon)
      return 6.0 + (clamped / 50.0) * 6.0;
    } else {
      // 50% to 100% -> 12.0 to 24.0 hours (Noon to Sunset to Midnight)
      return 12.0 + ((clamped - 50.0) / 50.0) * 12.0;
    }
  }, []);

  const currentPercent = timeToSliderPercent(timeOfDay);

  // Format digital clock time (e.g. "12:30 PM")
  const formatTime = (hoursFloat: number) => {
    let totalMins = Math.floor(hoursFloat * 60);
    if (totalMins >= 1440) totalMins = 0;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  const getStageLabel = (hours: number) => {
    if (hours >= 5.5 && hours < 9.0) return 'Morning';
    if (hours >= 9.0 && hours < 15.0) return 'Day Mode';
    if (hours >= 15.0 && hours < 19.5) return 'Sunset';
    return 'Night Mode';
  };

  // Drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderTrackRef.current) return;
    setIsDragging(true);
    setIsAutoClock(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = sliderTrackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setTimeOfDay(sliderPercentToTime(pct));
    playClick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setTimeOfDay(sliderPercentToTime(pct));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Quick Preset Snaps
  const handlePreset = (targetTime: number) => {
    playClick();
    setIsAutoClock(false);
    setTimeOfDay(targetTime);
  };

  const handleToggleAuto = () => {
    playClick();
    if (!isAutoClock) {
      const d = new Date();
      setTimeOfDay(d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600);
      setIsAutoClock(true);
    } else {
      setIsAutoClock(false);
    }
  };

  const isDay = timeOfDay >= 8.5 && timeOfDay <= 16.5;

  return (
    <div
      className="hidden md:flex fixed top-2 sm:top-3 lg:top-4 left-1/2 -translate-x-1/2 z-40 flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── MAIN APPLE LIQUID GLASS CELESTIAL CONTROLLER CAPSULE ── */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 shadow-2xl"
        style={{
          background: isDay
            ? 'rgba(255, 255, 255, 0.72)'
            : 'rgba(7, 18, 12, 0.85)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: isDay
            ? '1.5px solid rgba(0, 200, 83, 0.35)'
            : '1.5px solid rgba(0, 230, 118, 0.4)',
          boxShadow: isDay
            ? '0 10px 35px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 200, 83, 0.15), inset 0 1px 1px #fff'
            : '0 10px 35px rgba(0, 0, 0, 0.75), 0 0 25px rgba(0, 200, 83, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Left Indicator: Morning Icon */}
        <button
          onClick={() => handlePreset(7.0)}
          className="flex items-center justify-center w-6 h-6 rounded-full transition-all cursor-pointer hover:scale-110"
          style={{
            color: timeOfDay >= 5.5 && timeOfDay < 9.5 ? '#F59E0B' : isDay ? '#64748B' : '#94A3B8',
          }}
          title="Morning (7:00 AM)"
          aria-label="Set Morning"
        >
          <Sunrise size={14} />
        </button>

        {/* ── CELESTIAL SLIDER TRACK ── */}
        <div
          ref={sliderTrackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-32 sm:w-44 md:w-56 h-7 flex items-center cursor-pointer touch-none group"
        >
          {/* Track Baseline Bar */}
          <div
            className="w-full h-2 rounded-full overflow-hidden relative shadow-inner"
            style={{
              background: isDay
                ? 'linear-gradient(90deg, #FDBA74 0%, #00E676 50%, #1E293B 100%)'
                : 'linear-gradient(90deg, #D97706 0%, #00C853 50%, #0F172A 100%)',
              opacity: 0.85,
            }}
          >
            {/* Center High Noon Notch Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2 bg-white shadow-[0_0_4px_#fff]"
              title="Day Mode / High Noon"
            />
          </div>

          {/* Draggable Celestial Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full transition-transform duration-75 cursor-grab active:cursor-grabbing"
            style={{
              left: `${currentPercent}%`,
              width: 26,
              height: 26,
              background: isDay
                ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FBBF24 50%, #D97706 100%)'
                : 'radial-gradient(circle at 35% 35%, #E2E8F0 0%, #00E676 60%, #007A33 100%)',
              boxShadow: isDay
                ? '0 0 15px #F59E0B, 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px #fff'
                : '0 0 15px #00FF66, 0 4px 12px rgba(0,0,0,0.8), inset 0 1px 1px #fff',
              border: '2px solid #FFFFFF',
              transform: isDragging ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%) scale(1)',
            }}
          >
            {isDay ? (
              <Sun size={13} className="text-amber-900" />
            ) : (
              <Moon size={12} className="text-black" />
            )}
          </div>
        </div>

        {/* Right Indicator: Night Icon */}
        <button
          onClick={() => handlePreset(23.0)}
          className="flex items-center justify-center w-6 h-6 rounded-full transition-all cursor-pointer hover:scale-110"
          style={{
            color: timeOfDay < 5.5 || timeOfDay >= 19.5 ? '#38BDF8' : isDay ? '#64748B' : '#94A3B8',
          }}
          title="Night (11:00 PM)"
          aria-label="Set Night"
        >
          <Moon size={13} />
        </button>

        {/* Divider */}
        <div
          className="w-px h-4"
          style={{ background: isDay ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.18)' }}
        />

        {/* Digital Time & Status Display */}
        <div className="flex items-center gap-1.5 pl-0.5">
          <span
            className="font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap"
            style={{ color: isDay ? '#042F1A' : '#00FF66' }}
          >
            {formatTime(timeOfDay)}
          </span>

          <span
            className="hidden md:inline-block font-mono text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold tracking-wider"
            style={{
              background: isDay ? 'rgba(0, 200, 83, 0.15)' : 'rgba(0, 200, 83, 0.2)',
              color: isDay ? '#007A33' : '#00FF66',
              border: isDay ? '1px solid rgba(0, 200, 83, 0.3)' : '1px solid rgba(0, 255, 102, 0.3)',
            }}
          >
            {getStageLabel(timeOfDay)}
          </span>
        </div>

        {/* Live 24H Clock Sync Toggle Button */}
        <button
          onClick={handleToggleAuto}
          className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer"
          style={{
            background: isAutoClock
              ? 'linear-gradient(135deg, #00C853 0%, #00E676 100%)'
              : isDay
              ? 'rgba(0, 0, 0, 0.06)'
              : 'rgba(255, 255, 255, 0.08)',
            color: isAutoClock ? '#000000' : isDay ? '#475569' : '#94A3B8',
            boxShadow: isAutoClock ? '0 0 10px rgba(0, 200, 83, 0.5)' : 'none',
            border: isAutoClock ? 'none' : '1px solid rgba(0, 200, 83, 0.25)',
          }}
          title={isAutoClock ? 'Live 24h Clock Active' : 'Switch to Live 24h Clock'}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isAutoClock ? 'bg-black animate-ping' : isDay ? 'bg-slate-400' : 'bg-slate-500'
            }`}
          />
          <span>{isAutoClock ? 'LIVE 24H' : 'MANUAL'}</span>
        </button>
      </div>

      {/* Quick Snap Preset Drawer on Hover */}
      {(isHovered || isDragging) && (
        <div
          className="flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full animate-fade-in text-[9px] font-mono"
          style={{
            background: isDay ? 'rgba(255, 255, 255, 0.85)' : 'rgba(6, 20, 12, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 200, 83, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="text-gray-400 pr-1">JUMP:</span>
          <button
            onClick={() => handlePreset(7.5)}
            className="px-2 py-0.5 rounded hover:bg-emerald-500/20 text-[#00FF66] transition-colors cursor-pointer"
          >
            🌅 Morning
          </button>
          <button
            onClick={() => handlePreset(12.5)}
            className="px-2 py-0.5 rounded hover:bg-emerald-500/20 text-[#00FF66] font-bold transition-colors cursor-pointer"
          >
            ☀️ Center (Day)
          </button>
          <button
            onClick={() => handlePreset(18.0)}
            className="px-2 py-0.5 rounded hover:bg-emerald-500/20 text-[#00FF66] transition-colors cursor-pointer"
          >
            🌆 Sunset
          </button>
          <button
            onClick={() => handlePreset(23.5)}
            className="px-2 py-0.5 rounded hover:bg-emerald-500/20 text-[#00FF66] transition-colors cursor-pointer"
          >
            🌙 Night
          </button>
        </div>
      )}
    </div>
  );
}
