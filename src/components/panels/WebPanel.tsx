import { useState, useMemo } from 'react';
import { ExternalLink, Zap, Accessibility, Search, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import AlbumStrip, { type AlbumData } from '@/components/ui/AlbumStrip';

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
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

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
      album: c.album || '',
    }));
  }, [content]);

  // Extract dynamic albums for website projects
  const albums: AlbumData[] = useMemo(() => {
    const map: Record<string, { count: number; thumbnails: string[] }> = {};
    projects.forEach(p => {
      if (p.album && p.album.trim()) {
        const name = p.album.trim();
        if (!map[name]) {
          map[name] = { count: 0, thumbnails: [] };
        }
        map[name].count += 1;
        if (p.image) {
          map[name].thumbnails.push(p.image);
        }
      }
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      thumbnails: data.thumbnails,
    }));
  }, [projects]);

  // Filter projects by album
  const filteredProjects = useMemo(() => {
    let list = projects;
    if (selectedAlbum) {
      list = list.filter(p => (p.album || '').trim().toLowerCase() === selectedAlbum.trim().toLowerCase());
    } else if (albums.length > 0) {
      // If albums exist, show projects outside albums if available
      const unassigned = list.filter(p => !p.album || !p.album.trim());
      if (unassigned.length > 0) {
        list = unassigned;
      }
    }
    return list;
  }, [projects, selectedAlbum, albums.length]);

  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [previewingProject, setPreviewingProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Dynamic Album Carousel Strip (if albums exist) */}
      <AlbumStrip
        albums={albums}
        selectedAlbum={selectedAlbum}
        onSelectAlbum={(name) => setSelectedAlbum(name)}
        accentColor="#00C853"
        itemLabel="Websites"
      />

      {/* Album Filter Indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {selectedAlbum ? (
            <span className="flex items-center gap-2 text-[#00C853]">
              <span>📁 {selectedAlbum}</span>
              <span className="text-[11px] text-gray-500 font-normal">
                ({filteredProjects.length} {filteredProjects.length === 1 ? 'Website' : 'Websites'})
              </span>
            </span>
          ) : albums.length > 0 && projects.some(p => !p.album) ? (
            <span>Other Website Projects ({filteredProjects.length})</span>
          ) : (
            <span>All Website Projects ({filteredProjects.length})</span>
          )}
        </span>

        {selectedAlbum && (
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-xs font-mono text-[#00C853] hover:underline cursor-pointer"
          >
            ← View All
          </button>
        )}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-mono text-xs">
          No website projects found in this collection.
        </div>
      ) : (
        filteredProjects.map((project) => {
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
                    src={project.link || undefined} 
                    title={`Preview of ${project.title}`}
                    className="w-full h-full border-0 bg-white"
                  />
                ) : (
                  <img
                    src={project.image || undefined}
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
                
                {project.album && (
                  <div 
                    className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono text-white backdrop-blur-md"
                    style={{ background: 'rgba(0, 200, 83, 0.9)' }}
                  >
                    📁 {project.album}
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                  {previewingProject !== project.id && (
                    <button
                      onClick={() => setPreviewingProject(project.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
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
                  className="flex items-center gap-1.5 mt-4 text-xs font-mono uppercase tracking-wider transition-colors duration-200 cursor-pointer"
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
        })
      )}
    </div>
  );
}
