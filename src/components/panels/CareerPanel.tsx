import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Briefcase, Star, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const timelineData = [
  { role: 'Senior Video Editor', org: 'Freelance', duration: '2021 – Present', impact: 'Edited 340+ commercial videos for D2C brands across fashion, tech, and lifestyle' },
  { role: 'Motion Graphics Designer', org: 'Upwork / Remote', duration: '2020 – 2023', impact: 'Created 200+ motion graphics pieces including title sequences, social ads, and explainer videos' },
  { role: 'UI/UX Designer', org: 'Multiple Clients', duration: '2019 – 2022', impact: 'Designed interfaces for 15+ web and mobile applications, improving conversion rates by avg 35%' },
  { role: 'Web Developer', org: 'Freelance', duration: '2018 – Present', impact: 'Built 25+ production websites using React, Next.js, and modern animation stacks' },
  { role: 'AI Automation Founder', org: 'ORBIT Labs', duration: '2023 – Present', impact: 'Developing AI-powered creative tools and automation workflows for content creators' },
];

const skillsData = [
  { name: 'Video Editing', percentage: 95 },
  { name: 'Motion Graphics', percentage: 90 },
  { name: 'UI/UX Design', percentage: 88 },
  { name: 'Web Development', percentage: 85 },
  { name: 'AI/Automation', percentage: 78 },
];

const certsData = [
  { id: '1', title: 'Top Rated Plus — Upwork', subtitle: 'Top 3% of freelancers globally', issuer: 'Upwork' },
  { id: '2', title: 'Adobe Certified Professional', subtitle: 'Premiere Pro Certification', issuer: 'Adobe' },
  { id: '3', title: 'Figma Advanced Certification', subtitle: 'Advanced prototyping and systems', issuer: 'Figma' },
  { id: '4', title: '100% Job Success Score', subtitle: '4+ years of excellence', issuer: 'Upwork' },
];

const featuredProjects = [
  { title: 'Brand Launch Campaign — Luminex', category: 'Video Editing', link: 'video' },
  { title: 'E-commerce Dashboard Redesign', category: 'UI/UX Design', link: 'design' },
  { title: 'SaaS Landing Page — FlowState', category: 'Web Development', link: 'web' },
];

function SkillRing({ name, percentage, delay }: { name: string; percentage: number; delay: number }) {
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
          <circle
            cx="55" cy="55" r={radius}
            fill="none"
            stroke="rgba(0, 200, 83, 0.1)"
            strokeWidth="6"
          />
          <circle
            ref={ringRef}
            cx="55" cy="55" r={radius}
            fill="none"
            stroke="#00C853"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-semibold" style={{ color: '#0A1A0F' }}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#5A7A6A' }}>
        {name}
      </span>
    </div>
  );
}

export default function CareerPanel() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    sectionRefs.current.forEach((el) => {
      if (!el) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
        },
        once: true,
      });
      triggers.push(st);
    });

    return () => triggers.forEach(st => st.kill());
  }, []);

  return (
    <div className="flex flex-col gap-12">
      {/* Origin Story */}
      <div ref={el => { sectionRefs.current[0] = el; }} style={{ opacity: 0 }}>
        <p className="text-base leading-relaxed" style={{ color: '#5A7A6A', lineHeight: 1.7 }}>
          Five disciplines, one creative mind. I started with a love for visual storytelling and built outward —
          from cutting footage to designing interfaces, from animating pixels to engineering intelligent systems.
          Every skill I add serves the same mission: <span style={{ color: '#0A1A0F', fontWeight: 500 }}>creating experiences that move people.</span>
        </p>
      </div>

      {/* Experience Timeline */}
      <div ref={el => { sectionRefs.current[1] = el; }} style={{ opacity: 0 }}>
        <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: '#0A1A0F' }}>
          <Briefcase size={18} style={{ color: '#00C853' }} />
          Experience
        </h3>
        <div className="flex flex-col gap-0">
          {timelineData.map((item, i) => (
            <div
              key={i}
              className="relative pl-8 pb-8"
              style={{
                borderLeft: i < timelineData.length - 1 ? '1px solid rgba(0, 200, 83, 0.15)' : 'none',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: '#00C853',
                  left: -5,
                  top: 4,
                  boxShadow: '0 0 8px rgba(0, 200, 83, 0.3)',
                }}
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-display font-semibold text-sm" style={{ color: '#0A1A0F' }}>{item.role}</h4>
                  <span className="font-mono text-xs" style={{ color: '#5A7A6A' }}>{item.duration}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: '#00C853' }}>{item.org}</p>
                <p className="text-sm mt-1" style={{ color: '#5A7A6A', lineHeight: 1.6 }}>{item.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Visualization */}
      <div ref={el => { sectionRefs.current[2] = el; }} style={{ opacity: 0 }}>
        <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: '#0A1A0F' }}>
          <TrendingUp size={18} style={{ color: '#00C853' }} />
          Skills
        </h3>
        <div className="flex flex-wrap gap-8 justify-center">
          {skillsData.map((skill, i) => (
            <SkillRing key={skill.name} name={skill.name} percentage={skill.percentage} delay={i * 150} />
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div ref={el => { sectionRefs.current[3] = el; }} style={{ opacity: 0 }}>
        <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: '#0A1A0F' }}>
          <Award size={18} style={{ color: '#00C853' }} />
          Certifications & Achievements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {certsData.map((cert) => (
            <div
              key={cert.id}
              className="glass-card p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ cursor: 'default' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'rgba(0, 200, 83, 0.1)',
                  }}
                >
                  <Star size={16} style={{ color: '#00C853' }} />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm" style={{ color: '#0A1A0F' }}>{cert.title}</h4>
                  <p className="text-xs mt-0.5" style={{ color: '#5A7A6A' }}>{cert.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects */}
      <div ref={el => { sectionRefs.current[4] = el; }} style={{ opacity: 0 }}>
        <h3 className="font-display text-lg font-semibold mb-6" style={{ color: '#0A1A0F' }}>
          Featured Work
        </h3>
        <div className="flex flex-col gap-3">
          {featuredProjects.map((project) => (
            <div
              key={project.title}
              className="glass-card p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ borderLeft: '3px solid #00C853' }}
            >
              <div>
                <h4 className="font-display font-medium text-sm" style={{ color: '#0A1A0F' }}>{project.title}</h4>
                <p className="text-xs mt-0.5" style={{ color: '#5A7A6A' }}>{project.category}</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}>
                View
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
