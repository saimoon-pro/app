import { useState } from 'react';
import { ExternalLink, Zap, Accessibility, Search, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const projects = [
  {
    id: '1',
    title: 'Luminex.io',
    subtitle: 'Brand website for smart lighting company',
    description: 'An immersive brand experience with 3D elements, achieving 92 Lighthouse performance score and 40% increase in demo requests.',
    image: '/images/web-project-1.jpg',
    tags: ['React', 'Next.js', 'GSAP', 'Three.js', 'Tailwind'],
    link: 'https://luminex.io',
    metrics: { performance: 92, accessibility: 100, seo: 95, bestPractices: 100 },
    challenge: 'Balancing heavy 3D elements with sub-2s load times',
    solution: 'Implemented progressive loading with IntersectionObserver, lazy Three.js, and AVIF images',
  },
  {
    id: '2',
    title: 'EvoFit.co',
    subtitle: 'Fitness platform web application',
    description: 'Full-stack fitness tracking platform with social features and real-time data visualization.',
    image: '/images/web-project-2.jpg',
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    link: 'https://evofit.co',
    metrics: { performance: 88, accessibility: 96, seo: 92, bestPractices: 100 },
    challenge: 'Real-time activity tracking with 10K+ concurrent users',
    solution: 'WebSocket architecture with Redis caching and optimized database queries',
  },
];

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
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

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
            {/* Project Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{ transform: hoveredProject === project.id ? 'scale(1.03)' : 'scale(1)' }}
                loading="lazy"
              />
              <div className="absolute top-3 right-3">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                  style={{ background: 'rgba(0, 200, 83, 0.9)', color: '#fff' }}
                >
                  <ExternalLink size={12} />
                  Visit Site
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
