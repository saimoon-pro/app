import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

const REGULATOR_ANGLES: Record<number, number> = {
  1: -75,
  2: -45,
  3: -15,
  4: 15,
  5: 45,
  6: 75,
};

const REGULATOR_NAMES: Record<number, string> = {
  1: 'Cyber Emerald',
  2: 'Vortex Grid',
  3: 'Quantum Flow',
  4: 'Nebula Drive',
  5: 'Matrix Core',
  6: 'Prism Horizon',
};

export default function GearRegulator() {
  const currentRegulator = useStore((s) => s.currentRegulator);
  const setCurrentRegulator = useStore((s) => s.setCurrentRegulator);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;
  const { playHoverTick, playClick } = useSound();

  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startAngle = useRef(REGULATOR_ANGLES[currentRegulator]);
  const currentAngle = REGULATOR_ANGLES[currentRegulator] ?? -75;

  const handleSelect = useCallback((num: number) => {
    if (num < 1 || num > 6) return;
    playClick();
    setCurrentRegulator(num);
  }, [playClick, setCurrentRegulator]);

  // Drag interaction for 3D dial
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startAngle.current = currentAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    // Map horizontal drag delta to angular range
    const sensitivity = 0.6;
    const rawAngle = startAngle.current + deltaX * sensitivity;
    const clampedAngle = Math.max(-85, Math.min(85, rawAngle));

    // Find nearest regulator step
    let closestStep = currentRegulator;
    let minDiff = Infinity;
    Object.entries(REGULATOR_ANGLES).forEach(([step, angle]) => {
      const diff = Math.abs(clampedAngle - angle);
      if (diff < minDiff) {
        minDiff = diff;
        closestStep = Number(step);
      }
    });

    if (closestStep !== currentRegulator) {
      playHoverTick();
      setCurrentRegulator(closestStep);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Mouse wheel rotation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      if (currentRegulator < 6) handleSelect(currentRegulator + 1);
    } else {
      if (currentRegulator > 1) handleSelect(currentRegulator - 1);
    }
  };

  const [mobileDialOpen, setMobileDialOpen] = useState(false);

  return (
    <div
      className="fixed bottom-2 sm:bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none origin-bottom"
      onWheel={handleWheel}
      role="region"
      aria-label="Atmosphere Gear Regulator"
    >
      {/* ── MOBILE / TABLET FLOATING DOCK (< 1024px) ── */}
      <div className="flex lg:hidden flex-col items-center">
        {/* Expandable 3D Dial Drawer for Mobile */}
        {mobileDialOpen && (
          <div className={`mb-2 p-3 rounded-2xl bg-white/95 backdrop-blur-xl border ${isDay ? 'border-[#0066FF]/40 shadow-[0_16px_45px_rgba(0,0,0,0.22),0_0_20px_rgba(0,102,255,0.2)]' : 'border-[#00C853]/40 shadow-[0_16px_45px_rgba(0,0,0,0.25),0_0_20px_rgba(0,200,83,0.2)]'} flex flex-col items-center animate-fade-in`}>
            <div className="flex items-center justify-between w-full mb-1.5 px-1">
              <span className={`font-mono text-[9px] uppercase tracking-wider ${isDay ? 'text-[#0066FF]' : 'text-[#00A84D]'} font-bold`}>
                {currentRegulator}. {REGULATOR_NAMES[currentRegulator]}
              </span>
              <button
                onClick={() => setMobileDialOpen(false)}
                className="text-[10px] font-mono text-black/60 hover:text-black px-1.5 py-0.5 rounded bg-black/5 font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Rotary Dial */}
            <div
              className="relative w-18 h-18 rounded-full p-1.5 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                background: 'radial-gradient(circle, #FFFFFF 0%, #F1F5F3 70%, #E2E8F0 100%)',
                boxShadow: isDay
                  ? '0 10px 25px rgba(0,0,0,0.2), 0 0 12px rgba(0,102,255,0.2), inset 0 2px 3px #FFFFFF'
                  : '0 10px 25px rgba(0,0,0,0.22), 0 0 12px rgba(0,200,83,0.15), inset 0 2px 3px #FFFFFF',
                border: isDay ? '1.5px solid rgba(0,102,255,0.3)' : '1.5px solid rgba(0,200,83,0.3)',
              }}
            >
              {/* Teeth */}
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-2.5 bg-gradient-to-b from-[#FFFFFF] to-[#CBD5E1] rounded-sm pointer-events-none"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-32px)`,
                  }}
                />
              ))}

              {/* Core */}
              <div
                className="relative w-full h-full rounded-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
                style={{
                  transform: `rotate(${currentAngle}deg)`,
                  background: 'conic-gradient(from 180deg at 50% 50%, #FFFFFF 0deg, #E2E8F0 45deg, #CBD5E1 90deg, #F1F5F9 135deg, #E2E8F0 180deg, #FFFFFF 225deg, #CBD5E1 270deg, #E2E8F0 315deg, #FFFFFF 360deg)',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: 'inset 0 1px 2px #FFFFFF, inset 0 -1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <div
                    className="w-1.5 h-3.5 rounded-full"
                    style={{
                      background: isDay ? '#0066FF' : '#00C853',
                      boxShadow: isDay ? '0 0 8px #0066FF' : '0 0 8px #00C853',
                    }}
                  />
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #CBD5E1 80%)',
                    border: isDay ? '1px solid #0066FF' : '1px solid #00C853',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: isDay ? '#0066FF' : '#00C853',
                      boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00C853',
                    }}
                  />
                </div>
              </div>
            </div>

            <span className="font-mono text-[8px] text-black/60 tracking-wider mt-1 font-bold">
              DRAG TO TUNE
            </span>
          </div>
        )}

        {/* Compact Floating Mobile Dock Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xl border ${isDay ? 'border-[#0066FF]/35 shadow-[0_8px_30px_rgba(0,0,0,0.18),0_0_15px_rgba(0,102,255,0.18)]' : 'border-[#00C853]/35 shadow-[0_8px_30px_rgba(0,0,0,0.22),0_0_15px_rgba(0,200,83,0.15)]'}`}>
          {/* Step Left Arrow */}
          <button
            onClick={() => handleSelect(currentRegulator - 1)}
            disabled={currentRegulator <= 1}
            className={`p-1 rounded-full bg-black/5 ${isDay ? 'hover:bg-[#0066FF]/20 hover:text-[#0066FF]' : 'hover:bg-[#00C853]/20 hover:text-[#00C853]'} disabled:opacity-20 text-black transition-all cursor-pointer`}
            aria-label="Previous background"
          >
            <ChevronLeft size={13} />
          </button>

          <Gauge size={12} className={`${isDay ? 'text-[#0066FF]' : 'text-[#00A84D]'} animate-pulse ml-0.5`} />

          {/* Numbers 1 - 6 */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isActive = currentRegulator === num;
              return (
                <button
                  key={num}
                  onClick={() => handleSelect(num)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? isDay
                        ? 'bg-[#0066FF] text-white shadow-[0_0_10px_#0066FF] scale-110'
                        : 'bg-[#00C853] text-black shadow-[0_0_10px_#00C853] scale-110'
                      : 'bg-black/5 hover:bg-black/10 text-black/70 hover:text-black border border-black/10'
                  }`}
                  aria-label={`Atmosphere ${num}: ${REGULATOR_NAMES[num]}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Step Right Arrow */}
          <button
            onClick={() => handleSelect(currentRegulator + 1)}
            disabled={currentRegulator >= 6}
            className={`p-1 rounded-full bg-black/5 ${isDay ? 'hover:bg-[#0066FF]/20 hover:text-[#0066FF]' : 'hover:bg-[#00C853]/20 hover:text-[#00C853]'} disabled:opacity-20 text-black transition-all cursor-pointer`}
            aria-label="Next background"
          >
            <ChevronRight size={13} />
          </button>

          {/* Dial Mode Toggle Button */}
          <button
            onClick={() => {
              playClick();
              setMobileDialOpen((prev) => !prev);
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
              mobileDialOpen
                ? isDay
                  ? 'bg-[#0066FF] text-white font-bold'
                  : 'bg-[#00C853] text-black font-bold'
                : isDay
                ? 'bg-black/5 hover:bg-black/10 text-[#0066FF] border border-[#0066FF]/30 font-bold'
                : 'bg-black/5 hover:bg-black/10 text-[#00A84D] border border-[#00C853]/30 font-bold'
            }`}
            aria-label="Toggle 3D Dial"
          >
            <span>Dial</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP CONTROL SUITE (>= 1024px) ── */}
      <div className="hidden lg:flex flex-col items-center scale-80 lg:scale-85 xl:scale-95 2xl:scale-100 origin-bottom">
        {/* Step Labels 1 - 6 */}
        <div className={`flex items-center gap-2 mb-1.5 px-4 py-1 rounded-full bg-white/95 backdrop-blur-xl border ${isDay ? 'border-[#0066FF]/30 shadow-[0_8px_25px_rgba(0,0,0,0.15),0_0_15px_rgba(0,102,255,0.2)]' : 'border-[#00C853]/30 shadow-[0_8px_25px_rgba(0,0,0,0.2),0_0_15px_rgba(0,200,83,0.15)]'}`}>
          <Gauge size={12} className={`${isDay ? 'text-[#0066FF]' : 'text-[#00A84D]'} animate-pulse`} />
          <span className={`font-mono text-[9px] uppercase tracking-widest ${isDay ? 'text-[#0066FF]' : 'text-[#00A84D]'} font-bold`}>
            ATMOSPHERE
          </span>

          <div className="flex items-center gap-1.5 mx-1">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isActive = currentRegulator === num;
              return (
                <button
                  key={num}
                  onClick={() => handleSelect(num)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? isDay
                        ? 'bg-[#0066FF] text-white shadow-[0_0_12px_#0066FF] scale-110'
                        : 'bg-[#00C853] text-black shadow-[0_0_12px_#00C853] scale-110'
                      : 'bg-black/5 hover:bg-black/15 text-black/75 hover:text-black border border-black/10'
                  }`}
                  aria-label={`Regulator option ${num}: ${REGULATOR_NAMES[num]}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-[9px] text-black/70 tracking-wider font-semibold">
            {REGULATOR_NAMES[currentRegulator]}
          </span>
        </div>

        {/* 3D Rotary Gear Dial */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => handleSelect(currentRegulator - 1)}
            disabled={currentRegulator <= 1}
            className={`mr-2 p-1.5 rounded-full bg-white/90 ${isDay ? 'hover:bg-[#0066FF]/20 hover:text-[#0066FF] hover:border-[#0066FF]/40' : 'hover:bg-[#00C853]/20 hover:text-[#00C853] hover:border-[#00C853]/40'} disabled:opacity-20 text-black border border-black/10 shadow-md transition-all cursor-pointer`}
            aria-label="Previous background"
          >
            <ChevronLeft size={14} />
          </button>

          <div
            className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1.5 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none transition-transform"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              background: 'radial-gradient(circle, #FFFFFF 0%, #F1F5F3 70%, #D8E0DC 100%)',
              boxShadow: isDay
                ? `
                0 14px 30px rgba(0,0,0,0.22),
                0 0 20px rgba(0,102,255,0.25),
                inset 0 2px 4px #FFFFFF,
                inset 0 -2px 5px rgba(0,0,0,0.12)
              `
                : `
                0 14px 30px rgba(0,0,0,0.25),
                0 0 20px rgba(0,200,83,0.2),
                inset 0 2px 4px #FFFFFF,
                inset 0 -2px 5px rgba(0,0,0,0.12)
              `,
              border: isDay ? '2px solid rgba(0,102,255,0.35)' : '2px solid rgba(0,200,83,0.3)',
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-3 bg-gradient-to-b from-[#FFFFFF] to-[#CBD5E1] rounded-sm pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 20}deg) translateY(-37px)`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            ))}

            <div
              className="relative w-full h-full rounded-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
              style={{
                transform: `rotate(${currentAngle}deg)`,
                background: 'conic-gradient(from 180deg at 50% 50%, #FFFFFF 0deg, #E2E8F0 45deg, #CBD5E1 90deg, #F1F5F9 135deg, #E2E8F0 180deg, #FFFFFF 225deg, #CBD5E1 270deg, #E2E8F0 315deg, #FFFFFF 360deg)',
                boxShadow: `
                  inset 0 2px 4px #FFFFFF,
                  inset 0 -2px 4px rgba(0,0,0,0.15),
                  0 0 10px rgba(0,0,0,0.15)
                `,
                border: '1.5px solid #CBD5E1',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 40%, transparent 60%)',
                }}
              />
              <div
                className="absolute inset-2 rounded-full border border-black/10 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
                }}
              />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div
                  className="w-1.5 h-4 rounded-full"
                  style={{
                    background: isDay
                      ? 'linear-gradient(to bottom, #38BDF8, #0066FF)'
                      : 'linear-gradient(to bottom, #00FF66, #00C853)',
                    boxShadow: isDay ? '0 0 8px #0066FF' : '0 0 8px #00C853',
                  }}
                />
                <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#fff]" />
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #CBD5E1 80%)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px #FFFFFF',
                  border: isDay ? '1px solid #0066FF' : '1px solid #00C853',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: isDay ? '#0066FF' : '#00C853',
                    boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00C853',
                  }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelect(currentRegulator + 1)}
            disabled={currentRegulator >= 6}
            className={`ml-2 p-1.5 rounded-full bg-white/90 ${isDay ? 'hover:bg-[#0066FF]/20 hover:text-[#0066FF] hover:border-[#0066FF]/40' : 'hover:bg-[#00C853]/20 hover:text-[#00C853] hover:border-[#00C853]/40'} disabled:opacity-20 text-black border border-black/10 shadow-md transition-all cursor-pointer`}
            aria-label="Next background"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-black/60 font-bold pointer-events-none">
          DRAG OR SCROLL TO TUNE ATMOSPHERE
        </div>
      </div>
    </div>
  );
}
