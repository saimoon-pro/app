import { useState, useRef, useEffect } from 'react';
import { FileText, Eye, Download, X } from 'lucide-react';

const RESUME_PATH = '/Muhammad saimoon hassan.pdf';

export default function ResumeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsViewing(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

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
      {/* ─── Floating Button + Dropdown ─── */}
      <div
        ref={menuRef}
        className="fixed z-50 resume-fab-container"
        style={{
          bottom: 16,
          right: 16,
        }}
      >
        {/* Dropdown Menu (appears above the button) */}
        <div
          className="absolute bottom-full right-0 mb-3 overflow-hidden"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'bottom right',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(0, 200, 83, 0.15)',
              borderRadius: 14,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 12px rgba(0, 200, 83, 0.06)',
              padding: 6,
              minWidth: 200,
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
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#0A1A0F',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 200, 83, 0.08)';
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
                  background: 'rgba(0, 200, 83, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Eye size={15} style={{ color: '#00C853' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: '#0A1A0F' }}
                >
                  View Resume
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: '#5A7A6A', letterSpacing: '0.05em', marginTop: 1 }}
                >
                  Preview in browser
                </div>
              </div>
            </button>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: 'rgba(0, 200, 83, 0.1)',
                margin: '2px 10px',
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
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#0A1A0F',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 200, 83, 0.08)';
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
                  background: 'rgba(0, 200, 83, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Download size={15} style={{ color: '#00C853' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: '#0A1A0F' }}
                >
                  Download CV
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 9, color: '#5A7A6A', letterSpacing: '0.05em', marginTop: 1 }}
                >
                  Save PDF to device
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ─── Main Floating Button ─── */}
        <button
          id="resume-fab"
          onClick={() => setIsOpen((prev) => !prev)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="View or Download Resume"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isHovered || isOpen ? 10 : 0,
            padding: isHovered || isOpen ? '0 20px 0 16px' : '0 14px',
            height: 48,
            borderRadius: 24,
            border: '1px solid rgba(0, 200, 83, 0.2)',
            background: isOpen
              ? 'linear-gradient(135deg, #00C853, #00E676)'
              : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            boxShadow: isHovered || isOpen
              ? '0 8px 32px rgba(0, 200, 83, 0.2), 0 2px 8px rgba(0, 0, 0, 0.06)'
              : '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 6px rgba(0, 200, 83, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered && !isOpen ? 'translateY(-2px)' : 'translateY(0)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Animated pulse ring behind icon */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              flexShrink: 0,
            }}
          >
            {!isOpen && (
              <div
                className="resume-pulse-ring"
                style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0, 200, 83, 0.4)',
                  animation: 'resume-pulse 2.5s ease-in-out infinite',
                }}
              />
            )}
            <FileText
              size={18}
              style={{
                color: isOpen ? '#fff' : '#00C853',
                transition: 'color 0.3s ease',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Expanding label text */}
          <span
            className="font-display"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: isOpen ? '#fff' : '#0A1A0F',
              maxWidth: isHovered || isOpen ? 200 : 0,
              opacity: isHovered || isOpen ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            }}
          >
            {isOpen ? 'Close' : 'My Resume'}
          </span>
        </button>
      </div>

      {/* ─── Full-Screen PDF Viewer Overlay ─── */}
      {isViewing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'rgba(10, 26, 15, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
              width: 'min(92vw, 900px)',
              height: 'min(90vh, 1100px)',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
              animation: 'resume-viewer-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(248, 250, 251, 0.95)',
                borderBottom: '1px solid rgba(0, 200, 83, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={16} style={{ color: '#00C853' }} />
                <span
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 600, color: '#0A1A0F' }}
                >
                  Muhammad Saimoon Hassan — Resume
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Download from viewer */}
                <button
                  onClick={handleDownload}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(0, 200, 83, 0.2)',
                    background: 'rgba(0, 200, 83, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#00C853',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 200, 83, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 200, 83, 0.06)';
                  }}
                >
                  <Download size={13} />
                  <span className="font-display hidden sm:inline">Download</span>
                </button>

                {/* Close button */}
                <button
                  onClick={() => setIsViewing(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#5A7A6A',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* PDF Embed */}
            <iframe
              src={`${RESUME_PATH}#toolbar=0&navpanes=0`}
              title="Resume - Muhammad Saimoon Hassan"
              style={{
                width: '100%',
                height: 'calc(100% - 52px)',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
