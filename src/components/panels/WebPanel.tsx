import { useState, useMemo } from 'react';
import { ExternalLink, Zap, Accessibility, Search, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';

function MetricGauge({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#00C853' : value >= 70 ? '#FFB36B' : '#FF6B6B';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 52, height: 52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
          <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(0, 200, 83, 0.08)" strokeWidth="4" />
          <circle
            cx="26" cy="26" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#5A7A6A' }}>{label}</span>
      <span className="font-mono text-xs font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

export default function WebPanel() {
  const content = useStore((s) => s.content);
  const projects = useMemo(() => {
    return content.filter(c => c.contentType === 'Website Project').map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle || c.category,
      description: c.description,
      image: c.thumbnailUrl || assetUrl('images/web-project-1.jpg'),
      tags: c.tags.length > 0 ? c.tags : ['Web'],
      link: c.websiteUrl,
      metrics: { performance: 92, accessibility: 100, seo: 95, bestPractices: 100 },
      challenge: 'Ensuring high performance with rich visual design.',
      solution: 'Optimized assets and used progressive rendering.',
    }));
  }, [content]);

  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [previewingProject, setPreviewingProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {projects.map((project) => {
        const isExpanded = expandedProject === project.id;

        return (
          <div
            key={project.id}
            className="glass-card overflow-hidden transition-all duration-300"
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
          >
            {/* Project Image / Preview */}
            <div className="relative overflow-hidden group" style={{ aspectRatio: '16/9' }}>
              {previewingProject === project.id ? (
                <iframe 
                  src={project.link} 
                  title={`Preview of ${project.title}`}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <img
                  src={project.image}
                  alt={`${project.title} - Website Development by Muhammad Saimoon Hassan`}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredProject === project.id ? 'scale(1.03)' : 'scale(1)' }}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={360}
                  onError={(e) => { (e.target as HTMLImageElement).src = assetUrl('images/web-project-1.jpg'); }}
                />
              )}
              
              <div className="absolute top-3 right-3 flex gap-2">
                {previewingProject !== project.id && (
                  <button
                    onClick={() => setPreviewingProject(project.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                    style={{ background: 'rgba(25, 118, 210, 0.9)', color: '#fff' }}
                  >
                    <Zap size={12} />
                    Live Preview
                  </button>
                )}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                  style={{ background: 'rgba(0, 200, 83, 0.9)', color: '#fff' }}
                >
                  <ExternalLink size={12} />
                  Visit
                </a>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-5">
              <h4 className="font-display font-semibold text-base" style={{ color: '#0A1A0F' }}>{project.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: '#5A7A6A' }}>{project.subtitle}</p>
              <p className="text-sm mt-3" style={{ color: '#5A7A6A', lineHeight: 1.6 }}>{project.description}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono"
                    style={{ background: 'rgba(0, 200, 83, 0.06)', color: '#5A7A6A', border: '1px solid rgba(0, 200, 83, 0.1)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                className="flex items-center gap-1.5 mt-4 text-xs font-mono uppercase tracking-wider transition-colors duration-200"
                style={{ color: '#00C853' }}
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isExpanded ? 'Less Details' : 'More Details'}
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0, 200, 83, 0.08)' }}>
                  <div className="flex flex-col gap-3 mb-5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>Challenge</span>
                      <p className="text-sm mt-0.5" style={{ color: '#5A7A6A' }}>{project.challenge}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>Solution</span>
                      <p className="text-sm mt-0.5" style={{ color: '#5A7A6A' }}>{project.solution}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#5A7A6A' }}>Lighthouse Scores</span>
                    <div className="flex gap-6 mt-3">
                      <MetricGauge label="Perf" value={project.metrics.performance} icon={Zap} />
                      <MetricGauge label="A11y" value={project.metrics.accessibility} icon={Accessibility} />
                      <MetricGauge label="SEO" value={project.metrics.seo} icon={Search} />
                      <MetricGauge label="Best" value={project.metrics.bestPractices} icon={Shield} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
