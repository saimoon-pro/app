import { useState, useMemo } from 'react';
import { Layers, Image, Layout } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import AlbumStrip, { type AlbumData } from '@/components/ui/AlbumStrip';

type Tab = 'uiux' | 'illustration' | 'post';

const tabs: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
  { id: 'uiux', label: 'UI/UX Design', Icon: Layout },
  { id: 'illustration', label: 'Illustration', Icon: Image },
  { id: 'post', label: 'Post Design', Icon: Layers },
];

export default function DesignPanel() {
  const content = useStore((s) => s.content);
  const [activeTab, setActiveTab] = useState<Tab>('uiux');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const uiuxProjects = useMemo(() => {
    return content.filter(c => 
      c.contentType === 'UIUX Design' || 
      (c.graphicsFilter && (c.graphicsFilter.toLowerCase().includes('ui') || c.graphicsFilter.toLowerCase().includes('ux')))
    ).map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle || c.graphicsFilter || c.category,
      description: c.description,
      image: c.thumbnailUrl || assetUrl('images/uiux-case-1.jpg'),
      tags: c.tags.length > 0 ? c.tags : ['UI UX'],
      result: 'Delivered successfully',
      album: c.album || '',
      graphicsFilter: c.graphicsFilter || '',
    }));
  }, [content]);

  const illustrations = useMemo(() => {
    return content.filter(c => 
      c.contentType === 'Illustration' || 
      (c.graphicsFilter && c.graphicsFilter.toLowerCase().includes('illustration'))
    ).map(c => ({
      id: c.id,
      title: c.title,
      category: c.graphicsFilter || c.category,
      image: c.thumbnailUrl || assetUrl('images/illustration-1.jpg'),
      album: c.album || '',
      graphicsFilter: c.graphicsFilter || '',
    }));
  }, [content]);

  const postDesigns = useMemo(() => {
    return content.filter(c => 
      c.contentType === 'Post Design' || 
      (c.graphicsFilter && (c.graphicsFilter.toLowerCase().includes('static') || c.graphicsFilter.toLowerCase().includes('post')))
    ).map(c => ({
      id: c.id,
      title: c.title,
      category: c.graphicsFilter || c.category,
      image: c.thumbnailUrl || assetUrl('images/post-design-1.jpg'),
      album: c.album || '',
      graphicsFilter: c.graphicsFilter || '',
    }));
  }, [content]);

  // Dynamic albums for current active tab
  const albums: AlbumData[] = useMemo(() => {
    const map: Record<string, { count: number; thumbnails: string[] }> = {};
    const items = activeTab === 'uiux' ? uiuxProjects : activeTab === 'illustration' ? illustrations : postDesigns;
    
    items.forEach(item => {
      if (item.album && item.album.trim()) {
        const name = item.album.trim();
        if (!map[name]) {
          map[name] = { count: 0, thumbnails: [] };
        }
        map[name].count += 1;
        if (item.image) {
          map[name].thumbnails.push(item.image);
        }
      }
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      thumbnails: data.thumbnails,
    }));
  }, [activeTab, uiuxProjects, illustrations, postDesigns]);

  // Tab specific filtered items
  const filteredUiux = useMemo(() => {
    let list = uiuxProjects;
    if (selectedAlbum) {
      list = list.filter(item => (item.album || '').trim().toLowerCase() === selectedAlbum.trim().toLowerCase());
    } else if (albums.length > 0) {
      const unassigned = list.filter(item => !item.album || !item.album.trim());
      if (unassigned.length > 0) list = unassigned;
    }
    return list;
  }, [uiuxProjects, selectedAlbum, albums.length]);

  const filteredIllustrations = useMemo(() => {
    let list = illustrations;
    if (selectedAlbum) {
      list = list.filter(item => (item.album || '').trim().toLowerCase() === selectedAlbum.trim().toLowerCase());
    } else if (albums.length > 0) {
      const unassigned = list.filter(item => !item.album || !item.album.trim());
      if (unassigned.length > 0) list = unassigned;
    }
    return list;
  }, [illustrations, selectedAlbum, albums.length]);

  const filteredPosts = useMemo(() => {
    let list = postDesigns;
    if (selectedAlbum) {
      list = list.filter(item => (item.album || '').trim().toLowerCase() === selectedAlbum.trim().toLowerCase());
    } else if (albums.length > 0) {
      const unassigned = list.filter(item => !item.album || !item.album.trim());
      if (unassigned.length > 0) list = unassigned;
    }
    return list;
  }, [postDesigns, selectedAlbum, albums.length]);

  const activeCount = activeTab === 'uiux' ? filteredUiux.length : activeTab === 'illustration' ? filteredIllustrations.length : filteredPosts.length;
  const rawList = activeTab === 'uiux' ? uiuxProjects : activeTab === 'illustration' ? illustrations : postDesigns;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Sub-navigation Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(0, 200, 83, 0.04)' }}>
        {tabs.map(tab => {
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedAlbum(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer"
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

      {/* Dynamic Album Carousel Strip (if albums exist for this category) */}
      <AlbumStrip
        albums={albums}
        selectedAlbum={selectedAlbum}
        onSelectAlbum={(name) => setSelectedAlbum(name)}
        accentColor="#00C853"
        itemLabel="Designs"
      />

      {/* Album Filter Indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {selectedAlbum ? (
            <span className="flex items-center gap-2 text-[#00C853]">
              <span>📁 {selectedAlbum}</span>
              <span className="text-[11px] text-gray-500 font-normal">
                ({activeCount} {activeCount === 1 ? 'Design' : 'Designs'})
              </span>
            </span>
          ) : albums.length > 0 && rawList.some(i => !i.album) ? (
            <span>Other {activeTab === 'uiux' ? 'UI/UX' : activeTab === 'illustration' ? 'Illustrations' : 'Posts'} ({activeCount})</span>
          ) : (
            <span>All {activeTab === 'uiux' ? 'UI/UX Works' : activeTab === 'illustration' ? 'Illustrations' : 'Post Designs'} ({activeCount})</span>
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

      {/* UI/UX Tab */}
      {activeTab === 'uiux' && (
        <div className="flex flex-col gap-6">
          {filteredUiux.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">
              No UI/UX designs found in this collection.
            </div>
          ) : (
            filteredUiux.map((project) => (
              <div
                key={project.id}
                className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setLightboxImage(project.image)}
                onMouseEnter={() => setHoveredItem(project.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  <img
                    src={project.image || undefined}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ transform: hoveredItem === project.id ? 'scale(1.04)' : 'scale(1)' }}
                    loading="lazy"
                  />
                  {project.album && (
                    <div 
                      className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono text-white"
                      style={{ background: 'rgba(0, 200, 83, 0.9)' }}
                    >
                      📁 {project.album}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.map((tag) => (
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
            ))
          )}
        </div>
      )}

      {/* Illustration Tab */}
      {activeTab === 'illustration' && (
        <div className="grid grid-cols-2 gap-4">
          {filteredIllustrations.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-gray-500 font-mono text-xs">
              No illustrations found in this collection.
            </div>
          ) : (
            filteredIllustrations.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                onClick={() => setLightboxImage(item.image)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={{ aspectRatio: '1/1' }}>
                  <img
                    src={item.image || undefined}
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
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>
                    {item.album ? `📁 ${item.album}` : item.category}
                  </span>
                  <h4 className="font-display font-medium text-sm text-white mt-0.5">{item.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Post Design Tab */}
      {activeTab === 'post' && (
        <div className="flex flex-col gap-4">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">
              No post designs found in this collection.
            </div>
          ) : (
            filteredPosts.map((item) => (
              <div
                key={item.id}
                className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setLightboxImage(item.image)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={item.image || undefined}
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
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: '#00C853' }}>
                      {item.album ? `📁 ${item.album}` : item.category}
                    </span>
                    <h4 className="font-display font-medium text-sm text-white mt-0.5">{item.title}</h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(10, 26, 15, 0.9)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage || undefined}
            alt=""
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            style={{ boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)' }}
          />
        </div>
      )}
    </div>
  );
}
