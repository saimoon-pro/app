import React from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';

export const ENABLE_CV_MAKER = false;

interface CreateCVButtonProps {
  variant?: 'header' | 'hero' | 'mobile';
  className?: string;
}

export const CreateCVButton: React.FC<CreateCVButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  if (!ENABLE_CV_MAKER) return null;

  const { user, profile, openAuthModal, setWorkspaceOpen } = useAuthStore();
  const isDay = useStore((s) => s.timeOfDay >= 7.5 && s.timeOfDay <= 17.5);
  const { playClick } = useSound();

  const handleClick = () => {
    playClick();
    if (user) {
      setWorkspaceOpen(true);
    } else {
      openAuthModal('signup');
    }
  };

  // Header Pill Variant (Matches the top-right header aesthetic)
  if (variant === 'header') {
    return (
      <button
        onClick={handleClick}
        aria-label="Create your professional CV"
        className={`group flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 h-9 sm:h-12 rounded-full cursor-pointer transition-all duration-300 select-none ${className}`}
        style={{
          background: isDay
            ? 'linear-gradient(135deg, rgba(230, 245, 255, 0.95) 0%, rgba(200, 230, 255, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(5, 30, 16, 0.95) 0%, rgba(10, 50, 28, 0.95) 100%)',
          border: isDay
            ? '1.5px solid rgba(0, 102, 255, 0.5)'
            : '1.5px solid rgba(0, 255, 102, 0.5)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: isDay
            ? '0 0 16px rgba(0, 102, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.15)'
            : '0 0 16px rgba(0, 255, 102, 0.3), 0 8px 24px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:rotate-12"
          style={{
            background: isDay ? 'rgba(0, 102, 255, 0.15)' : 'rgba(0, 255, 102, 0.18)',
            border: isDay ? '1px solid rgba(0, 102, 255, 0.4)' : '1px solid rgba(0, 255, 102, 0.4)',
          }}
        >
          <Sparkles
            size={13}
            className={isDay ? 'text-[#0066FF]' : 'text-[#00FF66]'}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="font-display font-bold tracking-wider text-xs sm:text-sm whitespace-nowrap"
            style={{
              color: isDay ? '#0047AB' : '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {user ? 'MY CV MAKER' : 'CREATE YOUR CV'}
          </span>

          {/* Badge */}
          <span
            className="px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black uppercase tracking-wider"
            style={{
              background: isDay ? 'rgba(0, 102, 255, 0.12)' : 'rgba(0, 255, 102, 0.2)',
              color: isDay ? '#0066FF' : '#00FF66',
              border: isDay ? '1px solid rgba(0, 102, 255, 0.3)' : '1px solid rgba(0, 255, 102, 0.3)',
            }}
          >
            {user ? `${profile?.creditBalance ?? 100} CR` : 'FREE 100 CR'}
          </span>
        </div>
      </button>
    );
  }

  // Hero / Mobile Quick Action CTA Variant
  return (
    <button
      onClick={handleClick}
      aria-label="Create your professional CV with AI"
      className={`inline-flex items-center justify-center gap-2 px-4.5 py-2.5 sm:px-5 sm:py-3 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider font-black cursor-pointer select-none transition-all duration-300 min-h-[44px] group shadow-lg ${
        isDay
          ? 'bg-gradient-to-r from-[#0066FF] to-[#00A3FF] hover:from-[#0052CC] hover:to-[#0088DD] text-white'
          : 'bg-gradient-to-r from-[#00C853] to-[#00FF66] hover:from-[#00B048] hover:to-[#00E55A] text-black'
      } ${className}`}
      style={{
        boxShadow: isDay
          ? '0 4px 18px rgba(0, 102, 255, 0.35)'
          : '0 4px 18px rgba(0, 255, 102, 0.35)',
      }}
    >
      <Wand2
        size={16}
        strokeWidth={2.4}
        className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
      />
      <span>{user ? 'OPEN CV MAKER' : 'CREATE YOUR CV'}</span>
    </button>
  );
};

export default CreateCVButton;
