import { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Clock, Filter, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';

// Helper to extract YouTube ID
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoPanel() {
  const content = useStore((s) => s.content);
  
  const videos = useMemo(() => {
    return content.filter(c => c.contentType === 'Video Editing').map(c => {
      const yId = getYouTubeId(c.videoUrl);
      return {
        id: c.id,
        title: c.title,
        category: c.category,
        duration: '0:00', // Default duration
        thumbnail: yId ? `https://img.youtube.com/vi/${yId}/hqdefault.jpg` : (c.thumbnailUrl || assetUrl('images/thumb-video-1.jpg')),
        description: c.description,
        videoUrl: c.videoUrl,
      };
    });
  }, [content]);

  const categories = useMemo(() => {
    const unique = [...new Set(
      videos.map(v => v.category).filter(c => Boolean(c) && c.toLowerCase() !== 'all')
    )];
    return ['All', ...unique];
  }, [videos]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<typeof videos[0] | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const setBackOverride = useStore((s) => s.setBackOverride);

  const filtered = activeFilter === 'All'
    ? videos
    : videos.filter(v => v.category === activeFilter);

  // Register back button override when video is playing
  useEffect(() => {
    if (playingVideo) {
      setBackOverride(() => {
        setPlayingVideo(null);
        return true; // handled
      });
    } else {
      setBackOverride(null);
    }
    return () => {
      setBackOverride(null);
    };
  }, [playingVideo, setBackOverride]);

  // Auto-open video requested from ORBIT AI chat
  useEffect(() => {
    const pendingId = sessionStorage.getItem('orbit_play_video');
    if (pendingId && videos.length > 0) {
      const target = videos.find(v => v.id === pendingId);
      if (target) {
        setPlayingVideo(target);
        sessionStorage.removeItem('orbit_play_video');
      }
    }
  }, [videos]);

  // Scroll to player when a new video is selected
  useEffect(() => {
    if (playingVideo && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playingVideo]);

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter size={14} className="mr-1 self-center" style={{ color: '#5A7A6A' }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200"
            style={{
              background: activeFilter === cat ? '#1976d2' : 'rgba(25, 118, 210, 0.06)',
              color: activeFilter === cat ? '#fff' : '#5A7A6A',
              border: `1px solid ${activeFilter === cat ? '#1976d2' : 'rgba(25, 118, 210, 0.12)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Player Section */}
      {playingVideo && (
        <div 
          ref={playerRef} 
          className="w-full flex flex-col gap-4 rounded-xl overflow-hidden p-4 transition-all duration-500"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(25, 118, 210, 0.2)' }}
        >
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9', background: '#000' }}>
            {getYouTubeId(playingVideo.videoUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(playingVideo.videoUrl)}?autoplay=1&color=white`}
                title={playingVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 gap-2">
                <Play size={48} className="opacity-50" />
                <p className="text-gray-400">Unable to load video</p>
                <a href={playingVideo.videoUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline text-sm mt-2">
                  Watch externally
                </a>
              </div>
            )}
            
            {/* Close Button */}
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all z-10"
              title="Close Player"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 px-2 mt-2">
            <h2 className="text-xl md:text-2xl font-bold font-display" style={{ color: '#000' }}>
              {playingVideo.title}
            </h2>
            <div className="flex items-center gap-4 text-sm mt-1">
               <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold"
                  style={{ background: 'rgba(25, 118, 210, 0.15)', color: '#64b5f6' }}
                >
                  {playingVideo.category}
               </span>
               <span className="flex items-center gap-1 text-gray-400">
                  <Clock size={14} />
                  {playingVideo.duration}
               </span>
            </div>
            
            <div 
              className="mt-3 p-4 rounded-lg text-sm leading-relaxed" 
              style={{ background: 'rgba(25, 118, 210, 0.05)', color: '#000', borderLeft: '3px solid #1976d2' }}
            >
              {playingVideo.description || 'No description available for this video.'}
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        {filtered.map((video, i) => (
          <div
            key={video.id}
            className="group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
            style={{
              aspectRatio: '16/9',
              animation: `stagger-fade-in 0.4s ease-out ${i * 0.06}s both`,
              border: playingVideo?.id === video.id ? '2px solid #1976d2' : '2px solid transparent',
            }}
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
            onClick={() => setPlayingVideo(video)}
          >
            <img
              src={video.thumbnail}
              alt={`${video.title} - Video Editing by Muhammad Saimoon Hassan`}
              className="w-full h-full object-cover transition-transform duration-400"
              style={{ transform: hoveredVideo === video.id ? 'scale(1.03)' : 'scale(1)' }}
              loading="lazy"
              decoding="async"
              width={320}
              height={180}
            />

            {/* Overlay */}
            <div
              className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-3"
              style={{
                background: hoveredVideo === video.id
                  ? 'linear-gradient(to top, rgba(13, 71, 161, 0.85) 0%, rgba(13, 71, 161, 0.2) 60%, transparent 100%)'
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
                    background: 'rgba(25, 118, 210, 0.9)',
                    boxShadow: '0 0 24px rgba(25, 118, 210, 0.4)',
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
                  style={{ background: 'rgba(25, 118, 210, 0.2)', color: '#64b5f6' }}
                >
                  {video.category}
                </span>
                <h4 className="font-display font-medium text-sm text-white">{video.title}</h4>
                <p
                  className="text-xs mt-0.5 transition-all duration-300"
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
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
