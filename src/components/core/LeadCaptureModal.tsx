import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles, CheckCircle2, User, Phone } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

const WHATSAPP_NUMBER = '8801778011899';
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { playClick, playPanelOpen } = useSound();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger initial relax popup ~5 minutes after visiting the website
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setIsOpen(true);
      playPanelOpen();
    }, FIVE_MINUTES_MS);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playPanelOpen]);

  // Handle closing popup -> sets 5-minute recurring timer
  const handleClose = useCallback(() => {
    playClick();
    setIsOpen(false);
    setSubmitted(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsOpen(true);
      playPanelOpen();
    }, FIVE_MINUTES_MS);
  }, [playClick, playPanelOpen]);

  // Handle direct WhatsApp click
  const handleWhatsAppChat = () => {
    playClick();
    const encodedText = encodeURIComponent(
      name
        ? `Hello Saimoon! My name is ${name}. I visited your portfolio and would love to discuss a project with you.`
        : "Hello Saimoon! I visited your digital services portfolio and would love to discuss a project with you."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank', 'noopener,noreferrer');
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedPhone = phone.trim().slice(0, 30);
    if (!sanitizedName || !sanitizedPhone) return;

    setIsSubmitting(true);
    playClick();

    // Store safely in localStorage
    try {
      const rawLeads = localStorage.getItem('saimoon_leads');
      const existingLeads = Array.isArray(JSON.parse(rawLeads || '[]')) ? JSON.parse(rawLeads || '[]') : [];
      existingLeads.push({
        name: sanitizedName,
        phone: sanitizedPhone,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('saimoon_leads', JSON.stringify(existingLeads.slice(-50)));
    } catch {
      // Safe fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // Automatically open WhatsApp after brief delay
      setTimeout(() => {
        handleWhatsAppChat();
      }, 1200);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-500 animate-fade-in select-none">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1711] via-[#09110b] to-[#040805] text-white shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,200,83,0.2)] border border-[#00C853]/30 overflow-hidden"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0,200,83,0.25), inset 0 1px 2px rgba(255,255,255,0.15)',
        }}
      >
        {/* Top Glowing Ambient Accents */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#00C853] to-transparent shadow-[0_0_12px_#00C853]" />

        {/* Close Button (✕) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
          aria-label="Close popup"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-[#00C853]/15 text-[#00C853]">
                <Sparkles size={18} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#00C853]">
                Direct Consultation
              </span>
            </div>

            <h3 className="font-display text-2xl font-bold text-white mb-2 tracking-tight">
              Let's Build Something <span className="text-[#00C853]">Extraordinary</span>
            </h3>

            <p className="text-sm text-[#8BAAA0] mb-6 leading-relaxed">
              Share your contact info for an instant project brief, or connect with me directly on WhatsApp.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 font-mono uppercase tracking-wider">
                  Your Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853] text-sm text-white placeholder-white/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 font-mono uppercase tracking-wider">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853] text-sm text-white placeholder-white/30 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00C853] to-[#009624] hover:from-[#00E676] hover:to-[#00C853] text-black font-bold font-display text-sm tracking-wide shadow-[0_0_20px_rgba(0,200,83,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Connecting...' : 'Request Direct Callback'}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#09110b] font-mono text-[10px] uppercase tracking-widest text-white/40">
                OR
              </span>
            </div>

            {/* WhatsApp Direct Chat Button */}
            <button
              type="button"
              onClick={handleWhatsAppChat}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 hover:border-[#25D366] font-bold font-display text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg group cursor-pointer"
            >
              <MessageCircle size={18} className="text-[#25D366] group-hover:text-black transition-colors" />
              <span>Continue in Chat with WhatsApp</span>
            </button>
          </>
        ) : (
          /* Success State */
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#00C853]/20 border border-[#00C853] flex items-center justify-center text-[#00C853] mb-4 shadow-[0_0_20px_#00C853]">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-display text-xl font-bold text-white mb-2">Thank You, {name}!</h4>
            <p className="text-sm text-[#8BAAA0] mb-6 max-w-xs">
              Opening WhatsApp to start our conversation directly...
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-wider text-white transition-colors"
            >
              Back to Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
