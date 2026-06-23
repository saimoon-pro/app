import { useState } from 'react';
import { Check, Send, MessageCircle, Mail, Copy, CheckCheck } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

const PROJECT_TYPES = [
  'Video Editing',
  'Motion Graphics',
  'UI-UX Design',
  'Web Development',
  'AI Automation',
  'Other',
];

const TIMELINES = ['Urgent', '1-2 Weeks', '1 Month', 'Flexible'];

export default function ContactPanel() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { playConfirm } = useSound();

  const handleSubmit = () => {
    playConfirm();
    setSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello@saimoonhassan.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="rounded-full flex items-center justify-center mb-6"
          style={{
            width: 80,
            height: 80,
            background: 'rgba(0, 200, 83, 0.1)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#00C853" strokeWidth="2" opacity="0.2" />
            <path
              d="M12 20 L18 26 L28 14"
              fill="none"
              stroke="#00C853"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              strokeDashoffset="30"
              style={{ animation: 'checkmark-draw 0.6s ease-out forwards' }}
            />
          </svg>
        </div>
        <h4 className="font-display font-semibold text-xl mb-2" style={{ color: '#0A1A0F' }}>
          Message Sent!
        </h4>
        <p className="text-sm" style={{ color: '#5A7A6A' }}>
          I&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Trust Indicators */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0, 200, 83, 0.04)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00C853', boxShadow: '0 0 6px rgba(0, 200, 83, 0.4)' }} />
          <span className="text-xs font-mono" style={{ color: '#5A7A6A' }}>Typically replies within 24h</span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(0, 200, 83, 0.15)' }} />
        <span className="text-xs font-mono" style={{ color: '#5A7A6A' }}>Based in Karachi, Pakistan</span>
      </div>

      {/* Progressive Form */}
      <div>
        {/* Step 1: Project Type */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="flex items-center justify-center rounded-full text-xs font-semibold"
              style={{ width: 24, height: 24, background: step > 1 ? '#00C853' : 'rgba(0, 200, 83, 0.1)', color: step > 1 ? '#fff' : '#00C853' }}
            >
              {step > 1 ? <Check size={14} /> : '1'}
            </span>
            <span className="font-display font-medium text-sm" style={{ color: '#0A1A0F' }}>
              What brings you here?
            </span>
          </div>

          {step === 1 && (
            <div className="flex flex-wrap gap-2 ml-8">
              {PROJECT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => { setProjectType(type); setStep(2); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: projectType === type ? '#00C853' : 'rgba(0, 200, 83, 0.06)',
                    color: projectType === type ? '#fff' : '#5A7A6A',
                    border: `1.5px solid ${projectType === type ? '#00C853' : 'rgba(0, 200, 83, 0.12)'}`,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Description + Timeline */}
        {step >= 2 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="flex items-center justify-center rounded-full text-xs font-semibold"
                style={{ width: 24, height: 24, background: step > 2 ? '#00C853' : 'rgba(0, 200, 83, 0.1)', color: step > 2 ? '#fff' : '#00C853' }}
              >
                {step > 2 ? <Check size={14} /> : '2'}
              </span>
              <span className="font-display font-medium text-sm" style={{ color: '#0A1A0F' }}>
                Tell me about your project
              </span>
            </div>

            {step === 2 && (
              <div className="ml-8 flex flex-col gap-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe your project, goals, and any specific requirements..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200 focus:ring-2"
                  style={{
                    background: 'rgba(0, 200, 83, 0.04)',
                    color: '#0A1A0F',
                    border: '1px solid rgba(0, 200, 83, 0.12)',
                  }}
                />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: '#5A7A6A' }}>Timeline</span>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map(t => (
                      <button
                        key={t}
                        onClick={() => { setTimeline(t); setStep(3); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200"
                        style={{
                          background: timeline === t ? '#00C853' : 'rgba(0, 200, 83, 0.06)',
                          color: timeline === t ? '#fff' : '#5A7A6A',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step >= 3 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="flex items-center justify-center rounded-full text-xs font-semibold"
                style={{ width: 24, height: 24, background: 'rgba(0, 200, 83, 0.1)', color: '#00C853' }}
              >
                3
              </span>
              <span className="font-display font-medium text-sm" style={{ color: '#0A1A0F' }}>
                How should I reach you?
              </span>
            </div>

            <div className="ml-8 flex flex-col gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: 'rgba(0, 200, 83, 0.04)',
                  color: '#0A1A0F',
                  border: '1px solid rgba(0, 200, 83, 0.12)',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: 'rgba(0, 200, 83, 0.04)',
                  color: '#0A1A0F',
                  border: '1px solid rgba(0, 200, 83, 0.12)',
                }}
              />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (optional)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: 'rgba(0, 200, 83, 0.04)',
                  color: '#0A1A0F',
                  border: '1px solid rgba(0, 200, 83, 0.12)',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!name || !email}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-40 mt-2"
                style={{
                  background: '#00C853',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(0, 200, 83, 0.25)',
                }}
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Direct Contact Options */}
      <div className="pt-6" style={{ borderTop: '1px solid rgba(0, 200, 83, 0.08)' }}>
        <span className="text-xs font-mono uppercase tracking-wider mb-4 block" style={{ color: '#5A7A6A' }}>
          Or reach out directly
        </span>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://wa.me/92XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a
            href="mailto:hello@saimoonhassan.com"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
          >
            <Mail size={16} />
            Email
          </a>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
          >
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
