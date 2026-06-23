import { useEffect, useRef, useState } from 'react';
import { Award, Briefcase, Star, TrendingUp, Zap, Target, Code, Play } from 'lucide-react';

const timelineData = [
  { 
    role: 'Senior Video Editor & Motion Designer', 
    org: 'Global D2C Brands & Upwork', 
    duration: '2020 – Present', 
    impact: 'Engineered 540+ high-converting commercial & motion graphics pieces. Drove engagement across fashion, tech, and lifestyle sectors with top 3% global freelancer rating.',
    icon: Play
  },
  { 
    role: 'UI/UX Designer & Web Developer', 
    org: 'Freelance / Remote', 
    duration: '2019 – Present', 
    impact: 'Architected and deployed 40+ production-grade web applications. Elevated user experiences with React, Next.js, and advanced GSAP/Three.js animations, boosting conversion rates by an average of 35%.',
    icon: Code
  },
  { 
    role: 'AI Automation Specialist & Founder', 
    org: 'ORBIT Labs', 
    duration: '2023 – Present', 
    impact: 'Pioneering AI-powered creative workflows. Designing intelligent systems and automation tools that drastically reduce production timelines for modern creators.',
    icon: Zap
  },
];

const skillsData = [
  { name: 'Video Editing', percentage: 95, color: '#1976d2' },
  { name: 'Motion Graphics', percentage: 92, color: '#42a5f5' },
  { name: 'UI/UX Design', percentage: 88, color: '#00C853' },
  { name: 'Web Development', percentage: 90, color: '#FFB36B' },
  { name: 'AI Automation', percentage: 85, color: '#ab47bc' },
];

const stats = [
  { value: '5+', label: 'Years Experience' },
  { value: '500+', label: 'Projects Delivered' },
  { value: '100%', label: 'Job Success Score' },
  { value: 'Top 3%', label: 'Global Talent' },
];

const certsData = [
  { id: '1', title: 'Top Rated Plus', subtitle: 'Upwork Global Platform', issuer: 'Upwork' },
  { id: '2', title: 'Certified Professional', subtitle: 'Adobe Premiere Pro', issuer: 'Adobe' },
  { id: '3', title: 'Advanced Systems', subtitle: 'Figma UI/UX Design', issuer: 'Figma' },
];

function SkillRing({ name, percentage, color, delay }: { name: string; percentage: number; color: string; delay: number }) {
  const ringRef = useRef<SVGCircleElement>(null);
  const [animated, setAnimated] = useState(false);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
          {/* Background circle */}
          <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="6" />
          {/* Animated circle */}
          <circle
            ref={ringRef}
            cx="55" cy="55" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ 
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: `drop-shadow(0 0 4px ${color}20)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <span className="font-display text-xl font-bold" style={{ color: '#0A1A0F' }}>
            {percentage}<span className="text-xs" style={{ color: '#5A7A6A' }}>%</span>
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest font-semibold text-center max-w-[100px]" style={{ color: '#5A7A6A' }}>
        {name}
      </span>
    </div>
  );
}

export default function CareerPanel() {
  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit" style={{ background: 'rgba(25, 118, 210, 0.08)', border: '1px solid rgba(25, 118, 210, 0.15)' }}>
          <Target size={14} style={{ color: '#1976d2' }} />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold" style={{ color: '#1976d2' }}>Multidisciplinary Expert</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight" style={{ color: '#0A1A0F' }}>
          Crafting Digital Experiences <br/>
          <span style={{ color: '#1976d2' }}>Across Five Dimensions.</span>
        </h2>
        <p className="text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: '#5A7A6A' }}>
          I am Muhammad Saimoon Hassan. With an extensive background ranging from high-end video production to advanced web engineering and AI automation, I bridge the gap between creative vision and technical execution.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: 'rgba(25, 118, 210, 0.03)', borderColor: 'rgba(25, 118, 210, 0.1)' }}>
              <span className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#1976d2' }}>{stat.value}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-medium" style={{ color: '#5A7A6A' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div>
        <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3" style={{ color: '#0A1A0F' }}>
          <Briefcase size={22} style={{ color: '#1976d2' }} />
          Professional Trajectory
        </h3>
        <div className="flex flex-col gap-8 relative before:absolute before:inset-0 before:ml-[19px] md:before:ml-[23px] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#1976d2] before:to-transparent">
          {timelineData.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="relative pl-12 md:pl-16 group">
                {/* Timeline Dot/Icon */}
                <div 
                  className="absolute left-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 z-10"
                  style={{ background: '#fff', border: '2px solid #1976d2', boxShadow: '0 0 10px rgba(25, 118, 210, 0.15)' }}
                >
                  <Icon size={16} style={{ color: '#1976d2' }} />
                </div>
                
                {/* Content Card */}
                <div className="p-6 rounded-xl border bg-white transition-all duration-300 hover:shadow-md hover:border-blue-500/30" style={{ borderColor: 'rgba(25, 118, 210, 0.08)' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <h4 className="font-display font-bold text-lg" style={{ color: '#0A1A0F' }}>{item.role}</h4>
                    <span className="font-mono text-xs px-3 py-1 rounded-full w-fit" style={{ background: 'rgba(25, 118, 210, 0.06)', color: '#1976d2' }}>{item.duration}</span>
                  </div>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#1976d2' }}>{item.org}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A7A6A' }}>{item.impact}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Matrix */}
      <div>
        <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3" style={{ color: '#0A1A0F' }}>
          <TrendingUp size={22} style={{ color: '#1976d2' }} />
          Core Competencies
        </h3>
        <div className="flex flex-wrap gap-8 justify-center p-8 rounded-2xl border" style={{ background: 'rgba(25, 118, 210, 0.02)', borderColor: 'rgba(25, 118, 210, 0.06)' }}>
          {skillsData.map((skill, i) => (
            <SkillRing key={skill.name} name={skill.name} percentage={skill.percentage} color={skill.color} delay={i * 150} />
          ))}
        </div>
      </div>

      {/* Accolades */}
      <div>
        <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3" style={{ color: '#0A1A0F' }}>
          <Award size={22} style={{ color: '#1976d2' }} />
          Accolades & Recognition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {certsData.map((cert) => (
            <div
              key={cert.id}
              className="group p-5 rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ borderColor: 'rgba(25, 118, 210, 0.08)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12"
                  style={{ background: 'rgba(25, 118, 210, 0.06)' }}
                >
                  <Star size={18} style={{ color: '#1976d2' }} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm mb-1" style={{ color: '#0A1A0F' }}>{cert.title}</h4>
                  <p className="text-xs" style={{ color: '#5A7A6A' }}>{cert.subtitle}</p>
                  <div className="mt-2 text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: '#1976d2' }}>
                    {cert.issuer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
