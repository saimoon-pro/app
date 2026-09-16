import { useCallback, useEffect, useState, useId } from 'react';
import { Briefcase, Film, Palette, Globe, Sparkles, Mail, MousePointerClick } from 'lucide-react';
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

      if (w < 480) {
        setSize({ radius: 135, nodeSize: 56 });
      } else if (w < 640) {
        setSize({ radius: 155, nodeSize: 62 });
      } else if (w < 768) {
        setSize({ radius: 180, nodeSize: 68 });
      } else if (w < 1024) {
        setSize({ radius: 205, nodeSize: 74 });
      } else if (h < 700) {
        // Shorter screen heights like 633px
        setSize({ radius: 215, nodeSize: 76 });
      } else if (w < 1440) {
        setSize({ radius: 245, nodeSize: 82 });
      } else {
        setSize({ radius: 270, nodeSize: 88 });
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
  const { playHoverTick, playClick, playPanelOpen } = useSound();
  const { radius: ORBIT_RADIUS, nodeSize: NODE_SIZE } = useOrbitalSize();

  // Hide hint after first interaction
  useEffect(() => {
    if (activeNode) setShowHint(false);
  }, [activeNode]);

  // Auto-hide hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Node position calculation around stationary ring
  const getNodePosition = useCallback((angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * ORBIT_RADIUS,
      y: Math.sin(angleRad) * ORBIT_RADIUS,
    };
  }, [ORBIT_RADIUS]);

  // Node click
  const handleNodeClick = useCallback((nodeId: OrbitNodeId) => {
    playClick();
    setTimeout(() => playPanelOpen(), 200);
    setActiveNode(nodeId);
  }, [playClick, playPanelOpen, setActiveNode]);

  // Keyboard shortcuts 1-6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeNode) {
        if (e.key === 'Escape') setActiveNode(null);
        return;
      }
      if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key) - 1;
        handleNodeClick(nodes[idx].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNode, handleNodeClick, setActiveNode]);

  const iconSize = NODE_SIZE < 60 ? 25 : NODE_SIZE < 75 ? 30 : NODE_SIZE < 85 ? 35 : 38;
  const labelFontSize = NODE_SIZE < 60 ? 10 : NODE_SIZE < 75 ? 11 : 12;

  return (
    <div
      className="relative select-none"
      style={{ width: ORBIT_RADIUS * 2 + 80, height: ORBIT_RADIUS * 2 + 80 }}
      role="radiogroup"
      aria-label="Site navigation universe"
    >
      {/* ── FIXED STATIONARY ORBIT RING (NO ROTATION) ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: ORBIT_RADIUS * 2,
          height: ORBIT_RADIUS * 2,
          top: 40,
          left: 40,
          border: '1px solid rgba(0, 140, 50, 0.25)',
          boxShadow: '0 0 25px rgba(0, 80, 30, 0.15)',
        }}
      >
        {/* Glow dots along stationary ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 4 === 0 ? 4 : 2,
                height: i % 4 === 0 ? 4 : 2,
                background: i % 4 === 0 ? '#00A84D' : 'rgba(0, 120, 45, 0.35)',
                boxShadow: i % 4 === 0 ? '0 0 6px #00C853' : 'none',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${Math.cos(angle) * ORBIT_RADIUS}px, ${Math.sin(angle) * ORBIT_RADIUS}px)`,
              }}
            />
          );
        })}
      </div>

      {/* ── ORBIT NODES (STATIONARY POSITIONS AROUND PROFILE) ── */}
      {nodes.map((node, index) => {
        // 6 evenly spaced positions starting from top (-90 deg)
        const nodeAngle = -90 + (360 / NODE_COUNT) * index;
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
              role="radio"
              aria-checked={isActive}
              aria-label={`Open ${node.label}`}
              className="relative flex items-center justify-center rounded-full transition-transform duration-300 cursor-pointer group"
              style={{
                width: NODE_SIZE,
                height: NODE_SIZE,
                transform: `scale(${isActive ? 1.2 : isHovered ? 1.12 : 1})`,
              }}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                playHoverTick();
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* ── 1. CONTINUOUSLY ROTATING MULTI-STAR GEAR (DARK-TYPE GREEN) ── */}
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
                    filter: isActive
                      ? 'drop-shadow(0 0 12px rgba(0, 160, 60, 0.85)) drop-shadow(0 0 24px rgba(0, 90, 30, 0.6))'
                      : isHovered
                      ? 'drop-shadow(0 0 10px rgba(0, 140, 50, 0.75)) drop-shadow(0 0 18px rgba(0, 70, 25, 0.5))'
                      : 'drop-shadow(0 0 8px rgba(0, 60, 20, 0.7)) drop-shadow(0 0 14px rgba(0, 40, 15, 0.45))',
                  }}
                >
                  <defs>
                    <radialGradient id={`gearGrad-${instanceId}-${node.id}`} cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#00461E" />
                      <stop offset="45%" stopColor="#002A12" />
                      <stop offset="85%" stopColor="#001809" />
                      <stop offset="100%" stopColor="#000F05" />
                    </radialGradient>
                    <linearGradient id={`gearStroke-${instanceId}-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isActive ? "#00A84D" : "#005E27"} />
                      <stop offset="100%" stopColor={isActive ? "#005224" : "#003615"} />
                    </linearGradient>
                  </defs>

                  {/* Multi-Star Gear Cog Body */}
                  <path
                    d={STAR_GEAR_PATH}
                    fill={`url(#gearGrad-${instanceId}-${node.id})`}
                    stroke={`url(#gearStroke-${instanceId}-${node.id})`}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  {/* Intermediate Beveled Rim */}
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="#001608"
                    stroke="#00421A"
                    strokeWidth="1.2"
                  />

                  {/* Milled Tech Dash Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="24"
                    fill="none"
                    stroke={isActive ? "rgba(0, 200, 83, 0.45)" : "rgba(0, 130, 45, 0.3)"}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Center Socket */}
                  <circle
                    cx="50"
                    cy="50"
                    r="19"
                    fill="#000F05"
                    stroke="#002B11"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* ── 2. WHITE ICON ON TOP — COMPLETELY STILL & UPRIGHT (NO ROTATION) ── */}
              <div
                className="relative z-10 flex items-center justify-center pointer-events-none text-white transition-transform duration-200"
                style={{
                  transform: 'none', // Icon stays still
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                }}
              >
                <Icon size={iconSize} strokeWidth={2.4} />
              </div>

              {/* Subtle Pulsing Hint Ripple on First Load */}
              {showHint && !isActive && (
                <span
                  className="absolute inset-[-4px] rounded-full pointer-events-none"
                  style={{
                    border: '1.5px solid rgba(0, 140, 50, 0.5)',
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
                    color: '#00FF66',
                    letterSpacing: '0.08em',
                    background: 'rgba(2, 12, 6, 0.95)',
                    border: '1px solid rgba(0, 140, 50, 0.5)',
                    padding: '2px 9px',
                    borderRadius: 999,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.7), 0 0 10px rgba(0,80,30,0.4)',
                    animation: 'fade-in-up 0.2s ease-out',
                  }}
                >
                  Explore {node.label}
                </span>
              )}
            </button>

            {/* ── 3. BOLD TEXT LABEL — COMPLETELY STILL & HIGH CONTRAST ── */}
            <span
              className="mt-1.5 font-display font-bold uppercase whitespace-nowrap transition-all duration-300 pointer-events-none"
              style={{
                fontSize: labelFontSize,
                letterSpacing: '0.08em',
                color: isActive ? '#00FF66' : isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.82)',
                textShadow: isActive || isHovered
                  ? '0 0 10px rgba(0, 160, 60, 0.8), 0 2px 4px rgba(0,0,0,0.95)'
                  : '0 2px 4px rgba(0,0,0,0.95)',
              }}
            >
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Mobile tap helper instruction */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden"
        style={{
          bottom: -12,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <MousePointerClick size={13} className="text-[#00C853] animate-bounce" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/70">
          Tap gear icons to explore
        </span>
      </div>
    </div>
  );
}
