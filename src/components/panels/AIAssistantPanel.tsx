import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, User, Loader2, Play, ExternalLink,
  Zap, RotateCcw, ChevronRight, Video, Globe, Palette,
  Briefcase, Mail, Brain, MessageCircle, Compass,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { sendToOrbit } from '@/services/orbitAI';
import { assetUrl } from '@/lib/assetUrl';
import type { OrbitResponse, VideoSuggestion, OrbitActionDetails } from '@/services/orbitAI';

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: '💰 Price Quote on WhatsApp', text: 'What are your rates and can I get a price quote on WhatsApp?' },
  { label: '🎬 Podcast & Brand Films', text: 'Show me your documentary and brand film videos' },
  { label: '🌐 Web Applications', text: 'Show me your high performance web development projects' },
  { label: '🎨 UI/UX & Design', text: 'Show me your UI UX design and mobile app work' },
  { label: '📄 View Saimoon\'s Resume', text: 'Show me Muhammad Saimoon Hassan\'s resume and credentials' },
  { label: '⌨️ Website Guide & Shortcuts', text: 'How do I use this website and what are the keyboard shortcuts?' },
  { label: '🌌 Switch to Atmosphere 2', text: 'Switch background to regulator 2' },
];

// ─── Section Icon Map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ElementType> = {
  career: Briefcase,
  video: Video,
  design: Palette,
  web: Globe,
  contact: Mail,
};

// ─── Inline Portfolio Card ───────────────────────────────────────────────────

function PortfolioCard({
  item,
  onOpenPanel,
}: {
  item: any;
  onOpenPanel: (item: any) => void;
}) {
  const [hovered, setHovered] = useState(false);

  function getYouTubeId(url: string) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([^#&?]{11})/);
    return m ? m[1] : null;
  }

  const isVideo = item.contentType === 'Video Editing';
  const ytId = isVideo ? getYouTubeId(item.videoUrl) : null;
  const thumb = ytId
    ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
    : item.thumbnailUrl || item.imageUrls?.[0] || assetUrl('images/thumb-video-1.jpg');

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? 'rgba(0,200,83,0.4)' : 'rgba(0,200,83,0.15)'}`,
        background: hovered ? 'rgba(0,200,83,0.06)' : '#fff',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: hovered ? '0 6px 20px rgba(0,200,83,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{ position: 'relative', aspectRatio: '16/9', background: '#0A1A0F', overflow: 'hidden' }}
        onClick={() => onOpenPanel(item)}
      >
        <img
          src={thumb || undefined}
          alt={item.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            opacity: hovered ? 0.85 : 1,
            transition: 'all 0.3s ease',
            display: 'block',
          }}
          onError={(e) => { (e.target as HTMLImageElement).src = assetUrl('images/thumb-video-1.jpg'); }}
        />

        {/* Play overlay for videos */}
        {isVideo && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', opacity: hovered ? 1 : 0.85, transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,200,83,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,200,83,0.5)',
            }}>
              <Play size={15} fill="white" color="white" />
            </div>
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          background: 'rgba(5, 20, 10, 0.8)', color: '#00FF66', fontSize: 8,
          fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '2px 7px', borderRadius: 20, backdropFilter: 'blur(4px)',
          border: '1px solid rgba(0, 255, 102, 0.3)',
        }}>
          {item.category || item.contentType}
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#0A1A0F',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {item.title}
          </div>
          {item.description && (
            <div style={{
              fontSize: 9, color: '#5A7A6A', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1,
            }}>
              {item.description}
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenPanel(item); }}
          title="Open in Section"
          style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: 8,
            border: '1px solid rgba(0,200,83,0.25)',
            background: 'rgba(0,200,83,0.08)', color: '#00C853',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(0,200,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={14} style={{ color: '#00C853' }} />
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4,
        background: '#fff', border: '1px solid rgba(0,200,83,0.15)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {[0, 150, 300].map(d => (
          <span key={d} className="animate-bounce" style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#00C853', display: 'inline-block', animationDelay: `${d}ms`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Extended Message Type ────────────────────────────────────────────────────

interface ExtendedMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  videoSuggestions?: VideoSuggestion[];
  portfolioSuggestions?: any[];
  ctaButton?: { label: string; url: string };
  suggestedSection?: string;
  action?: string;
  actionDetails?: OrbitActionDetails;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onNavigate,
  onOpenItem,
  onExecuteAction,
}: {
  msg: ExtendedMessage;
  onNavigate: (section: string) => void;
  onOpenItem: (item: any) => void;
  onExecuteAction: (action: OrbitActionDetails) => void;
}) {
  const isUser = msg.role === 'user';

  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
        background: isUser ? 'rgba(0,200,83,0.15)' : 'rgba(0,200,83,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(0,200,83,0.2)',
      }}>
        {isUser
          ? <User size={14} style={{ color: '#00873D' }} />
          : <Sparkles size={14} style={{ color: '#00C853' }} />}
      </div>

      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Text Bubble */}
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser ? '#00A84D' : '#fff',
          color: isUser ? '#fff' : '#0A1A0F',
          border: isUser ? 'none' : '1px solid rgba(0,200,83,0.15)',
          fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
          boxShadow: isUser ? '0 4px 12px rgba(0,168,77,0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
        }}>
          {msg.text}
        </div>

        {/* Portfolio Suggestions Grid */}
        {!isUser && msg.portfolioSuggestions && msg.portfolioSuggestions.length > 0 && (
          <div className="mt-1">
            <div style={{
              fontSize: 10, color: '#00873D', fontFamily: 'monospace',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
            }}>
              ▸ Exact matching portfolio items
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {msg.portfolioSuggestions.map(v => (
                <PortfolioCard key={v.id} item={v} onOpenPanel={onOpenItem} />
              ))}
            </div>
          </div>
        )}

        {/* Legacy Video Suggestions */}
        {!isUser && msg.videoSuggestions && msg.videoSuggestions.length > 0 && (
          <div className="mt-1">
            <div style={{
              fontSize: 10, color: '#00873D', fontFamily: 'monospace',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
            }}>
              ▸ Matching video works
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {msg.videoSuggestions.map(v => (
                <PortfolioCard key={v.id} item={v} onOpenPanel={onOpenItem} />
              ))}
            </div>
          </div>
        )}

        {/* Prominent WhatsApp / CTA Button (for Pricing & Direct Enquiries) */}
        {!isUser && msg.ctaButton && (
          <a
            href={msg.ctaButton.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 12,
              background: 'linear-gradient(135deg, #00C853 0%, #009E3E 100%)',
              color: '#fff', border: 'none', textDecoration: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', alignSelf: 'flex-start',
              boxShadow: '0 4px 16px rgba(0,200,83,0.35)',
            }}
          >
            <MessageCircle size={16} />
            <span>{msg.ctaButton.label}</span>
            <ExternalLink size={13} style={{ opacity: 0.85 }} />
          </a>
        )}

        {/* Automation Trigger Action Badge */}
        {!isUser && msg.actionDetails && (
          <button
            onClick={() => onExecuteAction(msg.actionDetails!)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(0,200,83,0.08)', color: '#00873D',
              border: '1.5px solid rgba(0,200,83,0.25)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', alignSelf: 'flex-start',
            }}
          >
            <Zap size={13} className="text-[#00C853]" />
            <span>{msg.actionDetails.label || 'Execute Automation'}</span>
            <ChevronRight size={13} />
          </button>
        )}

        {/* Section Navigation CTA */}
        {!isUser && msg.suggestedSection && msg.suggestedSection !== 'ai' && (
          <button
            onClick={() => onNavigate(msg.suggestedSection!)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: 'rgba(0,200,83,0.08)', color: '#00873D',
              border: '1px solid rgba(0,200,83,0.2)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', alignSelf: 'flex-start',
            }}
          >
            {(() => { const Icon = SECTION_ICONS[msg.suggestedSection] || ChevronRight; return <Icon size={13} />; })()}
            <span>Open {msg.suggestedSection.charAt(0).toUpperCase() + msg.suggestedSection.slice(1)} Universe</span>
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel Component ─────────────────────────────────────────────────────

export default function AIAssistantPanel() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('orbit_chat_history');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setActiveNode = useStore(s => s.setActiveNode);
  const setResumeModalOpen = useStore(s => s.setResumeModalOpen);
  const setCurrentRegulator = useStore(s => s.setCurrentRegulator);
  const toggleSound = useStore(s => s.toggleSound);
  const content = useStore(s => s.content);

  // Auto-scroll & Save history
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    sessionStorage.setItem('orbit_chat_history', JSON.stringify(messages));
  }, [messages, isTyping]);

  const handleNavigate = useCallback((section: string) => {
    const valid = ['career', 'video', 'design', 'web', 'ai', 'contact'];
    if (valid.includes(section)) setActiveNode(section as any);
  }, [setActiveNode]);

  const handleOpenItem = useCallback((item: any) => {
    if (item.contentType === 'Video Editing') {
      sessionStorage.setItem('orbit_play_video', item.id);
      setActiveNode('video');
    } else if (item.contentType === 'Website Project') {
      if (item.websiteUrl) window.open(item.websiteUrl, '_blank', 'noopener,noreferrer');
      else setActiveNode('web');
    } else {
      setActiveNode('design');
    }
  }, [setActiveNode]);

  // Execute Agent Automations
  const handleExecuteAction = useCallback((act: OrbitActionDetails) => {
    if (act.action === 'resume') {
      setResumeModalOpen(true);
    } else if (act.action === 'regulator') {
      const regNum = Number(act.param) || 1;
      setCurrentRegulator(regNum);
    } else if (act.action === 'sound') {
      toggleSound();
    } else if (act.action === 'home') {
      setActiveNode(null);
    } else if (act.action === 'navigate' && act.param) {
      handleNavigate(act.param);
    }
  }, [setResumeModalOpen, setCurrentRegulator, toggleSound, setActiveNode, handleNavigate]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ExtendedMessage = { role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const resp: OrbitResponse = await sendToOrbit(trimmed, history, content);

      // Auto-execute action if specified by agent
      if (resp.actionDetails) {
        handleExecuteAction(resp.actionDetails);
      }

      const aiMsg: ExtendedMessage = {
        role: 'assistant',
        text: resp.text,
        timestamp: Date.now(),
        videoSuggestions: resp.videoSuggestions,
        portfolioSuggestions: resp.portfolioSuggestions,
        ctaButton: resp.ctaButton,
        suggestedSection: resp.suggestedSection,
        action: resp.action,
        actionDetails: resp.actionDetails,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I had a momentary connection hiccup. I am right here — ask me again or connect on WhatsApp!",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    sessionStorage.removeItem('orbit_chat_history');
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>

      {/* ── Empty state ── */}
      {isEmpty && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px 12px' }}>

          {/* Animated avatar */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,200,83,0.15) 0%, rgba(0,200,83,0.05) 100%)',
              border: '1.5px solid rgba(0,200,83,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0,200,83,0.2)',
            }}>
              <Sparkles size={28} style={{ color: '#00C853' }} />
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: '50%',
              background: '#00C853', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #F8FAFB',
            }}>
              <Brain size={12} color="#fff" />
            </div>
          </div>

          <h4 style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: 16, color: '#0A1A0F', margin: '0 0 4px' }}>
            ORBIT Autonomous Agent v14.0
          </h4>
          <p style={{ fontSize: 10, color: '#00873D', fontFamily: 'monospace', letterSpacing: '0.06em', margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 700 }}>
            Website Operator · Portfolio Search · Instant WhatsApp Pricing
          </p>
          <p style={{ fontSize: 12, color: '#477057', maxWidth: 300, lineHeight: 1.6, margin: 0 }}>
            I can find specific videos, designs, or web projects, answer questions in English, Bangla & Hindi, control website features, and provide custom pricing consultations.
          </p>

          {/* Capability Badges */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: Video, label: 'Video Work' },
              { icon: Palette, label: 'UI/UX' },
              { icon: Globe, label: 'Web Apps' },
              { icon: MessageCircle, label: 'Pricing Quote' },
              { icon: Compass, label: 'Site Guide' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: 'rgba(0,200,83,0.06)', color: '#00873D',
                border: '1px solid rgba(0,200,83,0.18)',
              }}>
                <Icon size={11} style={{ color: '#00C853' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick prompts ── */}
      {isEmpty && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, justifyContent: 'center', padding: '0 4px' }}>
          {QUICK_PROMPTS.map(p => (
            <button
              key={p.text}
              onClick={() => handleSend(p.text)}
              style={{
                padding: '7px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(0,200,83,0.06)', color: '#1B472E',
                border: '1px solid rgba(0,200,83,0.2)', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#00C853';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#00C853';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,83,0.06)';
                (e.currentTarget as HTMLButtonElement).style.color = '#1B472E';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.2)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages List ── */}
      {!isEmpty && (
        <div
          ref={messagesContainerRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}
        >
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onNavigate={handleNavigate}
              onOpenItem={handleOpenItem}
              onExecuteAction={handleExecuteAction}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {isEmpty && <div ref={messagesEndRef} />}

      {/* ── Input Area ── */}
      <div style={{ flexShrink: 0, paddingTop: 12, borderTop: '1px solid rgba(0,200,83,0.12)' }}>

        {/* Top row: clear button */}
        {!isEmpty && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: '#5A7A6A', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e57373'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5A7A6A'; }}
            >
              <RotateCcw size={11} /> New conversation
            </button>
          </div>
        )}

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
            placeholder="Ask ORBIT to find work, pricing, or automate..."
            disabled={isTyping}
            style={{
              flex: 1, padding: '11px 14px', borderRadius: 12, fontSize: 13,
              outline: 'none', background: 'rgba(0,200,83,0.04)', color: '#0A1A0F',
              border: '1.5px solid rgba(0,200,83,0.2)', transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#00C853'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,200,83,0.2)'; }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !isTyping ? '#00C853' : 'rgba(0,200,83,0.1)',
              color: input.trim() && !isTyping ? '#fff' : '#5A7A6A',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isTyping ? 'pointer' : 'default',
              transition: 'all 0.2s', opacity: (!input.trim() || isTyping) ? 0.5 : 1,
              boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(0,200,83,0.3)' : 'none',
            }}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C853', display: 'inline-block', boxShadow: '0 0 6px rgba(0,200,83,0.7)' }} />
          <span style={{ fontSize: 9, color: '#3D664E', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            ORBIT Autonomous Agent · Live Portfolio Search · Multilingual
          </span>
          <Zap size={9} style={{ color: '#00C853' }} />
        </div>
      </div>
    </div>
  );
}
