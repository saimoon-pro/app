import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, User, Loader2, Play, ExternalLink,
  Zap, RotateCcw, ChevronRight, Video, Globe, Palette,
  Briefcase, Mail, Brain, TrendingUp,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { sendToOrbit } from '@/services/orbitAI';
import { assetUrl } from '@/lib/assetUrl';
import type { OrbitResponse, VideoSuggestion } from '@/services/orbitAI';

// ─── Quick prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: '🎬 Video work', text: 'Show me your best video editing work' },
  { label: '💡 Services & pricing', text: 'What services do you offer and how much do they cost?' },
  { label: '🌐 Web projects', text: 'Tell me about your web development projects' },
  { label: '🎨 Design portfolio', text: 'I want to see your design and branding work' },
  { label: '🤖 AI automation', text: 'What AI automation solutions do you offer?' },
  { label: '📞 Start a project', text: "I have a project in mind, let's discuss it" },
];

// ─── Section icon map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ElementType> = {
  career: Briefcase,
  video: Video,
  design: Palette,
  web: Globe,
  contact: Mail,
};

// ─── Inline Portfolio Card ────────────────────────────────────────────────────────

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
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(0,200,83,0.3)' : 'rgba(0,200,83,0.12)'}`,
        background: hovered ? 'rgba(0,200,83,0.04)' : '#fff',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        boxShadow: hovered ? '0 4px 16px rgba(0,200,83,0.1)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{ position: 'relative', aspectRatio: '16/9', background: '#0A1A0F', overflow: 'hidden' }}
        onClick={() => onOpenPanel(item)}
      >
        <img
          src={thumb}
          alt={item.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            opacity: hovered ? 0.8 : 1,
            transition: 'all 0.3s ease',
            display: 'block',
          }}
          onError={(e) => { (e.target as HTMLImageElement).src = assetUrl('images/thumb-video-1.jpg'); }}
        />

        {/* Play overlay for videos */}
        {isVideo && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,200,83,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,200,83,0.5)',
            }}>
              <Play size={14} fill="white" color="white" />
            </div>
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 5, left: 5,
          background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 8,
          fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '2px 6px', borderRadius: 20, backdropFilter: 'blur(4px)',
        }}>
          {item.category || item.contentType}
        </div>
      </div>

      {/* Info row */}
      <div style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: '#0A1A0F',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {item.title}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenPanel(item); }}
          title="Open Details"
          style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: 6,
            border: '1px solid rgba(0,200,83,0.2)',
            background: 'rgba(0,200,83,0.08)', color: '#00C853',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <ExternalLink size={11} />
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
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={13} style={{ color: '#00C853' }} />
      </div>
      <div style={{
        padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4,
        background: '#fff', border: '1px solid rgba(0,200,83,0.12)',
        display: 'flex', alignItems: 'center', gap: 5,
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

// ─── Extended message type ────────────────────────────────────────────────────

interface ExtendedMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  videoSuggestions?: VideoSuggestion[];
  portfolioSuggestions?: any[];
  ctaButton?: { label: string; url: string };
  suggestedSection?: string;
  action?: string;
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onNavigate,
  onOpenItem,
}: {
  msg: ExtendedMessage;
  onNavigate: (section: string) => void;
  onOpenItem: (item: any) => void;
}) {
  const isUser = msg.role === 'user';

  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        background: isUser ? 'rgba(0,200,83,0.12)' : 'rgba(0,200,83,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser
          ? <User size={13} style={{ color: '#00C853' }} />
          : <Sparkles size={13} style={{ color: '#00C853' }} />}
      </div>

      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Text bubble */}
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser ? '#00C853' : '#fff',
          color: isUser ? '#fff' : '#0A1A0F',
          border: isUser ? 'none' : '1px solid rgba(0,200,83,0.12)',
          fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
        }}>
          {msg.text}
        </div>

        {/* Legacy Video grid */}
        {!isUser && msg.videoSuggestions && msg.videoSuggestions.length > 0 && (
          <div>
            <div style={{
              fontSize: 9, color: '#5A7A6A', fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>
              ▸ Related work from portfolio
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {msg.videoSuggestions.map(v => (
                <PortfolioCard key={v.id} item={v} onOpenPanel={onOpenItem} />
              ))}
            </div>
          </div>
        )}

        {/* Portfolio grid (New SHOW_PORTFOLIO implementation) */}
        {!isUser && msg.portfolioSuggestions && msg.portfolioSuggestions.length > 0 && (
          <div>
            <div style={{
              fontSize: 9, color: '#5A7A6A', fontFamily: 'monospace',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>
              ▸ Related work from portfolio
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {msg.portfolioSuggestions.map(v => (
                <PortfolioCard key={v.id} item={v} onOpenPanel={onOpenItem} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        {!isUser && msg.ctaButton && (
          <a
            href={msg.ctaButton.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10,
              background: '#00C853', color: '#fff',
              border: 'none', textDecoration: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', alignSelf: 'flex-start',
              boxShadow: '0 4px 12px rgba(0,200,83,0.3)',
            }}
          >
            {msg.ctaButton.url.includes('wa.me') ? <Mail size={12} /> : <ExternalLink size={12} />}
            {msg.ctaButton.label}
          </a>
        )}

        {/* Navigation CTA */}
        {!isUser && msg.suggestedSection && msg.suggestedSection !== 'ai' && (
          <button
            onClick={() => onNavigate(msg.suggestedSection!)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 10,
              background: 'rgba(0,200,83,0.07)', color: '#00C853',
              border: '1px solid rgba(0,200,83,0.15)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s', alignSelf: 'flex-start',
            }}
          >
            {(() => { const Icon = SECTION_ICONS[msg.suggestedSection] || ChevronRight; return <Icon size={11} />; })()}
            Open {msg.suggestedSection.charAt(0).toUpperCase() + msg.suggestedSection.slice(1)} Section
            <ChevronRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

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
      if (item.websiteUrl) window.open(item.websiteUrl, '_blank');
      else setActiveNode('web');
    } else {
      setActiveNode('design');
    }
  }, [setActiveNode]);

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

      const aiMsg: ExtendedMessage = {
        role: 'assistant',
        text: resp.text,
        timestamp: Date.now(),
        videoSuggestions: resp.videoSuggestions,
        portfolioSuggestions: resp.portfolioSuggestions,
        ctaButton: resp.ctaButton,
        suggestedSection: resp.suggestedSection,
        action: resp.action,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I had a momentary hiccup. Try again — I'm right here.",
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 16px 16px' }}>

          {/* Animated avatar */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,200,83,0.1) 0%, rgba(0,200,83,0.05) 100%)',
              border: '1.5px solid rgba(0,200,83,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={30} style={{ color: '#00C853' }} />
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: '50%',
              background: '#00C853', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #F8FAFB',
            }}>
              <Brain size={11} color="#fff" />
            </div>
          </div>

          <h4 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: 15, color: '#0A1A0F', margin: '0 0 4px' }}>
            ORBIT Agent v3.0
          </h4>
          <p style={{ fontSize: 10, color: '#5A7A6A', fontFamily: 'monospace', letterSpacing: '0.05em', margin: '0 0 10px', textTransform: 'uppercase' }}>
            Professional Digital Clone · Multi-Model AI
          </p>
          <p style={{ fontSize: 12, color: '#5A7A6A', maxWidth: 260, lineHeight: 1.65, margin: 0 }}>
            Your strategic creative partner. I can help with projects, pricing, portfolio questions, and connecting you with Saimoon.
          </p>

          {/* Capability badges */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: Video, label: 'Video' },
              { icon: Palette, label: 'Design' },
              { icon: Globe, label: 'Web' },
              { icon: Brain, label: 'AI' },
              { icon: TrendingUp, label: 'Strategy' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 20, fontSize: 10,
                background: 'rgba(0,200,83,0.06)', color: '#5A7A6A',
                border: '1px solid rgba(0,200,83,0.1)',
              }}>
                <Icon size={10} style={{ color: '#00C853' }} />
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
                padding: '7px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                background: 'rgba(0,200,83,0.05)', color: '#5A7A6A',
                border: '1px solid rgba(0,200,83,0.12)', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,83,0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = '#00C853';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.25)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,83,0.05)';
                (e.currentTarget as HTMLButtonElement).style.color = '#5A7A6A';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,200,83,0.12)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
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
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}

      {isEmpty && <div ref={messagesEndRef} />}

      {/* ── Input area ── */}
      <div style={{ flexShrink: 0, paddingTop: 12, borderTop: '1px solid rgba(0,200,83,0.08)' }}>

        {/* Top row: clear button */}
        {!isEmpty && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 10, color: 'rgba(90,122,106,0.45)', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e57373'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(90,122,106,0.45)'; }}
            >
              <RotateCcw size={10} /> New conversation
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
            placeholder="Ask ORBIT anything..."
            disabled={isTyping}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 13,
              outline: 'none', background: 'rgba(0,200,83,0.04)', color: '#0A1A0F',
              border: '1px solid rgba(0,200,83,0.12)', transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,200,83,0.35)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,200,83,0.12)'; }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: input.trim() && !isTyping ? '#00C853' : 'rgba(0,200,83,0.08)',
              color: input.trim() && !isTyping ? '#fff' : '#5A7A6A',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isTyping ? 'pointer' : 'default',
              transition: 'all 0.2s', opacity: (!input.trim() || isTyping) ? 0.5 : 1,
            }}
          >
            {isTyping ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C853', display: 'inline-block', boxShadow: '0 0 6px rgba(0,200,83,0.6)' }} />
          <span style={{ fontSize: 9, color: 'rgba(90,122,106,0.45)', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ORBIT v3 · Gemini · Groq · OpenAI
          </span>
          <Zap size={8} style={{ color: 'rgba(0,200,83,0.4)' }} />
        </div>
      </div>
    </div>
  );
}
