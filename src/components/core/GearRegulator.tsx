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
          <div className="mb-2 p-3 rounded-2xl bg-[#06120a]/95 backdrop-blur-xl border border-[#00C853]/40 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(0,200,83,0.25)] flex flex-col items-center animate-fade-in">
            <div className="flex items-center justify-between w-full mb-1.5 px-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#00C853]">
                {currentRegulator}. {REGULATOR_NAMES[currentRegulator]}
              </span>
              <button
                onClick={() => setMobileDialOpen(false)}
                className="text-[10px] font-mono text-white/50 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
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
                background: 'radial-gradient(circle, #2a312d 0%, #121814 70%, #080d0a 100%)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.8), 0 0 12px rgba(0,200,83,0.15)',
                border: '1.5px solid rgba(0,200,83,0.25)',
              }}
            >
              {/* Teeth */}
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-2.5 bg-gradient-to-b from-[#3a443e] to-[#151c17] rounded-sm pointer-events-none"
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
                  background: 'conic-gradient(from 180deg at 50% 50%, #1e2420 0deg, #38423b 45deg, #161b18 90deg, #38423b 135deg, #1a201c 180deg, #3d4941 225deg, #151a17 270deg, #38423b 315deg, #1e2420 360deg)',
                  border: '1.5px solid #2e3b33',
                }}
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <div className="w-1.5 h-3.5 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]" />
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #4a574f 0%, #18201a 80%)',
                    border: '1px solid #00C853',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#00C853] shadow-[0_0_6px_#00C853]" />
                </div>
              </div>
            </div>

            <span className="font-mono text-[8px] text-white/40 tracking-wider mt-1">
              DRAG TO TUNE
            </span>
          </div>
        )}

        {/* Compact Floating Mobile Dock Pill (Height: ~36px) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#06120a]/92 backdrop-blur-xl border border-[#00C853]/35 shadow-[0_6px_28px_rgba(0,0,0,0.85),0_0_15px_rgba(0,200,83,0.15)]">
          {/* Step Left Arrow */}
          <button
            onClick={() => handleSelect(currentRegulator - 1)}
            disabled={currentRegulator <= 1}
            className="p-1 rounded-full bg-white/5 hover:bg-[#00C853]/20 disabled:opacity-20 text-white hover:text-[#00C853] transition-all cursor-pointer"
            aria-label="Previous background"
          >
            <ChevronLeft size={13} />
          </button>

          <Gauge size={12} className="text-[#00C853] animate-pulse ml-0.5" />

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
                      ? 'bg-[#00C853] text-black shadow-[0_0_10px_#00C853] scale-110'
                      : 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10'
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
            className="p-1 rounded-full bg-white/5 hover:bg-[#00C853]/20 disabled:opacity-20 text-white hover:text-[#00C853] transition-all cursor-pointer"
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
                ? 'bg-[#00C853] text-black font-bold'
                : 'bg-white/5 hover:bg-white/15 text-[#00FF66] border border-[#00C853]/30'
            }`}
            aria-label="Toggle 3D Dial"
          >
            <span>Dial</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP CONTROL SUITE (>= 1024px) ── */}
      <div className="hidden lg:flex flex-col items-center scale-90 xl:scale-95 2xl:scale-100 origin-bottom">
        {/* Step Labels 1 - 6 */}
        <div className="flex items-center gap-2 mb-1.5 px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#00C853]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <Gauge size={12} className="text-[#00C853] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#00C853]/80">
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
                      ? 'bg-[#00C853] text-black shadow-[0_0_12px_#00C853] scale-110'
                      : 'bg-white/5 hover:bg-white/15 text-white/60 hover:text-white border border-white/10'
                  }`}
                  aria-label={`Regulator option ${num}: ${REGULATOR_NAMES[num]}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-[9px] text-white/50 tracking-wider">
            {REGULATOR_NAMES[currentRegulator]}
          </span>
        </div>

        {/* 3D Rotary Gear Dial */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => handleSelect(currentRegulator - 1)}
            disabled={currentRegulator <= 1}
            className="mr-2 p-1.5 rounded-full bg-black/50 hover:bg-[#00C853]/20 disabled:opacity-20 text-white hover:text-[#00C853] border border-white/10 hover:border-[#00C853]/40 transition-all cursor-pointer"
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
              background: 'radial-gradient(circle, #2a312d 0%, #121814 70%, #080d0a 100%)',
              boxShadow: `
                0 10px 25px rgba(0,0,0,0.8),
                0 0 15px rgba(0,200,83,0.15),
                inset 0 1px 2px rgba(255,255,255,0.25),
                inset 0 -2px 5px rgba(0,0,0,0.8)
              `,
              border: '2px solid rgba(0,200,83,0.2)',
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-3 bg-gradient-to-b from-[#3a443e] to-[#151c17] rounded-sm pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 20}deg) translateY(-37px)`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
                }}
              />
            ))}

            <div
              className="relative w-full h-full rounded-full transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
              style={{
                transform: `rotate(${currentAngle}deg)`,
                background: 'conic-gradient(from 180deg at 50% 50%, #1e2420 0deg, #38423b 45deg, #161b18 90deg, #38423b 135deg, #1a201c 180deg, #3d4941 225deg, #151a17 270deg, #38423b 315deg, #1e2420 360deg)',
                boxShadow: `
                  inset 0 2px 4px rgba(255,255,255,0.4),
                  inset 0 -3px 6px rgba(0,0,0,0.9),
                  0 0 10px rgba(0,0,0,0.8)
                `,
                border: '1.5px solid #2e3b33',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)',
                }}
              />
              <div
                className="absolute inset-2 rounded-full border border-black/50 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
                }}
              />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div
                  className="w-1.5 h-4 rounded-full bg-[#00C853] shadow-[0_0_8px_#00C853]"
                  style={{
                    background: 'linear-gradient(to bottom, #00FF66, #00C853)',
                  }}
                />
                <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#fff]" />
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #4a574f 0%, #18201a 80%)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.4)',
                  border: '1px solid #00C853',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#00C853] shadow-[0_0_6px_#00C853]" />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelect(currentRegulator + 1)}
            disabled={currentRegulator >= 6}
            className="ml-2 p-1.5 rounded-full bg-black/50 hover:bg-[#00C853]/20 disabled:opacity-20 text-white hover:text-[#00C853] border border-white/10 hover:border-[#00C853]/40 transition-all cursor-pointer"
            aria-label="Next background"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/40 pointer-events-none">
          DRAG OR SCROLL TO TUNE ATMOSPHERE
        </div>
      </div>
    </div>
  );
}
