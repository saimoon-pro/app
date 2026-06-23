import { useState } from 'react';
import { Play, Clock, Filter } from 'lucide-react';

const categories = ['All', 'Commercial', 'Narrative', 'Motion Graphics', 'Music Video', 'Documentary', 'Reels & Shorts'];

const videos = [
  { id: '1', title: 'Luminex — Brand Film', category: 'Commercial', duration: '2:34', thumbnail: '/images/thumb-video-1.jpg', description: 'Premium brand film for smart lighting company' },
  { id: '2', title: 'City of Echoes — Short Film', category: 'Narrative', duration: '8:45', thumbnail: '/images/thumb-video-2.jpg', description: 'Atmospheric short film about urban solitude' },
  { id: '3', title: 'Neon Dreams — Music Video', category: 'Music Video', duration: '3:56', thumbnail: '/images/thumb-video-3.jpg', description: 'Abstract visual journey for electronic artist' },
  { id: '4', title: "The Maker's Hand — Documentary", category: 'Documentary', duration: '12:20', thumbnail: '/images/thumb-video-4.jpg', description: 'Craftsmanship documentary series' },
  { id: '5', title: 'Product Launch Reel', category: 'Reels & Shorts', duration: '0:45', thumbnail: '/images/thumb-video-5.jpg', description: 'High-energy product launch for tech startup' },
  { id: '6', title: 'Motion Typography Pack', category: 'Motion Graphics', duration: '1:23', thumbnail: '/images/thumb-video-6.jpg', description: 'Kinetic typography showcase' },
];

export default function VideoPanel() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const filtered = activeFilter === 'All'
    ? videos
    : videos.filter(v => v.category === activeFilter);

  return (
    <div className="flex flex-col gap-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter size={14} className="mr-1 self-center" style={{ color: '#5A7A6A' }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200"
            style={{
              background: activeFilter === cat ? '#00C853' : 'rgba(0, 200, 83, 0.06)',
              color: activeFilter === cat ? '#fff' : '#5A7A6A',
              border: `1px solid ${activeFilter === cat ? '#00C853' : 'rgba(0, 200, 83, 0.12)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((video, i) => (
          <div
            key={video.id}
            className="group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
            style={{
              aspectRatio: '16/9',
              animation: `stagger-fade-in 0.4s ease-out ${i * 0.06}s both`,
            }}
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-400"
              style={{ transform: hoveredVideo === video.id ? 'scale(1.03)' : 'scale(1)' }}
              loading="lazy"
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-3"
              style={{
                background: hoveredVideo === video.id
                  ? 'linear-gradient(to top, rgba(10, 26, 15, 0.85) 0%, rgba(10, 26, 15, 0.2) 60%, transparent 100%)'
                  : 'linear-gradient(to top, rgba(10, 26, 15, 0.5) 0%, transparent 50%)',
              }}
            >
              {/* Play Button */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  opacity: hoveredVideo === video.id ? 1 : 0,
                  transform: hoveredVideo === video.id ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    background: 'rgba(0, 200, 83, 0.9)',
                    boxShadow: '0 0 24px rgba(0, 200, 83, 0.4)',
                  }}
                >
                  <Play size={20} fill="white" color="white" />
                </div>
              </div>

              {/* Duration Badge */}
              <div
                className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ background: 'rgba(0, 0, 0, 0.6)', color: '#fff' }}
              >
                <Clock size={10} className="inline mr-1" />
                {video.duration}
              </div>

              {/* Title */}
              <div style={{ opacity: hoveredVideo === video.id ? 1 : 0.9 }}>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider mb-1"
                  style={{ background: 'rgba(0, 200, 83, 0.2)', color: '#00C853' }}
                >
                  {video.category}
                </span>
                <h4 className="font-display font-medium text-sm text-white">{video.title}</h4>
                <p
                  className="text-xs mt-0.5 transition-all duration-300"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    opacity: hoveredVideo === video.id ? 1 : 0,
                    maxHeight: hoveredVideo === video.id ? 40 : 0,
                    overflow: 'hidden',
                  }}
                >
                  {video.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
