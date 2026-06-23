import { useCallback, useEffect, useRef, useState } from 'react';
import { Briefcase, Film, Palette, Globe, Sparkles, Mail, MousePointerClick } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import gsap from 'gsap';
import type { OrbitNodeId } from '@/types/content';

// Responsive orbit sizing
function useOrbitalSize() {
  const [size, setSize] = useState({ radius: 200, nodeSize: 56 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const min = Math.min(w, h);

      if (min < 480) {
        setSize({ radius: 110, nodeSize: 42 });
      } else if (min < 640) {
        setSize({ radius: 130, nodeSize: 46 });
      } else if (min < 768) {
        setSize({ radius: 155, nodeSize: 50 });
      } else if (min < 1024) {
        setSize({ radius: 175, nodeSize: 52 });
      } else {
        setSize({ radius: 200, nodeSize: 56 });
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
  const ringRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(-90); // Start with first node at top
  const [hoveredNode, setHoveredNode] = useState<OrbitNodeId | null>(null);
  const [showHint, setShowHint] = useState(true);
  const activeNode = useStore((s) => s.activeNode);
  const setActiveNode = useStore((s) => s.setActiveNode);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const { playHoverTick, playClick, playPanelOpen } = useSound();
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, rotation: 0 });
  const autoRotateRef = useRef<gsap.core.Tween | null>(null);
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

  // Get position for a node at given angle
  const getNodePosition = useCallback((angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * ORBIT_RADIUS,
      y: Math.sin(angleRad) * ORBIT_RADIUS,
    };
  }, [ORBIT_RADIUS]);

  // Auto-rotation
  useEffect(() => {
    if (reducedMotion || activeNode) return;

    autoRotateRef.current = gsap.to({}, {
      duration: 60,
      repeat: -1,
      ease: 'none',
      onUpdate: function() {
        if (!isDragging.current && !activeNode) {
          setRotation(prev => prev + 0.1);
        }
      },
    });

    return () => {
      autoRotateRef.current?.kill();
    };
  }, [reducedMotion, activeNode]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX, rotation };
    autoRotateRef.current?.pause();
  }, [rotation]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const delta = (clientX - dragStart.current.x) * 0.3;
    setRotation(dragStart.current.rotation + delta);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Snap to nearest 60-degree increment
    const snapped = Math.round(rotation / 60) * 60;
    gsap.to({ val: rotation }, {
      val: snapped,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: function() {
        setRotation(this.targets()[0].val);
      },
    });
  }, [rotation]);

  // Mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  // Touch drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  // Global mouse/touch move
  useEffect(() => {
    const onMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Wheel to rotate
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (activeNode) return;
    setRotation(prev => prev + (e.deltaY > 0 ? 30 : -30));
  }, [activeNode]);

  // Node click
  const handleNodeClick = useCallback((nodeId: OrbitNodeId) => {
    if (isDragging.current) return;
    playClick();
    setTimeout(() => playPanelOpen(), 200);
    setActiveNode(nodeId);
  }, [playClick, playPanelOpen, setActiveNode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeNode) {
        if (e.key === 'Escape') setActiveNode(null);
        return;
      }

      const currentIndex = nodes.findIndex(n => {
        const nodeAngle = (rotation + 90 + (360 / NODE_COUNT) * nodes.indexOf(n)) % 360;
        return Math.abs(nodeAngle) < 30 || Math.abs(nodeAngle - 360) < 30;
      });

      if (e.key === 'ArrowRight') {
        setRotation(prev => prev + (360 / NODE_COUNT));
      } else if (e.key === 'ArrowLeft') {
        setRotation(prev => prev - (360 / NODE_COUNT));
      } else if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key) - 1;
        handleNodeClick(nodes[idx].id);
      } else if (e.key === 'Enter' && currentIndex >= 0) {
        handleNodeClick(nodes[currentIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNode, rotation, handleNodeClick, setActiveNode]);

  const iconSize = NODE_SIZE < 46 ? 16 : NODE_SIZE < 52 ? 18 : 22;
  const labelFontSize = NODE_SIZE < 46 ? 8 : NODE_SIZE < 52 ? 9 : 11;

  return (
    <div
      className="relative select-none"
      style={{ width: ORBIT_RADIUS * 2 + 80, height: ORBIT_RADIUS * 2 + 80 }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="radiogroup"
      aria-label="Site navigation universe"
    >
      {/* Orbit Ring Visual */}
      <div
        ref={ringRef}
        className="absolute rounded-full"
        style={{
          width: ORBIT_RADIUS * 2,
          height: ORBIT_RADIUS * 2,
          top: 40,
          left: 40,
          border: '1px solid rgba(0, 200, 83, 0.12)',
          transform: `rotate(${rotation}deg)`,
          transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'grab',
        }}
      >
        {/* Small dots along the ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3,
                height: 3,
                background: 'rgba(0, 200, 83, 0.2)',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${Math.cos(angle) * ORBIT_RADIUS}px, ${Math.sin(angle) * ORBIT_RADIUS}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Orbit Nodes */}
      {nodes.map((node, index) => {
        const nodeAngle = (rotation + (360 / NODE_COUNT) * index);
        const pos = getNodePosition(nodeAngle - 90);
        const isActive = activeNode === node.id;
        const isHovered = hoveredNode === node.id;
        const { Icon } = node;

        return (
          <button
            key={node.id}
            role="radio"
            aria-checked={isActive}
            aria-label={`Open ${node.label}`}
            className="absolute flex items-center justify-center rounded-full transition-all duration-300 z-10 orbit-node-btn"
            style={{
              width: NODE_SIZE,
              height: NODE_SIZE,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${isActive ? 1.2 : isHovered ? 1.15 : 1})`,
              background: isActive ? '#00C853' : 'rgba(255, 255, 255, 0.95)',
              border: `1.5px solid ${isActive ? '#00C853' : isHovered ? 'rgba(0, 200, 83, 0.4)' : 'rgba(0, 200, 83, 0.2)'}`,
              boxShadow: isActive
                ? '0 0 32px rgba(0, 200, 83, 0.35), 0 2px 12px rgba(0, 0, 0, 0.1)'
                : isHovered
                ? '0 0 24px rgba(0, 200, 83, 0.2), 0 2px 12px rgba(0, 0, 0, 0.06)'
                : '0 2px 12px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              color: isActive ? '#fff' : '#0A1A0F',
            }}
            onClick={() => handleNodeClick(node.id)}
            onMouseEnter={() => {
              setHoveredNode(node.id);
              playHoverTick();
            }}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <Icon size={iconSize} strokeWidth={1.8} />

            {/* Pulsing ring hint */}
            {showHint && !isActive && (
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: '2px solid rgba(0, 200, 83, 0.4)',
                  animation: 'orbit-hint-pulse 2s ease-in-out infinite',
                  animationDelay: `${index * 0.3}s`,
                }}
              />
            )}

            {/* Hover tooltip: "Click to explore" */}
            {isHovered && (
              <span
                className="absolute font-mono text-[9px] uppercase whitespace-nowrap pointer-events-none"
                style={{
                  top: -22,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#00C853',
                  letterSpacing: '0.06em',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  animation: 'fade-in-up 0.2s ease-out',
                }}
              >
                Click to explore
              </span>
            )}

            {/* Node Label */}
            <span
              className="absolute font-mono uppercase whitespace-nowrap transition-opacity duration-300"
              style={{
                fontSize: labelFontSize,
                top: NODE_SIZE + 8,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: isActive || isHovered ? 1 : 0.6,
                color: isActive ? '#00C853' : '#5A7A6A',
                letterSpacing: '0.08em',
              }}
            >
              {node.label}
            </span>
          </button>
        );
      })}

      {/* Mobile tap instruction */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden"
        style={{
          bottom: -8,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      >
        <MousePointerClick size={14} style={{ color: '#00C853' }} />
        <span
          className="font-mono uppercase whitespace-nowrap"
          style={{
            fontSize: 9,
            color: '#5A7A6A',
            letterSpacing: '0.1em',
          }}
        >
          Tap icons to explore
        </span>
      </div>
    </div>
  );
}
