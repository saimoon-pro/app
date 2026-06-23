import { useState, useMemo } from 'react';
import { Layers, Image, Layout } from 'lucide-react';
import { useStore } from '@/store/useStore';

type Tab = 'uiux' | 'illustration' | 'post';

const tabs: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
  { id: 'uiux', label: 'UI/UX Design', Icon: Layout },
  { id: 'illustration', label: 'Illustration', Icon: Image },
  { id: 'post', label: 'Post Design', Icon: Layers },
];

export default function DesignPanel() {
  const content = useStore((s) => s.content);
  
  const uiuxProjects = useMemo(() => {
    return content.filter(c => c.contentType === 'UIUX Design').map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle || c.category,
      description: c.description,
      image: c.thumbnailUrl || '/images/uiux-case-1.jpg',
      tags: c.tags.length > 0 ? c.tags : ['UIUX'],
      result: 'Delivered successfully',
    }));
  }, [content]);

  const illustrations = useMemo(() => {
    return content.filter(c => c.contentType === 'Illustration').map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      image: c.thumbnailUrl || '/images/illustration-1.jpg',
    }));
  }, [content]);

  const postDesigns = useMemo(() => {
    return content.filter(c => c.contentType === 'Post Design').map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      image: c.thumbnailUrl || '/images/post-design-1.jpg',
    }));
  }, [content]);

  const [activeTab, setActiveTab] = useState<Tab>('uiux');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-navigation Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(0, 200, 83, 0.04)' }}>
        {tabs.map(tab => {
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300"
              style={{
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#00C853' : '#5A7A6A',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* UI/UX Tab */}
      {activeTab === 'uiux' && (
        <div className="flex flex-col gap-6">
          {uiuxProjects.map((project) => (
            <div
              key={project.id}
              className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setLightboxImage(project.image)}
              onMouseEnter={() => setHoveredItem(project.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredItem === project.id ? 'scale(1.04)' : 'scale(1)' }}
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider"
                      style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h4 className="font-display font-semibold text-base" style={{ color: '#0A1A0F' }}>{project.title}</h4>
                <p className="text-xs mt-1" style={{ color: '#5A7A6A' }}>{project.subtitle}</p>
                <p className="text-sm mt-3" style={{ color: '#5A7A6A', lineHeight: 1.6 }}>{project.description}</p>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(0, 200, 83, 0.08)', color: '#00C853' }}
                >
                  <span style={{ color: '#00C853' }}>Result:</span> {project.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Illustration Tab */}
      {activeTab === 'illustration' && (
        <div className="grid grid-cols-2 gap-4">
          {illustrations.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              onClick={() => setLightboxImage(item.image)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ aspectRatio: '1/1' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredItem === item.id ? 'scale(1.05)' : 'scale(1)' }}
                  loading="lazy"
                />
              </div>
              <div
                className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300"
                style={{
                  background: hoveredItem === item.id
                    ? 'linear-gradient(to top, rgba(10, 26, 15, 0.8), transparent 60%)'
                    : 'linear-gradient(to top, rgba(10, 26, 15, 0.3), transparent)',
                }}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>{item.category}</span>
                <h4 className="font-display font-medium text-sm text-white mt-0.5">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Design Tab */}
      {activeTab === 'post' && (
        <div className="flex flex-col gap-4">
          {postDesigns.map((item) => (
            <div
              key={item.id}
              className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setLightboxImage(item.image)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: hoveredItem === item.id ? 'scale(1.03)' : 'scale(1)' }}
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300"
                  style={{
                    background: hoveredItem === item.id
                      ? 'linear-gradient(to top, rgba(10, 26, 15, 0.8), transparent 60%)'
                      : 'linear-gradient(to top, rgba(10, 26, 15, 0.2), transparent)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>{item.category}</span>
                  <h4 className="font-display font-medium text-sm text-white mt-0.5">{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(10, 26, 15, 0.9)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt=""
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            style={{ boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)' }}
          />
        </div>
      )}
    </div>
  );
}
