import React from 'react';
import { ArrowLeft, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full bg-[#050c07] text-[#e2e8f0] px-4 py-8 sm:px-8 sm:py-12 md:px-16 lg:px-24">
      {/* Container */}
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#00FF66]/30 text-[#00FF66] font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Portfolio</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="text-[#00FF66]" size={28} />
            <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-400">
            Last Updated: September 2026 · Official Terms for CV / Resume Maker Services
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#00FF66]" />
              1. Acceptance of Terms
            </h2>
            <p>
              By signing up for an account or using the CV / Resume Maker platform provided by Muhammad Saimoon Hassan, you confirm that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any portion of these terms, please do not use this platform.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#00FF66]" />
              2. Credit System & Purchases
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Free Signup Credits:</strong> Every new user is eligible for 100 free credits granted once following successful email verification. Creating multiple accounts to abuse free promotional credits is strictly prohibited.
              </li>
              <li>
                <strong className="text-white">Credit Rates:</strong> Purchases are made in Bangladeshi Taka (BDT) at a standard rate of 10 Credits per 1 BDT (minimum purchase of 50 BDT = 500 credits).
              </li>
              <li>
                <strong className="text-white">Deduction & Refunds:</strong> Generation of pre-built templates costs 50 credits, edits cost 50 credits, and custom layouts cost 100 credits. If an export or server-side failure occurs, deducted credits are automatically refunded to your ledger.
              </li>
              <li>
                <strong className="text-white">Non-Transferability:</strong> Credits have no independent cash value outside the platform and cannot be redeemed for fiat currency or transferred between accounts.
              </li>
            </ul>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#00FF66]" />
              3. User Content & Intellectual Property
            </h2>
            <p className="mb-3">
              You retain 100% full ownership and copyright of all personal details, work histories, past resumes, and profile photographs you provide.
            </p>
            <p>
              You grant us a limited, temporary license to process your content using AI models (e.g., Google Gemini) solely for formatting, detection, and rendering your CV/Resume into high-resolution documents.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#00FF66]" />
              4. Service Availability & Headless Rendering
            </h2>
            <p>
              We strive to deliver 99.9% uptime. However, PDF rendering relies on cloud serverless infrastructure. In the unlikely event of cloud maintenance or transient issues, our system is equipped with automatic retry and auto-refund guarantees.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#00FF66]" />
              5. Account Deletion & Right to be Forgotten
            </h2>
            <p>
              You may request immediate account deletion and full erasure of your files, chat histories, and profile records at any time via your account settings dashboard or by contacting support at <span className="text-[#00FF66]">muhammadsaimoonhassan@gmail.com</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-white/10 pt-6 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} Muhammad Saimoon Hassan · All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
