import { useEffect, useRef, lazy, Suspense } from 'react';
import { X, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import gsap from 'gsap';
import type { OrbitNodeId } from '@/types/content';

// Asynchronous Lazy-loaded Panels for Ultra-Fast Initial Site Load
const CareerPanel = lazy(() => import('@/components/panels/CareerPanel'));
const VideoPanel = lazy(() => import('@/components/panels/VideoPanel'));
const DesignPanel = lazy(() => import('@/components/panels/DesignPanel'));
const WebPanel = lazy(() => import('@/components/panels/WebPanel'));
const AIAssistantPanel = lazy(() => import('@/components/panels/AIAssistantPanel'));
const ContactPanel = lazy(() => import('@/components/panels/ContactPanel'));

function PanelLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-4 text-emerald-600/80">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#00C853]/20 border-t-[#00C853] animate-spin" />
        <Loader2 className="w-6 h-6 text-[#00C853] animate-pulse absolute" />
      </div>
      <span className="font-mono text-xs uppercase tracking-widest text-[#0A1A0F]/60">
        Loading Section Matrix...
      </span>
    </div>
  );
}

const panelTitles: Record<OrbitNodeId, string> = {
  career: 'My Career',
  video: 'Video Editing Universe',
  design: 'Graphical Works',
  web: 'Website Projects',
  ai: 'ORBIT — Website Agent',
  contact: 'Get in Touch',
};

export default function ContentPanel() {
  const activeNode = useStore((s) => s.activeNode);
  const setActiveNode = useStore((s) => s.setActiveNode);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { playClick } = useSound();

  const backOverride = useStore((s) => s.backOverride);
  const setBackOverride = useStore((s) => s.setBackOverride);

  useEffect(() => {
    if (!panelRef.current || !contentRef.current) return;

    if (activeNode) {
      // Show overlay on mobile
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
          pointerEvents: 'auto',
        });
      }

      // Open animation
      gsap.to(panelRef.current, {
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.fromTo(
        contentRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
      );
    } else {
      // Hide overlay
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          pointerEvents: 'none',
        });
      }

      // Close animation
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.in',
      });
      
      // Clear back override when closing
      setBackOverride(null);
    }
  }, [activeNode, setBackOverride]);

  const handleBack = () => {
    playClick();
    if (backOverride) {
      const handled = backOverride();
      if (handled) return;
    }
    setActiveNode(null);
  };

  const handleClose = () => {
    playClick();
    setBackOverride(null);
    setActiveNode(null);
  };

  if (!activeNode) return null;

  const renderPanel = () => {
    switch (activeNode) {
      case 'career': return <CareerPanel />;
      case 'video': return <VideoPanel />;
      case 'design': return <DesignPanel />;
      case 'web': return <WebPanel />;
      case 'ai': return <AIAssistantPanel />;
      case 'contact': return <ContactPanel />;
      default: return null;
    }
  };

  return (
    <>
      {/* Dark overlay for mobile */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 lg:hidden"
        style={{
          background: 'rgba(10, 26, 15, 0.5)',
          opacity: 0,
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col glass-panel content-panel-responsive"
        style={{
          transform: 'translateX(100%)',
          boxShadow: '-8px 0 48px rgba(0, 0, 0, 0.08)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={panelTitles[activeNode]}
      >
        {/* Panel Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            height: 56,
            padding: '0 16px',
            borderBottom: '1px solid rgba(0, 200, 83, 0.08)',
            background: 'rgba(248, 250, 251, 0.9)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center justify-center rounded-full transition-all duration-300 hover:-translate-x-0.5"
              style={{
                width: 34,
                height: 34,
                background: 'rgba(0, 200, 83, 0.08)',
                color: '#5A7A6A',
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <h2
              className="font-display font-semibold"
              style={{ color: '#0A1A0F', fontSize: 'clamp(14px, 3vw, 20px)' }}
            >
              {panelTitles[activeNode]}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
            style={{
              width: 34,
              height: 34,
              background: 'rgba(0, 200, 83, 0.08)',
              color: '#5A7A6A',
            }}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto panel-scroll"
          style={{ padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 32px)' }}
        >
          <Suspense fallback={<PanelLoadingFallback />}>
            {renderPanel()}
          </Suspense>
        </div>
      </div>
    </>
  );
}
