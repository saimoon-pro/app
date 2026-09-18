import { useCallback, useEffect, useState, useRef, useId } from 'react';
import { Briefcase, Film, Palette, Globe, Sparkles, Mail, RotateCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import type { OrbitNodeId } from '@/types/content';

// 16-Tooth Mechanical Multi-Star Gear SVG Path with pronounced cog teeth
const STAR_GEAR_PATH = (() => {
  const teeth = 16;
  const cx = 50;
  const cy = 50;
  const rOuter = 48.5;
  const rInner = 34.0;
  const step = (2 * Math.PI) / teeth;
  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const baseAngle = i * step;
    // 4 points per tooth to create pronounced mechanical star gear teeth
    const a1 = baseAngle - step * 0.36;
    const a2 = baseAngle - step * 0.17;
    const a3 = baseAngle + step * 0.17;
    const a4 = baseAngle + step * 0.36;

    const x1 = (cx + rInner * Math.sin(a1)).toFixed(2);
    const y1 = (cy - rInner * Math.cos(a1)).toFixed(2);
    const x2 = (cx + rOuter * Math.sin(a2)).toFixed(2);
    const y2 = (cy - rOuter * Math.cos(a2)).toFixed(2);
    const x3 = (cx + rOuter * Math.sin(a3)).toFixed(2);
    const y3 = (cy - rOuter * Math.cos(a3)).toFixed(2);
    const x4 = (cx + rInner * Math.sin(a4)).toFixed(2);
    const y4 = (cy - rInner * Math.cos(a4)).toFixed(2);

    if (i === 0) points.push(`M ${x1} ${y1}`);
    else points.push(`L ${x1} ${y1}`);
    points.push(`L ${x2} ${y2}`);
    points.push(`L ${x3} ${y3}`);
    points.push(`L ${x4} ${y4}`);
  }
  points.push('Z');
  return points.join(' ');
})();

// Enlarged orbit sizing and bigger icons across all screens
function useOrbitalSize() {
  const [size, setSize] = useState({ radius: 215, nodeSize: 76 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (w < 380) {
        setSize({ radius: 104, nodeSize: 40 });
      } else if (w < 480) {
        setSize({ radius: 116, nodeSize: 44 });
      } else if (w < 640) {
        setSize({ radius: 130, nodeSize: 50 });
      } else if (w < 768) {
        setSize({ radius: 145, nodeSize: 54 });
      } else if (w < 1024) {
        setSize({ radius: 160, nodeSize: 60 });
      } else {
        // Desktop responsive calculation guaranteeing breathing room from header and footer
        const availableH = h - 165; // clearance for top header (~60px) and bottom regulator (~105px)
        const maxRadiusByH = (availableH / 2) - 62;
        const maxRadiusByW = (w * 0.46 / 2) - 45;
        const radius = Math.round(Math.max(160, Math.min(245, Math.min(maxRadiusByH, maxRadiusByW))));
        const nodeSize = Math.round(Math.max(58, Math.min(78, radius * 0.32)));
        setSize({ radius, nodeSize });
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

const NODE_COUNT = 6;

const nodes: { id: OrbitNodeId; label: string; Icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number; style?: React.CSSProperties }> }[] = [
  { id: 'career', label: 'Career', Icon: Briefcase },
  { id: 'video', label: 'Video Editing', Icon: Film },
  { id: 'design', label: 'Graphical Works', Icon: Palette },
  { id: 'web', label: 'Website Projects', Icon: Globe },
  { id: 'ai', label: 'AI Assistant', Icon: Sparkles },
  { id: 'contact', label: 'Contact', Icon: Mail },
];

export default function OrbitalNav() {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [hoveredNode, setHoveredNode] = useState<OrbitNodeId | null>(null);
  const [showHint, setShowHint] = useState(true);
  const activeNode = useStore((s) => s.activeNode);
  const setActiveNode = useStore((s) => s.setActiveNode);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;
  const { playHoverTick, playClick, playPanelOpen } = useSound();
  const { radius: ORBIT_RADIUS, nodeSize: NODE_SIZE } = useOrbitalSize();

  // Rotary Regulator Navigation for Orbit System (Touch/Mobile & Mouse Drag)
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isRotatingRef = useRef(false);
  const lastPointerAngleRef = useRef(0);
  const totalRotatedDistanceRef = useRef(0);
  const hasRotatedRef = useRef(false);
  const lastTickAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Clean up momentum glide animation on unmount and ensure global pointer release
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (isRotatingRef.current) {
        isRotatingRef.current = false;
        setIsDragging(false);
        setTimeout(() => {
          hasRotatedRef.current = false;
        }, 80);
      }
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);

    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Pointer Down (Mobile Touch / Mouse Drag) - only starts tracking when pressed
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button (left click) or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!containerRef.current) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    isRotatingRef.current = true;
    lastPointerAngleRef.current = currentAngle;
    totalRotatedDistanceRef.current = 0;
    hasRotatedRef.current = false;
    lastTickAngleRef.current = rotationAngle;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  // Pointer Move (Circular rotary tracking) - NEVER rotates on passive cursor hover
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // STRICT GUARD: If mouse pointer is moving without the left button pressed (buttons === 0),
    // this is pure cursor hover! It must NEVER rotate on hover!
    if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
      if (isRotatingRef.current) {
        isRotatingRef.current = false;
        setIsDragging(false);
      }
      return;
    }

    if (!isRotatingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    let delta = currentAngle - lastPointerAngleRef.current;
    // Normalize angular wrap-around across -180 / +180
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;

    totalRotatedDistanceRef.current += Math.abs(delta);
    
    // Only engage drag rotation when intentional rotary movement is detected (> 4 degrees)
    if (totalRotatedDistanceRef.current > 4) {
      hasRotatedRef.current = true;
      if (!isDragging) {
        setIsDragging(true);
        try {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        } catch {
          // safe fallback
        }
      }
    }

    if (!hasRotatedRef.current) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveTimeRef.current);
    // Angular velocity in deg per 16ms
    velocityRef.current = (delta / dt) * 16;
    lastMoveTimeRef.current = now;
    lastPointerAngleRef.current = currentAngle;

    setRotationAngle((prev) => {
      const next = prev + delta;
      // Mechanical detent sound tick every 15 degrees rotated like a physical regulator
      if (Math.abs(next - lastTickAngleRef.current) >= 15) {
        playHoverTick();
        lastTickAngleRef.current = next;
      }
      return next;
    });
  };

  // Pointer Up / Release with inertia glide
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRotatingRef.current) return;
    isRotatingRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // safe fallback
    }

    // Inertial momentum glide decay
    if (hasRotatedRef.current) {
      let vel = Math.max(-14, Math.min(14, velocityRef.current));
      if (Math.abs(vel) > 0.3) {
        const decay = () => {
          vel *= 0.92;
          setRotationAngle((prev) => {
            const next = prev + vel;
            if (Math.abs(next - lastTickAngleRef.current) >= 15) {
              playHoverTick();
              lastTickAngleRef.current = next;
            }
            return next;
          });
          if (Math.abs(vel) > 0.08) {
            animFrameRef.current = requestAnimationFrame(decay);
          }
        };
        animFrameRef.current = requestAnimationFrame(decay);
      }

      // Briefly keep hasRotatedRef true so child button click is suppressed after drag
      setTimeout(() => {
        hasRotatedRef.current = false;
      }, 150);
    }
  };

  // Hide hint after first interaction
  useEffect(() => {
    if (activeNode) setShowHint(false);
  }, [activeNode]);

  // Auto-hide hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Node position calculation around orbit ring
  const getNodePosition = useCallback((angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * ORBIT_RADIUS,
      y: Math.sin(angleRad) * ORBIT_RADIUS,
    };
  }, [ORBIT_RADIUS]);

  // Node click - opens option panel, plays click and open audio, updates Zustand store
  const lastClickTimeRef = useRef(0);
  const handleNodeClick = useCallback((nodeId: OrbitNodeId) => {
    if (hasRotatedRef.current) return;
    const now = performance.now();
    if (now - lastClickTimeRef.current < 250) return; // Prevent duplicate rapid triggers
    lastClickTimeRef.current = now;

    playClick();
    setTimeout(() => playPanelOpen(), 120);
    setActiveNode(nodeId);
  }, [playClick, playPanelOpen, setActiveNode]);

  const iconSize = NODE_SIZE < 60 ? 25 : NODE_SIZE < 75 ? 30 : NODE_SIZE < 85 ? 35 : 38;
  const labelFontSize = NODE_SIZE < 60 ? 10 : NODE_SIZE < 75 ? 11 : 12;

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none cursor-grab active:cursor-grabbing"
      style={{
        width: ORBIT_RADIUS * 2 + 80,
        height: ORBIT_RADIUS * 2 + 80,
        filter: 'drop-shadow(var(--sun-shadow-x, 0px) var(--sun-shadow-y, 14px) 26px rgba(0, 0, 0, 0.45))',
      }}
      role="radiogroup"
      aria-label="Site navigation universe"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── ROTATING REGULATOR ORBIT RING ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: ORBIT_RADIUS * 2,
          height: ORBIT_RADIUS * 2,
          top: 40,
          left: 40,
          border: isDay ? '1.5px solid rgba(0, 102, 255, 0.45)' : '1.5px solid rgba(0, 160, 60, 0.35)',
          boxShadow: isDay ? '0 0 30px rgba(0, 102, 255, 0.35)' : '0 0 25px rgba(0, 90, 35, 0.2)',
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.12s ease-out',
        }}
      >
        {/* Glow dots & tick notches along rotating regulator ring */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const isPrimary = i % 6 === 0;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: isPrimary ? 5 : 2,
                height: isPrimary ? 5 : 2,
                background: isPrimary ? (isDay ? '#0066FF' : '#00FF66') : isDay ? 'rgba(0, 102, 255, 0.6)' : 'rgba(0, 140, 50, 0.4)',
                boxShadow: isPrimary ? (isDay ? '0 0 8px #0066FF' : '0 0 8px #00FF66') : 'none',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${Math.cos(angle) * ORBIT_RADIUS}px, ${Math.sin(angle) * ORBIT_RADIUS}px)`,
              }}
            />
          );
        })}
      </div>

      {/* ── ORBIT NODES (ROTATING LIKE A REGULATOR WHEEL) ── */}
      {nodes.map((node, index) => {
        // 6 evenly spaced positions rotated by rotationAngle
        const nodeAngle = -90 + (360 / NODE_COUNT) * index + rotationAngle;
        const pos = getNodePosition(nodeAngle);
        const isActive = activeNode === node.id;
        const isHovered = hoveredNode === node.id;
        const { Icon } = node;

        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center justify-center z-20"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
            }}
          >
            {/* Clickable Button Node */}
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`Open ${node.label}`}
              className="relative flex items-center justify-center rounded-full transition-transform duration-300 cursor-pointer group"
              style={{
                width: NODE_SIZE,
                height: NODE_SIZE,
                transform: `scale(${isActive ? 1.2 : isHovered ? 1.12 : 1})`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node.id);
              }}
              onPointerUp={(e) => {
                if (!hasRotatedRef.current && (e.button === 0 || e.pointerType === 'touch')) {
                  handleNodeClick(node.id);
                }
              }}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                playHoverTick();
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* ── 1. CONTINUOUSLY ROTATING MULTI-STAR GEAR (DAY WHITE / NIGHT OBSIDIAN) ── */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{
                  animation: 'machine-rotate 12s linear infinite',
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  style={{
                    filter: isDay
                      ? isActive
                        ? 'drop-shadow(0 0 18px rgba(0, 102, 255, 0.95)) drop-shadow(0 0 36px rgba(0, 102, 255, 0.6)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3))'
                        : isHovered
                        ? 'drop-shadow(0 0 14px rgba(0, 102, 255, 0.85)) drop-shadow(0 0 28px rgba(0, 102, 255, 0.5)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22))'
                        : 'drop-shadow(0 0 12px rgba(0, 102, 255, 0.75)) drop-shadow(0 0 20px rgba(0, 102, 255, 0.4)) drop-shadow(0 3px 8px rgba(0, 0, 0, 0.18))'
                      : isActive
                      ? 'drop-shadow(0 0 12px rgba(0, 160, 60, 0.85)) drop-shadow(0 0 24px rgba(0, 90, 30, 0.6))'
                      : isHovered
                      ? 'drop-shadow(0 0 10px rgba(0, 140, 50, 0.75)) drop-shadow(0 0 18px rgba(0, 70, 25, 0.5))'
                      : 'drop-shadow(0 0 8px rgba(0, 60, 20, 0.7)) drop-shadow(0 0 14px rgba(0, 40, 15, 0.45))',
                  }}
                >
                  <defs>
                    {isDay ? (
                      <radialGradient id={`gearGrad-${instanceId}-${node.id}`} cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="40%" stopColor="#F8FAF9" />
                        <stop offset="75%" stopColor="#E2E8F0" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                      </radialGradient>
                    ) : (
                      <radialGradient id={`gearGrad-${instanceId}-${node.id}`} cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#00461E" />
                        <stop offset="45%" stopColor="#002A12" />
                        <stop offset="85%" stopColor="#001809" />
                        <stop offset="100%" stopColor="#000F05" />
                      </radialGradient>
                    )}
                    <linearGradient id={`gearStroke-${instanceId}-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isDay ? (isActive ? "#0066FF" : "#FFFFFF") : (isActive ? "#00A84D" : "#005E27")} />
                      <stop offset="100%" stopColor={isDay ? (isActive ? "#0048B3" : "#94A3B8") : (isActive ? "#005224" : "#003615")} />
                    </linearGradient>
                  </defs>

                  {/* Multi-Star Gear Cog Body */}
                  <path
                    d={STAR_GEAR_PATH}
                    fill={`url(#gearGrad-${instanceId}-${node.id})`}
                    stroke={`url(#gearStroke-${instanceId}-${node.id})`}
                    strokeWidth={isDay ? "2" : "1.8"}
                    strokeLinejoin="round"
                  />

                  {/* Intermediate Beveled Rim */}
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill={isDay ? "#FFFFFF" : "#001608"}
                    stroke={isDay ? "#CBD5E1" : "#00421A"}
                    strokeWidth="1.2"
                  />

                  {/* Milled Tech Dash Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="24"
                    fill="none"
                    stroke={isDay ? "rgba(0, 102, 255, 0.55)" : (isActive ? "rgba(0, 200, 83, 0.45)" : "rgba(0, 130, 45, 0.3)")}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Center Socket */}
                  <circle
                    cx="50"
                    cy="50"
                    r="19"
                    fill={isDay ? "#F1F5F9" : "#000F05"}
                    stroke={isDay ? "#0066FF" : "#002B11"}
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* ── 2. OUTLINED 3D EXTRUDED ICON ON TOP (HIGH CONTRAST) ── */}
              <div
                className="relative z-10 flex items-center justify-center pointer-events-none transition-all duration-300"
                style={{
                  transform: 'none',
                  color: isDay ? (isActive ? '#0066FF' : '#0B2546') : '#00FF66',
                  filter: isDay
                    ? 'drop-shadow(0 1px 0 #FFFFFF) drop-shadow(0 2px 1px rgba(0, 102, 255, 0.5)) drop-shadow(0 0 8px rgba(0, 102, 255, 0.75))'
                    : 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))',
                }}
              >
                <Icon size={iconSize} strokeWidth={2.6} />
              </div>

              {/* Subtle Pulsing Hint Ripple on First Load */}
              {showHint && !isActive && (
                <span
                  className="absolute inset-[-4px] rounded-full pointer-events-none"
                  style={{
                    border: isDay ? '1.5px solid rgba(0, 102, 255, 0.5)' : '1.5px solid rgba(0, 140, 50, 0.5)',
                    animation: 'orbit-hint-pulse 2.2s ease-in-out infinite',
                    animationDelay: `${index * 0.3}s`,
                  }}
                />
              )}

              {/* Hover Tooltip Pill */}
              {isHovered && (
                <span
                  className="absolute font-mono text-[9px] font-bold uppercase whitespace-nowrap pointer-events-none z-30"
                  style={{
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: isDay ? '#0066FF' : '#00FF66',
                    letterSpacing: '0.08em',
                    background: isDay ? 'rgba(255, 255, 255, 0.95)' : 'rgba(2, 12, 6, 0.95)',
                    border: isDay ? '1px solid rgba(0, 102, 255, 0.5)' : '1px solid rgba(0, 140, 50, 0.5)',
                    padding: '2px 9px',
                    borderRadius: 999,
                    boxShadow: isDay ? '0 4px 15px rgba(0,0,0,0.25), 0 0 10px rgba(0,102,255,0.3)' : '0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(0,80,30,0.3)',
                    animation: 'fade-in-up 0.2s ease-out',
                  }}
                >
                  Explore {node.label}
                </span>
              )}
            </button>

            {/* ── 3. BOLD TEXT LABEL — CLICKABLE & HIGH CONTRAST ── */}
            <button
              type="button"
              aria-label={`Open ${node.label}`}
              className="mt-1.5 font-display font-bold uppercase whitespace-nowrap transition-all duration-300 cursor-pointer z-30 px-2 py-0.5 rounded focus:outline-none"
              style={{
                fontSize: labelFontSize,
                letterSpacing: '0.08em',
                color: isDay
                  ? isActive
                    ? '#0066FF'
                    : isHovered
                    ? '#000000'
                    : '#0F172A'
                  : isActive
                  ? '#00FF66'
                  : isHovered
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.85)',
                textShadow: isDay
                  ? '0 1px 1px #FFFFFF, 0 0 10px rgba(0, 102, 255, 0.3)'
                  : isActive || isHovered
                  ? '0 0 10px rgba(0, 160, 60, 0.8), 0 2px 4px rgba(0,0,0,0.95)'
                  : '0 2px 4px rgba(0,0,0,0.95)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node.id);
              }}
              onPointerUp={(e) => {
                if (!hasRotatedRef.current && (e.button === 0 || e.pointerType === 'touch')) {
                  handleNodeClick(node.id);
                }
              }}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                playHoverTick();
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {node.label}
            </button>
          </div>
        );
      })}

      {/* Mobile rotate & tap helper instruction */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden"
        style={{
          bottom: -32,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <RotateCw size={13} className="text-[#00C853] animate-spin" style={{ animationDuration: '6s' }} />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/80">
          Rotate orbit like regulator • Tap to explore
        </span>
      </div>
    </div>
  );
}
