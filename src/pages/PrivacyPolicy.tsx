import React from 'react';
import { ArrowLeft, Lock, Database, Trash2, EyeOff, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <Lock className="text-[#00FF66]" size={28} />
            <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-white">
              Privacy & Data Policy
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-400">
            Last Updated: September 2026 · Built with Strict Enterprise Security Principles
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <EyeOff size={18} className="text-[#00FF66]" />
              1. Password & Credential Security
            </h2>
            <p>
              Your account password is encrypted and managed exclusively through Firebase Authentication. We <strong className="text-white">NEVER</strong> store, log, transmit, or have access to your plain-text password in our databases, Google Sheets, Google Drive, or server logs.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Database size={18} className="text-[#00FF66]" />
              2. Information We Collect & How It Is Used
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Profile Data:</strong> Name, verified email address, and phone number (Bangladesh mobile format) used for identification and payment verification.
              </li>
              <li>
                <strong className="text-white">CV Content:</strong> Work experiences, education, skills, and summary details provided by you to format your resume templates.
              </li>
              <li>
                <strong className="text-white">Uploaded Documents & Photos:</strong> Past CVs (PDF/DOCX) and profile images (JPG/PNG) used solely to extract information and render your CV.
              </li>
            </ul>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Trash2 size={18} className="text-[#00FF66]" />
              3. Automatic Cleanup & Replace-on-Upload
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>
                <strong className="text-white">Staging Deletion:</strong> Uploaded past CVs and photos are staged temporarily in cloud storage for AI parsing and then immediately deleted from staging once processed into your secure folder.
              </li>
              <li>
                <strong className="text-white">Replace-on-Upload:</strong> When you upload a new profile photo or past CV, any previously stored file is permanently replaced to prevent unnecessary retention of old versions.
              </li>
              <li>
                <strong className="text-white">Chat Reference Images:</strong> Images pasted or uploaded in chat for styling references are compressed client-side and automatically purged when the session ends.
              </li>
            </ul>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#00FF66]" />
              4. Third-Party Processors & AI Processing
            </h2>
            <p>
              We utilize Google Cloud Platform, Google Gemini API, and Google Drive for cloud storage, AI parsing, and document generation. None of your private resume data is ever sold, leased, or shared with third-party advertisers.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Lock size={18} className="text-[#00FF66]" />
              5. Contact Us
            </h2>
            <p>
              For any data access, rectification, or complete deletion requests, reach out directly to Muhammad Saimoon Hassan at:
              <br />
              <span className="text-[#00FF66] font-mono">muhammadsaimoonhassan@gmail.com</span> · Phone: <span className="text-[#00FF66] font-mono">+8801778011899</span>
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

export default PrivacyPolicy;
