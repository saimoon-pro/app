import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  Terminal,
  Film,
  Star,
  User,
} from 'lucide-react';
import type { CVData } from './templatesData';

interface A4CVPreviewProps {
  cvData: CVData;
  scale?: number;
}

export const A4CVPreview: React.FC<A4CVPreviewProps> = ({ cvData, scale = 1 }) => {
  const accent = cvData.accentColor || '#00FF66';
  const secondary = cvData.secondaryColor || '#00E5FF';
  const template = cvData.templateId || 'developer';

  // Determine if photo should be shown
  const hasPhoto = Boolean(cvData.showPhoto && cvData.profileImage);

  // Get initials for executive monogram when photo is not used
  const getInitials = (name: string) => {
    if (!name) return 'CV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(cvData.fullName);

  return (
    <div className="flex justify-center items-start w-full overflow-hidden p-2 sm:p-4">
      {/* Outer Scaled Container */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Actual A4 Document: 210mm x 297mm (794px x 1123px at 96 DPI) */}
        <div
          id="cv-a4-document"
          className="relative bg-white text-slate-900 shadow-2xl overflow-hidden font-sans select-text print:shadow-none print:m-0"
          style={{
            width: '794px',
            minHeight: '1123px',
            maxHeight: '1123px',
            boxSizing: 'border-box',
          }}
        >
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 1. DEVELOPER TEMPLATE (INSPIRED BY Developer.jpg)                  */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'developer' && (
            <div className="h-full flex flex-col justify-between bg-white text-slate-900">
              {/* Top Hero Banner */}
              {hasPhoto ? (
                /* With Photo Layout */
                <>
                  <div
                    className="relative px-8 pt-7 pb-11 text-white overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, #101c14 0%, #07120a 100%)`,
                      borderBottom: `3px solid ${accent}`,
                    }}
                  >
                    <div className="relative z-10">
                      <h1 className="text-3xl font-black uppercase tracking-wider text-white font-sans">
                        {cvData.fullName}
                      </h1>
                      <div
                        className="font-mono text-xs font-bold tracking-widest uppercase mt-1 flex items-center gap-2"
                        style={{ color: accent }}
                      >
                        <Terminal size={13} />
                        <span>{cvData.jobTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Info Strip: Photo Card + Dark Contact Box */}
                  <div className="px-8 -mt-9 relative z-20 flex items-center justify-between gap-5">
                    <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-xl shrink-0 border border-slate-200">
                      <img
                        src={cvData.profileImage!}
                        alt={cvData.fullName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 bg-[#131714] text-slate-200 rounded-xl px-5 py-3 shadow-lg flex items-center justify-around text-[10px] font-mono border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center" style={{ color: accent }}>
                          <Phone size={12} />
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px]">PHONE</div>
                          <div className="font-bold text-white">{cvData.phone}</div>
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-white/10" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center" style={{ color: accent }}>
                          <Mail size={12} />
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px]">EMAIL</div>
                          <div className="font-bold text-white truncate max-w-[150px]">{cvData.email}</div>
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-white/10" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center" style={{ color: accent }}>
                          <Globe size={12} />
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px]">PORTFOLIO</div>
                          <div className="font-bold text-white truncate max-w-[130px]">
                            {cvData.portfolioUrl ? cvData.portfolioUrl.replace('https://', '') : cvData.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* NO PHOTO MASTER LAYOUT: Full-Width Tech Executive Masthead */
                <div
                  className="px-8 pt-7 pb-6 text-white"
                  style={{
                    background: `linear-gradient(135deg, #0e1912 0%, #050e08 100%)`,
                    borderBottom: `3px solid ${accent}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-black uppercase tracking-wider text-white font-sans">
                        {cvData.fullName}
                      </h1>
                      <div
                        className="font-mono text-xs font-bold tracking-widest uppercase mt-1 flex items-center gap-2"
                        style={{ color: accent }}
                      >
                        <Terminal size={13} />
                        <span>{cvData.jobTitle}</span>
                        <span className="text-slate-500 font-normal">|</span>
                        <span className="text-slate-400 font-normal">{cvData.location}</span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                      <span>Available for Hire</span>
                    </div>
                  </div>

                  {/* Horizontal Contact Telemetry Cards */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-mono">
                      <Phone size={12} style={{ color: accent }} />
                      <span className="text-slate-200 font-semibold">{cvData.phone}</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-mono">
                      <Mail size={12} style={{ color: accent }} />
                      <span className="text-slate-200 font-semibold truncate">{cvData.email}</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-mono">
                      <Globe size={12} style={{ color: accent }} />
                      <span className="text-slate-200 font-semibold truncate">
                        {cvData.portfolioUrl ? cvData.portfolioUrl.replace('https://', '') : 'Portfolio Link'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Body: Two Columns */}
              <div className="grid grid-cols-12 gap-7 px-8 pt-5 pb-5 flex-1 text-xs">
                {/* Left Column (36%): Profile, Technical Skills with meters, Tools, Languages */}
                <div className="col-span-4 space-y-3.5">
                  {/* Summary / Profile Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-800 flex items-center gap-1.5 font-mono">
                      <User size={12} style={{ color: accent }} />
                      About Profile
                    </h3>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      {cvData.summary}
                    </p>
                  </div>

                  {/* Technical Skills Dark Card with Progress Bars */}
                  <div className="p-3.5 rounded-xl bg-[#111613] text-white border border-white/10 space-y-2.5 shadow-md">
                    <h3 className="font-bold uppercase tracking-wider text-[10px] text-white flex items-center gap-1.5 font-mono">
                      <Sparkles size={12} style={{ color: accent }} />
                      Technical Skills
                    </h3>
                    <div className="space-y-2">
                      {cvData.skills.slice(0, 6).map((skill, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-300 font-medium">{skill}</span>
                            <span style={{ color: accent }} className="font-bold">{96 - idx * 4}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${96 - idx * 4}%`, background: accent }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools Card */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <h3 className="font-bold uppercase tracking-wider text-[10px] text-slate-800 font-mono">
                      Tools & Platforms
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {cvData.tools.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white border border-slate-300 text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-[10px] font-mono text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 uppercase block text-[9px]">Languages</span>
                    {cvData.languages.map((l, i) => (
                      <div key={i} className="text-[10px]">• {l}</div>
                    ))}
                  </div>
                </div>

                {/* Right Column (64%): Education & Experience */}
                <div className="col-span-8 space-y-4">
                  {/* Experience Section */}
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-300 flex items-center gap-2 text-slate-900 font-mono">
                      <Briefcase size={13} style={{ color: accent }} />
                      Work Experience
                    </h2>
                    <div className="space-y-3.5">
                      {cvData.experiences.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-black text-slate-900 text-xs">{exp.role}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              {exp.period}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                            <span>{exp.company}</span>
                            {exp.location && <span className="text-[9px] font-normal text-slate-400">· {exp.location}</span>}
                          </div>
                          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                            {exp.highlights.map((hi, hIdx) => (
                              <li key={hIdx}>{hi}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-300 flex items-center gap-2 text-slate-900 font-mono">
                      <GraduationCap size={13} style={{ color: accent }} />
                      Education & Training
                    </h2>
                    <div className="space-y-2.5">
                      {cvData.education.map((edu, i) => (
                        <div key={i} className="flex items-baseline justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{edu.degree}</span>
                            <span className="text-[10px] text-slate-600">{edu.institution}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {edu.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {cvData.certifications.length > 0 && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b border-slate-300 flex items-center gap-2 text-slate-900 font-mono">
                        <Award size={13} style={{ color: accent }} />
                        Certifications & Accreditations
                      </h2>
                      <div className="space-y-1">
                        {cvData.certifications.map((c, i) => (
                          <div key={i} className="flex items-baseline justify-between text-[10px]">
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-[9px] font-mono text-slate-500">{c.issuer} ({c.year})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Print Footer */}
              <div className="px-8 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>Developer & Technical Executive Portfolio</span>
                <span>Designed with Saimoon AI CV Studio</span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 2. PROFESSIONAL TEMPLATE (INSPIRED BY Professional.jpg)            */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'professional' && (
            <div className="h-full flex bg-white text-slate-900">
              {/* Left Dark Charcoal Column (36% Width) */}
              <div className="w-[36%] bg-[#24272C] text-slate-200 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-5">
                  {/* Photo or Monogram Frame */}
                  {hasPhoto ? (
                    <div className="flex justify-center pt-2">
                      <div className="relative w-28 h-28 rounded-full p-1 border-2 border-white/30 shadow-2xl">
                        <img
                          src={cvData.profileImage!}
                          alt={cvData.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    /* NO PHOTO: Refined Executive Credential Badge */
                    <div className="pt-2">
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                        <div
                          className="w-12 h-12 mx-auto rounded-full flex items-center justify-center font-serif text-lg font-black text-white shadow-inner"
                          style={{ background: `linear-gradient(135deg, ${accent}, #111)` }}
                        >
                          {initials}
                        </div>
                        <div className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                          Verified Candidate
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                          ATS Standard Portfolio
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black text-[9px]" style={{ background: accent }}>
                        •
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                        Contact Info
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[10px] font-mono text-slate-300 pl-2">
                      <div className="flex items-center gap-2">
                        <Phone size={11} style={{ color: accent }} />
                        <span>{cvData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={11} style={{ color: accent }} />
                        <span className="truncate">{cvData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={11} style={{ color: accent }} />
                        <span>{cvData.location}</span>
                      </div>
                      {cvData.portfolioUrl && (
                        <div className="flex items-center gap-2">
                          <Globe size={11} style={{ color: accent }} />
                          <span className="truncate">{cvData.portfolioUrl.replace('https://', '')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills with 5 Star Ratings */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black text-[9px]" style={{ background: accent }}>
                        •
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                        Core Skills
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[10px] pl-2">
                      {cvData.skills.slice(0, 5).map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-slate-300 truncate max-w-[110px]">{skill}</span>
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                size={10}
                                fill={sIdx < 5 - (idx % 2) ? 'currentColor' : 'none'}
                                className={sIdx < 5 - (idx % 2) ? 'text-amber-400' : 'text-slate-600'}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages with Dual-Tone Progress Bars */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black text-[9px]" style={{ background: accent }}>
                        •
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                        Languages
                      </span>
                    </div>

                    <div className="space-y-2 text-[10px] pl-2 font-mono">
                      {cvData.languages.map((lang, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-slate-300">
                            <span>{lang}</span>
                            <span style={{ color: accent }}>{idx === 0 ? 'Fluent' : 'Native'}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: idx === 0 ? '90%' : '100%', background: accent }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 text-center pt-2">
                  Verified Executive ATS Layout
                </div>
              </div>

              {/* Right White Column (64% Width) */}
              <div className="w-[64%] p-7 flex flex-col justify-between bg-[#fbfbfb] text-slate-900">
                <div className="space-y-5">
                  {/* Warm Caramel / Accent Header Pill Card */}
                  <div
                    className="p-5 rounded-2xl text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg, #8B5A3C 0%, #4A2814 100%)`,
                    }}
                  >
                    <h1 className="text-3xl font-black tracking-tight uppercase text-white font-sans">
                      {cvData.fullName}
                    </h1>
                    <div className="font-mono text-xs font-bold tracking-widest uppercase mt-1 text-amber-200">
                      Professional {cvData.jobTitle}
                    </div>
                    <p className="text-[10px] text-amber-100 mt-2 leading-relaxed">
                      {cvData.summary}
                    </p>
                  </div>

                  {/* Education Timeline */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black text-[9px]" style={{ background: '#8B5A3C', color: '#fff' }}>
                        •
                      </div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                        Education
                      </h2>
                    </div>

                    <div className="border-l-2 ml-2.5 pl-5 space-y-3" style={{ borderColor: '#8B5A3C60' }}>
                      {cvData.education.map((edu, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#8B5A3C' }} />
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-900 text-xs">{edu.degree}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">{edu.period}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">{edu.institution}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Experience Timeline */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black text-[9px]" style={{ background: '#8B5A3C' }}>
                        •
                      </div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                        Work Experience
                      </h2>
                    </div>

                    <div className="border-l-2 ml-2.5 pl-5 space-y-3.5" style={{ borderColor: '#8B5A3C60' }}>
                      {cvData.experiences.map((exp, i) => (
                        <div key={i} className="relative space-y-1">
                          <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: '#8B5A3C' }} />
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">{exp.period}</span>
                          </div>
                          <div className="text-[10px] font-bold text-amber-950">{exp.company}</div>
                          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                            {exp.highlights.map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Professional Standard Resume</span>
                  <span>Confidential</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 3. CREATIVE DIRECTOR TEMPLATE (INSPIRED BY Creative.jpg)           */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'creative' && (
            <div className="h-full flex bg-white text-slate-900">
              {/* Organic Dark Sidebar (36% Width) */}
              <div className="w-[36%] bg-[#282B30] text-slate-200 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Photo or Heraldic Monogram */}
                  {hasPhoto ? (
                    <div className="flex justify-center pt-2">
                      <div
                        className="w-28 h-28 rounded-full p-1 border-4 shadow-xl"
                        style={{ borderColor: accent }}
                      >
                        <img
                          src={cvData.profileImage!}
                          alt={cvData.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    /* NO PHOTO: High-End Luxury Monogram Seal */
                    <div className="pt-1 flex justify-center">
                      <div
                        className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-2 shadow-xl"
                        style={{ borderColor: accent }}
                      >
                        <span className="text-[8px] tracking-widest uppercase font-mono text-slate-400">★ ★ ★</span>
                        <span className="font-serif text-2xl font-black text-white">{initials}</span>
                        <span className="text-[7px] tracking-widest uppercase font-mono" style={{ color: accent }}>STUDIO</span>
                      </div>
                    </div>
                  )}

                  {/* Contact White Inset Card */}
                  <div className="p-3.5 rounded-xl bg-white text-slate-800 shadow-md space-y-1.5">
                    <h3 className="font-mono text-xs uppercase font-black text-slate-900 border-b pb-1">
                      Contact
                    </h3>
                    <div className="space-y-1 text-[10px] font-mono text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone size={11} style={{ color: accent }} />
                        <span>{cvData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={11} style={{ color: accent }} />
                        <span className="truncate">{cvData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={11} style={{ color: accent }} />
                        <span>{cvData.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills with 5-Star Ratings */}
                  <div className="p-3.5 rounded-xl bg-[#1d2024] text-white border border-white/10 space-y-1.5">
                    <h3 className="font-mono text-xs uppercase font-bold text-white flex items-center justify-between">
                      <span>Skills</span>
                      <Sparkles size={11} style={{ color: accent }} />
                    </h3>
                    <div className="space-y-1 text-[9px]">
                      {cvData.skills.slice(0, 5).map((sk, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-slate-300 truncate max-w-[100px]">{sk}</span>
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                size={9}
                                fill={sIdx < 5 - (i % 2) ? 'currentColor' : 'none'}
                                className={sIdx < 5 - (i % 2) ? 'text-amber-400' : 'text-slate-600'}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages Percentage Circles */}
                  <div className="p-3 rounded-xl bg-[#1d2024] text-white border border-white/10 space-y-1.5 text-center">
                    <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block">
                      Language Fluency
                    </span>
                    <div className="flex justify-around items-center pt-1">
                      {cvData.languages.map((lang, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono font-bold text-[9px]"
                            style={{ borderColor: accent, color: accent }}
                          >
                            {idx === 0 ? '100%' : '85%'}
                          </div>
                          <span className="text-[8px] font-mono text-slate-300 mt-0.5">{lang.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 text-center">
                  Creative Director Portfolio
                </div>
              </div>

              {/* Right White Column (64% Width) */}
              <div className="w-[64%] p-7 flex flex-col justify-between bg-white text-slate-900">
                <div className="space-y-5">
                  {/* Name Header with Center Rule */}
                  <div className="text-center pb-3 border-b">
                    <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900 font-sans">
                      {cvData.fullName}
                    </h1>
                    <div className="flex items-center justify-center gap-3 my-1">
                      <div className="h-[1px] w-12 bg-slate-400" />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                      <div className="h-[1px] w-12 bg-slate-400" />
                    </div>
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600">
                      {cvData.jobTitle}
                    </div>
                  </div>

                  {/* Profile Statement */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                      <User size={12} style={{ color: accent }} />
                      Profile
                    </h2>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      {cvData.summary}
                    </p>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5 border-b pb-1">
                      <Briefcase size={12} style={{ color: accent }} />
                      Work Experience
                    </h2>
                    <div className="space-y-3.5">
                      {cvData.experiences.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-black text-slate-900 text-xs">{exp.role}</span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">{exp.period}</span>
                          </div>
                          <div className="text-[10px] font-bold" style={{ color: accent }}>{exp.company}</div>
                          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                            {exp.highlights.map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5 border-b pb-1">
                      <GraduationCap size={12} style={{ color: accent }} />
                      Education
                    </h2>
                    <div className="space-y-1.5">
                      {cvData.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{edu.degree}</span>
                            <span className="text-[10px] text-slate-600">{edu.institution}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">{edu.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>Award-Winning Creative Layout</span>
                  <span>Verified A4 Standard</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 4. LEAD VIDEO EDITOR (INSPIRED BY Editor.jpg - Moris Maxwell)       */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'editor' && (
            <div className="h-full flex flex-col justify-between p-7 text-xs leading-relaxed bg-[#fcfcfc] text-slate-900">
              {/* Cinematic Header */}
              <div
                className="p-5 rounded-2xl text-white shadow-xl flex items-center justify-between gap-6"
                style={{ background: 'linear-gradient(135deg, #050b14 0%, #0d1b2a 100%)' }}
              >
                <div>
                  <span
                    className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5"
                    style={{ background: `${accent}30`, color: accent }}
                  >
                    <Film size={11} />
                    {cvData.jobTitle}
                  </span>
                  <h1 className="text-3xl font-black tracking-tight text-white mt-1.5 font-sans">
                    {cvData.fullName}
                  </h1>
                  <p className="text-[10px] text-slate-300 mt-2 max-w-xl leading-relaxed">
                    {cvData.summary}
                  </p>
                </div>

                {hasPhoto ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-2xl shrink-0" style={{ borderColor: accent }}>
                    <img src={cvData.profileImage!} alt={cvData.fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-2xl"
                    style={{ borderColor: accent, background: '#0a1626' }}
                  >
                    <span className="font-mono text-2xl font-black text-white">{initials}</span>
                    <span className="text-[8px] font-mono text-emerald-400 mt-0.5">VFX PRO</span>
                  </div>
                )}
              </div>

              {/* Stats Highlight Bar */}
              <div className="grid grid-cols-4 gap-3 my-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Commercial Reach</div>
                  <div className="text-sm font-black font-mono" style={{ color: accent }}>45M+ Views</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Projects Delivered</div>
                  <div className="text-sm font-black font-mono text-slate-900">340+ Videos</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Top Rated Status</div>
                  <div className="text-sm font-black font-mono text-emerald-600">Top 3% Upwork</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[9px] font-mono text-slate-500 uppercase">Turnaround SLA</div>
                  <div className="text-sm font-black font-mono text-blue-600">24-48 Hours</div>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-12 gap-6 flex-1">
                <div className="col-span-8 space-y-3.5">
                  <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b text-slate-900 font-mono" style={{ borderColor: `${accent}50` }}>
                    Production Credits & Experience
                  </h2>
                  <div className="space-y-3">
                    {cvData.experiences.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">{exp.period}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700">{exp.company}</div>
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                          {exp.highlights.map((item, hi) => (
                            <li key={hi}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-4 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1.5">
                      Post-Production Stack
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {cvData.tools.map((tool, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white border border-slate-300 text-slate-800">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1.5">
                      Editing Competencies
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {cvData.skills.map((skill, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-800 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1">Direct Contact</h3>
                    <div className="text-[9px] font-mono text-slate-600 space-y-0.5">
                      <div>{cvData.email}</div>
                      <div>{cvData.phone}</div>
                      <div>{cvData.portfolioUrl}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>Cinematic Video Portfolio Format</span>
                <span>Verified High-Definition</span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 5. GRAPHICS DESIGNER TEMPLATE (INSPIRED BY Graphics designer.jpg)  */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'graphics-designer' && (
            <div className="h-full flex flex-col justify-between bg-white text-slate-900">
              {/* Top Section: Photo card + High-Fashion Serif Masthead */}
              <div className="px-8 pt-7 pb-4 flex items-center justify-between gap-6">
                {hasPhoto && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#243342] p-1 shadow-lg shrink-0">
                    <img src={cvData.profileImage!} alt={cvData.fullName} className="w-full h-full object-cover rounded-xl" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 font-serif">
                    {cvData.fullName}
                  </h1>
                  <div className="font-mono text-xs font-bold tracking-widest uppercase text-slate-500 mt-0.5">
                    {cvData.jobTitle}
                  </div>
                </div>
              </div>

              {/* Dark Horizontal Pill Strip for Contact Details */}
              <div className="mx-8 px-5 py-2.5 rounded-full bg-[#1e2a36] text-slate-200 flex items-center justify-between text-[10px] font-mono shadow-md">
                <span className="flex items-center gap-1.5"><Phone size={11} className="text-emerald-400" /> {cvData.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={11} className="text-emerald-400" /> {cvData.email}</span>
                <span className="flex items-center gap-1.5"><Globe size={11} className="text-emerald-400" /> {cvData.portfolioUrl ? cvData.portfolioUrl.replace('https://', '') : cvData.location}</span>
                <span className="flex items-center gap-1.5"><MapPin size={11} className="text-emerald-400" /> {cvData.location}</span>
              </div>

              {/* Body: Navy Sidebar (Left) + Clean White (Right) */}
              <div className="grid grid-cols-12 gap-7 px-8 pt-5 pb-5 flex-1 text-xs">
                {/* Left Deep Navy Column (36%) */}
                <div className="col-span-4 rounded-2xl bg-[#243342] text-slate-200 p-4 space-y-4 shadow-sm">
                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-2">
                      Education
                    </h3>
                    <div className="space-y-2 text-[10px]">
                      {cvData.education.map((edu, i) => (
                        <div key={i}>
                          <div className="font-bold text-white">{edu.degree}</div>
                          <div className="text-slate-300">{edu.institution}</div>
                          <div className="text-[9px] font-mono text-slate-400">{edu.period}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-2">
                      Skills
                    </h3>
                    <div className="space-y-1 text-[10px]">
                      {cvData.skills.slice(0, 6).map((sk, i) => (
                        <div key={i} className="text-slate-300">• {sk}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-2">
                      Languages
                    </h3>
                    <div className="space-y-1 text-[10px]">
                      {cvData.languages.map((lang, i) => (
                        <div key={i} className="text-slate-300">• {lang}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right White Column (64%) */}
                <div className="col-span-8 space-y-4">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b text-slate-900 font-mono">
                      About Me
                    </h2>
                    <p className="text-[10px] text-slate-600 leading-relaxed mt-1 font-sans">
                      {cvData.summary}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b text-slate-900 font-mono">
                      Experience
                    </h2>
                    <div className="space-y-3.5 mt-2">
                      {cvData.experiences.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-black text-slate-900 text-xs">{exp.role}</span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">{exp.period}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-700">{exp.company}</div>
                          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                            {exp.highlights.map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>Editorial Graphic Design Format</span>
                <span>Verified Clean Standard</span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 6. HR & CORPORATE RECRUITER (INSPIRED BY hr.jpg - Jonathan P.)    */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {template === 'hr' && (
            <div className="h-full flex bg-white text-slate-900">
              {/* Midnight Navy Arched Pillar (36% Width) */}
              <div className="w-[36%] bg-[#162B4D] text-slate-200 p-6 flex flex-col justify-between relative">
                <div className="space-y-4">
                  {hasPhoto ? (
                    <div className="flex justify-center pt-2">
                      <div className="w-28 h-32 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-white/30 shadow-xl">
                        <img src={cvData.profileImage!} alt={cvData.fullName} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 flex justify-center">
                      <div className="w-24 h-28 rounded-t-full rounded-b-2xl border-2 border-white/20 bg-white/5 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                        <span className="font-serif text-xl font-black text-white">{initials}</span>
                        <span className="text-[8px] font-mono text-blue-300 mt-1 uppercase">HR LEAD</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-1.5">
                      About Me
                    </h3>
                    <p className="text-[9px] text-slate-300 leading-relaxed">
                      {cvData.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-1.5">
                      Contact
                    </h3>
                    <div className="space-y-1 text-[9px] font-mono text-slate-300">
                      <div>{cvData.phone}</div>
                      <div className="truncate">{cvData.email}</div>
                      <div>{cvData.location}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs uppercase font-bold text-white border-b border-white/20 pb-1 mb-1.5">
                      Core Skills
                    </h3>
                    <div className="space-y-0.5 text-[9px] text-slate-300">
                      {cvData.skills.slice(0, 6).map((sk, i) => (
                        <div key={i}>• {sk}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-blue-200 text-center">
                  Executive HR Standard
                </div>
              </div>

              {/* Right White Column (64% Width) */}
              <div className="w-[64%] p-7 flex flex-col justify-between bg-white text-slate-900">
                <div className="space-y-5">
                  <div className="border-b pb-3">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-[#162B4D] font-sans">
                      {cvData.fullName}
                    </h1>
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600 mt-0.5">
                      {cvData.jobTitle}
                    </div>
                  </div>

                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[#162B4D] font-mono text-xs font-black uppercase mb-3">
                      Experience
                    </div>
                    <div className="space-y-3.5 pl-1">
                      {cvData.experiences.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="font-black text-slate-900 text-xs">{exp.role}</span>
                            <span className="text-[9px] font-mono text-slate-500 font-bold">{exp.period}</span>
                          </div>
                          <div className="text-[10px] font-bold text-[#162B4D]">{exp.company}</div>
                          <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                            {exp.highlights.map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[#162B4D] font-mono text-xs font-black uppercase mb-2.5">
                      Education
                    </div>
                    <div className="space-y-2 pl-1">
                      {cvData.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{edu.degree}</span>
                            <span className="text-[10px] text-slate-600">{edu.institution}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">{edu.period}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>HR & Talent Management Format</span>
                  <span>Confidential</span>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* 7-10. UNIVERSAL EXECUTIVE / DIRECTOR / TECH FORMATS                */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {!['developer', 'professional', 'creative', 'editor', 'graphics-designer', 'hr'].includes(template) && (
            <div className="h-full flex flex-col justify-between p-8 text-xs leading-relaxed bg-white">
              {/* Prestigious Corporate Top Banner */}
              <div className="pb-4 border-b-2 flex items-center justify-between gap-6" style={{ borderColor: accent }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase text-white" style={{ background: accent }}>
                      {template.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{cvData.location}</span>
                  </div>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 font-serif">{cvData.fullName}</h1>
                  <div className="font-mono text-xs font-bold tracking-widest uppercase mt-0.5" style={{ color: accent }}>
                    {cvData.jobTitle}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5 max-w-xl leading-relaxed">{cvData.summary}</p>
                </div>

                {hasPhoto ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 shadow-md shrink-0" style={{ borderColor: accent }}>
                    <img src={cvData.profileImage!} alt={cvData.fullName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 shrink-0 shadow-inner" style={{ borderColor: accent }}>
                    <span className="font-serif text-2xl font-black text-slate-800">{initials}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Executive</span>
                  </div>
                )}
              </div>

              {/* Ribbon */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 py-2 px-4 text-[10px] font-mono text-white rounded-lg my-3"
                style={{ background: `linear-gradient(90deg, ${accent}, ${secondary})` }}
              >
                <span className="flex items-center gap-1 font-bold">{cvData.email}</span>
                <span className="flex items-center gap-1">{cvData.phone}</span>
                <span className="flex items-center gap-1">{cvData.location}</span>
                {cvData.portfolioUrl && <span>{cvData.portfolioUrl.replace('https://', '')}</span>}
              </div>

              {/* Body */}
              <div className="grid grid-cols-12 gap-6 flex-1 mt-1">
                <div className="col-span-8 space-y-3.5">
                  <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b font-mono" style={{ color: accent, borderColor: `${accent}40` }}>
                    Executive Career History & Milestones
                  </h2>
                  <div className="space-y-3">
                    {cvData.experiences.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                          <span className="text-[9px] font-mono text-slate-500 font-semibold">{exp.period}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700">{exp.company}</div>
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-[10px] text-slate-600 leading-relaxed">
                          {exp.highlights.map((item, hi) => (
                            <li key={hi}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <h2 className="text-xs font-black uppercase tracking-wider pb-1 border-b font-mono mt-3" style={{ color: accent, borderColor: `${accent}40` }}>
                    Education & Credentials
                  </h2>
                  <div className="space-y-1.5">
                    {cvData.education.map((edu, i) => (
                      <div key={i} className="flex items-baseline justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{edu.degree}</span>
                          <span className="text-[10px] text-slate-600">{edu.institution}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 font-semibold">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-4 space-y-3 border-l pl-4 border-slate-200">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color: accent }}>
                      Core Competencies
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {cvData.skills.map((skill, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-800 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider mb-1.5 font-mono" style={{ color: accent }}>
                      Tools & Platforms
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {cvData.tools.map((tool, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[9px] border border-slate-300 text-slate-700 font-mono">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider mb-1 font-mono" style={{ color: accent }}>
                      Languages
                    </h3>
                    <div className="space-y-0.5 text-[9px] text-slate-600 font-mono">
                      {cvData.languages.map((lang, i) => (
                        <div key={i}>• {lang}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>Template: {template.toUpperCase()} · Certified Corporate Format</span>
                <span>Confidential</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default A4CVPreview;
