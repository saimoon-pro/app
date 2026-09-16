import { useState } from 'react';
import { MessageCircle, Mail, Copy, CheckCheck, Sparkles, ArrowRight, User, AtSign, FileText, DollarSign } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

const WHATSAPP_NUMBER = '8801778011899';

const SERVICES = [
  'Video Editing',
  'Motion Graphics',
  'UI/UX Design',
  'Web Development',
  'AI Automation',
  'Other',
];

const BUDGET_PRESETS = [
  '< $500',
  '$500 - $1,500',
  '$1,500 - $3,000',
  '$3,000+',
  'Flexible / Let\'s Discuss',
];

export default function ContactPanel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState('Video Editing');
  const [projectDetails, setProjectDetails] = useState('');
  const [budget, setBudget] = useState('$500 - $1,500');
  const [customBudget, setCustomBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState('');

  const { playClick, playConfirm } = useSound();

  const handleCopyEmail = () => {
    playClick();
    navigator.clipboard.writeText('muhammadsaimoonhassan@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveBudget = customBudget.trim() || budget;

  const handleContinueWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    playConfirm();

    const sanitizedName = name.trim() || 'Client';
    const sanitizedEmail = email.trim() || 'Not specified';
    const sanitizedService = selectedService || 'General Project';
    const sanitizedDetails = projectDetails.trim() || 'I would like to discuss a project with you.';
    const sanitizedBudget = effectiveBudget || 'Flexible';

    const messageText = [
      `Hello Saimoon! I'm reaching out from your portfolio website:`,
      ``,
      `👤 *Name:* ${sanitizedName}`,
      `📧 *Email:* ${sanitizedEmail}`,
      `🏷️ *Service:* ${sanitizedService}`,
      `💼 *Project Details:* ${sanitizedDetails}`,
      `💰 *Budget:* ${sanitizedBudget}`,
      ``,
      `Looking forward to collaborating with you!`,
    ].join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
    setLastWaUrl(waUrl);
    setSubmitted(true);

    // Auto-redirect directly to WhatsApp in new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ── Status Header ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border"
        style={{
          background: 'rgba(0, 200, 83, 0.05)',
          borderColor: 'rgba(0, 200, 83, 0.18)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C853]" />
          </span>
          <span className="text-xs font-mono font-medium text-[#0A2614]">
            Typically replies within 24h
          </span>
        </div>
        <div className="text-xs font-mono text-[#3D664E]">
          Dhaka, Bangladesh • Worldwide Remote
        </div>
      </div>

      {/* ── Submission Confirmation Banner ── */}
      {submitted && (
        <div
          className="p-5 rounded-2xl border flex flex-col gap-3 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.12) 0%, rgba(0, 168, 77, 0.06) 100%)',
            borderColor: '#00C853',
          }}
        >
          <div className="flex items-center gap-2.5 text-[#00873D] font-bold text-sm">
            <Sparkles size={18} className="text-[#00C853]" />
            <span>Redirecting to WhatsApp!</span>
          </div>
          <p className="text-xs leading-relaxed text-[#1F452E]">
            Your project brief has been formatted and sent to WhatsApp. If the chat window didn't open automatically, click the button below:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={lastWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-102"
              style={{ background: '#00C853' }}
            >
              <MessageCircle size={14} />
              Open WhatsApp Chat Now
            </a>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#1F452E] hover:bg-black/5"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}

      {/* ── Main Unified Form (All Visible at Once) ── */}
      <form onSubmit={handleContinueWhatsApp} className="flex flex-col gap-5">
        {/* Name and Email Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A2614] flex items-center gap-1.5">
              <User size={13} className="text-[#00A84D]" />
              Your Name <span className="text-[#00A84D]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 border text-[#0A1A0F] bg-white focus:ring-2 focus:ring-[#00C853]/40 focus:border-[#00C853]"
              style={{ borderColor: 'rgba(0, 160, 60, 0.25)' }}
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A2614] flex items-center gap-1.5">
              <AtSign size={13} className="text-[#00A84D]" />
              Email Address <span className="text-[#00A84D]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 border text-[#0A1A0F] bg-white focus:ring-2 focus:ring-[#00C853]/40 focus:border-[#00C853]"
              style={{ borderColor: 'rgba(0, 160, 60, 0.25)' }}
            />
          </div>
        </div>

        {/* Service Category Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A2614] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#00A84D]" />
            What are you looking to build?
          </label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((srv) => {
              const isSelected = selectedService === srv;
              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => {
                    playClick();
                    setSelectedService(srv);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#00C853] text-white border-[#00C853] shadow-sm'
                      : 'bg-white/80 text-[#2B4C38] border-[#00C853]/20 hover:border-[#00C853]/50 hover:bg-[#00C853]/10'
                  }`}
                >
                  {srv}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Details */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A2614] flex items-center gap-1.5">
            <FileText size={13} className="text-[#00A84D]" />
            Project Details & Goals <span className="text-[#00A84D]">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={projectDetails}
            onChange={(e) => setProjectDetails(e.target.value)}
            placeholder="Tell me about your project, key goals, timeline, or any reference links..."
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none resize-none transition-all duration-200 border text-[#0A1A0F] bg-white focus:ring-2 focus:ring-[#00C853]/40 focus:border-[#00C853] leading-relaxed"
            style={{ borderColor: 'rgba(0, 160, 60, 0.25)' }}
          />
        </div>

        {/* Budget Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A2614] flex items-center gap-1.5">
            <DollarSign size={13} className="text-[#00A84D]" />
            Estimated Budget
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((b) => {
              const isSelected = budget === b && !customBudget;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    playClick();
                    setBudget(b);
                    setCustomBudget('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#00A84D] text-white border-[#00A84D] shadow-sm'
                      : 'bg-white/80 text-[#2B4C38] border-[#00C853]/20 hover:border-[#00C853]/50 hover:bg-[#00C853]/10'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={customBudget}
            onChange={(e) => setCustomBudget(e.target.value)}
            placeholder="Or type custom budget (e.g. $2,000 USD / 50,000 BDT)..."
            className="w-full px-3.5 py-2 rounded-lg text-xs font-mono outline-none border text-[#0A1A0F] bg-white focus:border-[#00C853] mt-1"
            style={{ borderColor: 'rgba(0, 160, 60, 0.2)' }}
          />
        </div>

        {/* ── Big Continue to WhatsApp Action Button ── */}
        <button
          type="submit"
          disabled={!name.trim() || !email.trim() || !projectDetails.trim()}
          className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-display font-bold text-base text-white transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mt-2"
          style={{
            background: 'linear-gradient(135deg, #00C853 0%, #009E3E 100%)',
            boxShadow: '0 8px 24px rgba(0, 200, 83, 0.35)',
          }}
        >
          <MessageCircle size={22} className="transition-transform group-hover:scale-110" />
          <span>Continue to WhatsApp</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
        <p className="text-[11px] font-mono text-center text-[#477057] -mt-2">
          Embeds your project brief directly into a WhatsApp chat with Saimoon
        </p>
      </form>

      {/* ── Direct Reach Out Options ── */}
      <div className="pt-6 border-t" style={{ borderColor: 'rgba(0, 160, 60, 0.15)' }}>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D664E] font-bold mb-3 block">
          Or reach out directly
        </span>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border bg-white hover:bg-[#00C853]/10 hover:border-[#00C853] text-[#00873D]"
            style={{ borderColor: 'rgba(0, 200, 83, 0.25)' }}
          >
            <MessageCircle size={15} />
            Direct WhatsApp
          </a>

          <a
            href="mailto:muhammadsaimoonhassan@gmail.com"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border bg-white hover:bg-[#00C853]/10 hover:border-[#00C853] text-[#00873D]"
            style={{ borderColor: 'rgba(0, 200, 83, 0.25)' }}
          >
            <Mail size={15} />
            Email Saimoon
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border bg-white hover:bg-[#00C853]/10 hover:border-[#00C853] text-[#00873D] cursor-pointer"
            style={{ borderColor: 'rgba(0, 200, 83, 0.25)' }}
          >
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
