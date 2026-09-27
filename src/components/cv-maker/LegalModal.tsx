import React from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';

export const LegalModal: React.FC = () => {
  const legalModalPage = useAuthStore((s) => s.legalModalPage);
  const setLegalModalPage = useAuthStore((s) => s.setLegalModalPage);

  if (!legalModalPage) return null;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-black/90 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) setLegalModalPage(null);
      }}
    >
      <div className="relative w-full min-h-screen">
        {/* Floating Close Button */}
        <button
          onClick={() => setLegalModalPage(null)}
          className="fixed top-4 right-4 z-[210] p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-lg"
          aria-label="Close legal document"
        >
          <X size={20} />
        </button>

        {legalModalPage === 'terms' ? (
          <TermsOfService onBack={() => setLegalModalPage(null)} />
        ) : (
          <PrivacyPolicy onBack={() => setLegalModalPage(null)} />
        )}
      </div>
    </div>
  );
};

export default LegalModal;
