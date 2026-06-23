import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ChatMessage } from '@/types/content';

const QUICK_PROMPTS = [
  'Show me video work',
  "What's your design process?",
  'Tell me about your career',
  'How can we work together?',
];

export default function AIAssistantPanel() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessages = useStore((s) => s.chatMessages);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, this would call Gemini API)
    setTimeout(() => {
      const response = generateResponse(text.trim());
      const aiMsg: ChatMessage = { role: 'assistant', text: response, timestamp: Date.now() };
      addChatMessage(aiMsg);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateResponse = (input: string): string => {
    const lower = input.toLowerCase();

    if (lower.includes('video') || lower.includes('show me video')) {
      return 'Saimoon has edited 340+ commercial videos across fashion, tech, and lifestyle. His Video Editing Universe showcases brand films, documentaries, music videos, and motion graphics. Would you like me to open that section?';
    }
    if (lower.includes('design process') || lower.includes('process')) {
      return 'Saimoon follows a research-first approach: understanding the problem, sketching solutions, prototyping in Figma, and iterating with client feedback. Every design decision ties back to user outcomes and business goals.';
    }
    if (lower.includes('career') || lower.includes('experience')) {
      return 'Five disciplines converging into one creative practice. Saimoon started with video editing, expanded into motion graphics, then UI/UX design, web development, and most recently AI automation. Each skill reinforces the others.';
    }
    if (lower.includes('work together') || lower.includes('hire') || lower.includes('contact')) {
      return 'Saimoon is currently accepting new projects. The best way to start is through the Contact section — share your project type and timeline, and he will respond within 24 hours.';
    }
    if (lower.includes('web') || lower.includes('website') || lower.includes('development')) {
      return 'Saimoon has built 25+ production websites using React, Next.js, GSAP, and Three.js. His portfolio includes SaaS landing pages, e-commerce platforms, and immersive brand experiences with 90+ Lighthouse scores.';
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
      return 'Pricing depends on project scope and complexity. For a tailored quote, please reach out through the Contact section with your project details.';
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return 'Hello. I am ORBIT, Saimoon\'s AI assistant. I can tell you about his work in video editing, motion graphics, UI/UX design, web development, and AI automation. What would you like to explore?';
    }

    return 'I can help you explore Saimoon\'s portfolio — from his video editing work and design projects to his web development expertise. What area interests you most?';
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 400 }}>
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col gap-4 mb-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="rounded-full flex items-center justify-center mb-4"
              style={{
                width: 64,
                height: 64,
                background: 'rgba(0, 200, 83, 0.08)',
              }}
            >
              <Sparkles size={28} style={{ color: '#00C853' }} />
            </div>
            <h4 className="font-display font-semibold text-base mb-2" style={{ color: '#0A1A0F' }}>
              ORBIT AI Assistant
            </h4>
            <p className="text-sm max-w-xs" style={{ color: '#5A7A6A' }}>
              I can guide you through Saimoon&apos;s portfolio, answer questions about his work, and help you find what you need.
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                background: msg.role === 'user' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(0, 229, 255, 0.1)',
              }}
            >
              {msg.role === 'user'
                ? <User size={14} style={{ color: '#00C853' }} />
                : <Sparkles size={14} style={{ color: '#00E5FF' }} />
              }
            </div>

            {/* Message Bubble */}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? '#00C853' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#0A1A0F',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(0, 200, 83, 0.12)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'user' ? 16 : 4,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{ width: 32, height: 32, background: 'rgba(0, 229, 255, 0.1)' }}
            >
              <Sparkles size={14} style={{ color: '#00E5FF' }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1"
              style={{ background: '#fff', border: '1px solid rgba(0, 200, 83, 0.12)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {chatMessages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(0, 200, 83, 0.06)',
                color: '#5A7A6A',
                border: '1px solid rgba(0, 200, 83, 0.12)',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(0, 200, 83, 0.08)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask ORBIT anything..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
          style={{
            background: 'rgba(0, 200, 83, 0.04)',
            color: '#0A1A0F',
            border: '1px solid rgba(0, 200, 83, 0.1)',
          }}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isTyping}
          className="flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-40"
          style={{
            width: 40,
            height: 40,
            background: input.trim() ? '#00C853' : 'rgba(0, 200, 83, 0.1)',
            color: input.trim() ? '#fff' : '#5A7A6A',
          }}
        >
          {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
