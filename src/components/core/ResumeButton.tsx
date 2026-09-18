import { useState, useRef, useEffect } from 'react';
import { FileText, Eye, Download, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';

const RESUME_PATH = `${import.meta.env.BASE_URL}Muhammad saimoon hassan.pdf`;

export default function ResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isViewing = useStore((s) => s.resumeModalOpen);
  const setIsViewing = useStore((s) => s.setResumeModalOpen);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isDay = timeOfDay >= 7.5 && timeOfDay <= 17.5;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu / modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsViewing(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [setIsViewing]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = RESUME_PATH;
    link.download = 'Muhammad_Saimoon_Hassan_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleView = () => {
    setIsViewing(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* ─── Top-Right Floating Resume Header CTA ─── */}
      <div
        ref={menuRef}
        className="fixed top-2.5 right-3 sm:top-3 sm:right-4 lg:top-3.5 lg:right-8 xl:right-12 z-40 resume-cta-container select-none"
      >
        {/* Dropdown Menu (appears below the button) */}
        <div
          className="absolute top-full right-0 mt-2 sm:mt-3 overflow-hidden"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'top right',
          }}
        >
          <div
            style={{
              background: isDay ? 'rgba(8, 20, 42, 0.96)' : 'rgba(6, 22, 14, 0.96)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              border: isDay ? '1.5px solid rgba(0, 102, 255, 0.45)' : '1.5px solid rgba(0, 200, 83, 0.45)',
              borderRadius: 16,
              boxShadow: isDay
                ? '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 102, 255, 0.25)'
                : '0 16px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 200, 83, 0.25)',
              padding: 6,
              minWidth: 210,
            }}
          >
            {/* View Option */}
            <button
              onClick={handleView}
              className="resume-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDay ? 'rgba(0, 102, 255, 0.16)' : 'rgba(0, 200, 83, 0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isDay ? 'rgba(0, 102, 255, 0.18)' : 'rgba(0, 200, 83, 0.18)',
                  border: isDay ? '1px solid rgba(0, 102, 255, 0.4)' : '1px solid rgba(0, 255, 102, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isDay ? '0 0 10px rgba(0, 102, 255, 0.2)' : '0 0 10px rgba(0, 200, 83, 0.2)',
                }}
              >
                <Eye size={15} style={{ color: isDay ? '#38BDF8' : '#00FF66' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  className="font-display"
                  style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, color: '#FFFFFF' }}
                >
                  View Resume
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: isDay ? '#93C5FD' : '#8BAAA0', letterSpacing: '0.04em', marginTop: 1 }}
                >
                  Browser preview
                </div>
              </div>
            </button>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: isDay ? 'rgba(0, 102, 255, 0.15)' : 'rgba(0, 200, 83, 0.15)',
                margin: '3px 8px',
              }}
            />

            {/* Download Option */}
            <button
              onClick={handleDownload}
              className="resume-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = isDay ? 'rgba(0, 102, 255, 0.16)' : 'rgba(0, 200, 83, 0.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isDay ? 'rgba(0, 102, 255, 0.18)' : 'rgba(0, 200, 83, 0.18)',
                  border: isDay ? '1px solid rgba(0, 102, 255, 0.4)' : '1px solid rgba(0, 255, 102, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isDay ? '0 0 10px rgba(0, 102, 255, 0.2)' : '0 0 10px rgba(0, 200, 83, 0.2)',
                }}
              >
                <Download size={15} style={{ color: isDay ? '#38BDF8' : '#00FF66' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  className="font-display"
                  style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, color: '#FFFFFF' }}
                >
                  Download CV
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: isDay ? '#93C5FD' : '#8BAAA0', letterSpacing: '0.04em', marginTop: 1 }}
                >
                  Save PDF file
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ─── Main High-Visibility Glowing Resume Pill ─── */}
        <button
          id="resume-header-cta"
          onClick={() => setIsOpen((prev) => !prev)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="View or Download Resume"
          className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 h-9 sm:h-12 rounded-full cursor-pointer transition-all duration-300"
          style={{
            border: isOpen || isHovered
              ? isDay ? '2px solid #00E5FF' : '2px solid #00FF66'
              : isDay ? '1.5px solid #0066FF' : '1.5px solid #00FF66',
            background: isOpen
              ? 'linear-gradient(135deg, #0d2752 0%, #153c7c 100%)'
              : 'linear-gradient(135deg, #081a38 0%, #0c234a 100%)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            boxShadow: isOpen || isHovered
              ? isDay
                ? '0 0 24px rgba(0, 102, 255, 0.6), 0 16px 45px rgba(2, 8, 22, 0.9), inset 0 1.5px 2px rgba(255, 255, 255, 0.4)'
                : '0 0 24px rgba(0, 255, 102, 0.6), 0 16px 45px rgba(2, 8, 22, 0.9), inset 0 1.5px 2px rgba(255, 255, 255, 0.4)'
              : isDay
                ? '0 0 15px rgba(0, 102, 255, 0.4), 0 10px 30px rgba(2, 8, 20, 0.8), inset 0 1px 1.5px rgba(255, 255, 255, 0.25)'
                : '0 0 15px rgba(0, 255, 102, 0.35), 0 10px 30px rgba(2, 8, 20, 0.8), inset 0 1px 1.5px rgba(255, 255, 255, 0.25)',
            transform: isHovered && !isOpen ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Animated pulsing icon beacon with vibrant icon */}
          <div
            className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0"
            style={{
              background: isDay ? 'rgba(0, 102, 255, 0.18)' : 'rgba(0, 255, 102, 0.15)',
              border: isDay ? '1px solid rgba(0, 102, 255, 0.5)' : '1px solid rgba(0, 255, 102, 0.45)',
              boxShadow: isDay ? '0 0 10px rgba(0, 102, 255, 0.3)' : '0 0 10px rgba(0, 255, 102, 0.25)',
            }}
          >
            {!isOpen && (
              <div
                className="resume-pulse-ring"
                style={{
                  position: 'absolute',
                  inset: -2.5,
                  borderRadius: '50%',
                  border: isDay ? '1.5px solid rgba(0, 102, 255, 0.5)' : '1.5px solid rgba(0, 255, 102, 0.5)',
                  animation: 'resume-pulse 2.2s ease-in-out infinite',
                }}
              />
            )}
            <FileText
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
              style={{
                color: isDay ? '#38BDF8' : '#00FF66',
                filter: isDay ? 'drop-shadow(0 0 4px #0066FF)' : 'drop-shadow(0 0 4px #00FF66)',
              }}
            />
          </div>

          {/* Prominent Label - Pure White */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="font-display tracking-wider text-xs sm:text-sm font-bold text-white"
              style={{
                letterSpacing: '0.06em',
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(255,255,255,0.3)',
              }}
            >
              RESUME / CV
            </span>

            {/* Glowing Live PDF badge */}
            <div
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full"
              style={{
                background: isDay ? 'rgba(0, 102, 255, 0.18)' : 'rgba(0, 255, 102, 0.15)',
                border: isDay ? '1px solid rgba(0, 102, 255, 0.5)' : '1px solid rgba(0, 255, 102, 0.45)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isDay ? '#0066FF' : '#00FF66',
                  boxShadow: isDay ? '0 0 6px #0066FF' : '0 0 6px #00FF66',
                }}
              />
              <span
                className="font-mono text-[9px] sm:text-[10px] font-bold"
                style={{
                  color: isDay ? '#38BDF8' : '#00FF66',
                  letterSpacing: '0.05em',
                }}
              >
                PDF
              </span>
            </div>
          </div>

          {/* Caret chevron */}
          <ChevronDown
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            style={{
              color: isDay ? '#38BDF8' : '#00FF66',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease, color 0.3s ease',
              marginLeft: -2,
            }}
          />
        </button>
      </div>

      {/* ─── Full-Screen PDF Viewer Modal ─── */}
      {isViewing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{
            background: 'rgba(5, 12, 7, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'resume-overlay-in 0.3s ease forwards',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsViewing(false);
          }}
        >
          {/* Viewer Container */}
          <div
            style={{
              position: 'relative',
              width: 'min(94vw, 980px)',
              height: 'min(92vh, 1150px)',
              borderRadius: 20,
              overflow: 'hidden',
              background: '#0d1810',
              border: '1.5px solid rgba(0, 200, 83, 0.4)',
              boxShadow: '0 28px 100px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 200, 83, 0.25)',
              animation: 'resume-viewer-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top Cyber Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'rgba(8, 24, 15, 0.98)',
                borderBottom: '1.5px solid rgba(0, 200, 83, 0.25)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(0, 200, 83, 0.15)',
                    border: '1px solid rgba(0, 255, 102, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={17} style={{ color: '#00FF66' }} />
                </div>
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}
                  >
                    Muhammad Saimoon Hassan — Official Resume
                  </div>
                  <div
                    className="font-mono hidden sm:block"
                    style={{ fontSize: 10, color: '#8BAAA0', letterSpacing: '0.05em' }}
                  >
                    Video Editor · UI/UX Designer · Web Developer · AI Specialist
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(0, 200, 83, 0.4)',
                    background: 'rgba(0, 200, 83, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    color: '#00FF66',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#00C853';
                    (e.currentTarget as HTMLButtonElement).style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 200, 83, 0.15)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#00FF66';
                  }}
                >
                  <Download size={14} />
                  <span className="font-display">Download PDF</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsViewing(false)}
                  aria-label="Close modal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#8BAAA0',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 60, 60, 0.2)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#FF5555';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#8BAAA0';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PDF Embed Frame */}
            <iframe
              src={`${RESUME_PATH}#toolbar=0&navpanes=0`}
              title="Resume - Muhammad Saimoon Hassan"
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                background: '#ffffff',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
