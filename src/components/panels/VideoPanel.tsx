import { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Clock, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import AlbumStrip, { type AlbumData } from '@/components/ui/AlbumStrip';

// Helper to extract YouTube ID
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Brand SVG Icons
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
    </svg>
  );
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
        album: c.album || '',
        videoFilter: c.videoFilter || c.category || '',
      };
    });
  }, [content]);

  // Dynamically extract all unique albums from the videos
  const albums: AlbumData[] = useMemo(() => {
    const map: Record<string, { count: number; thumbnails: string[] }> = {};
    videos.forEach(v => {
      if (v.album && v.album.trim()) {
        const name = v.album.trim();
        if (!map[name]) {
          map[name] = { count: 0, thumbnails: [] };
        }
        map[name].count += 1;
        if (v.thumbnail) {
          map[name].thumbnails.push(v.thumbnail);
        }
      }
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      thumbnails: data.thumbnails,
    }));
  }, [videos]);

  // Dynamically extract all video filters (from Google Sheet Video Filter column)
  const categories = useMemo(() => {
    const filters = new Set<string>();

    // Add popular default filters from Google Sheet data validation options
    ['Motion Graphics', 'Promotional Videos', 'Documentary', 'TVC & OVC', 'AI Contents'].forEach(df => filters.add(df));

    // Add all filters present in live video data
    videos.forEach(v => {
      const f = (v.videoFilter || v.category || '').trim();
      if (f && f.toLowerCase() !== 'all' && f.toLowerCase() !== 'general' && f.toLowerCase() !== 'youtube') {
        filters.add(f);
      }
    });

    return ['All', ...Array.from(filters)];
  }, [videos]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<typeof videos[0] | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const setBackOverride = useStore((s) => s.setBackOverride);

  // Reset description collapse when video changes
  useEffect(() => {
    setShowFullDescription(false);
  }, [playingVideo]);

  // Dynamic filter for albums & video filters
  const filtered = useMemo(() => {
    let list = videos;

    // Filter by Album if selected
    if (selectedAlbum) {
      list = list.filter(v => (v.album || '').trim().toLowerCase() === selectedAlbum.trim().toLowerCase());
    } else if (albums.length > 0 && activeFilter === 'All') {
      // When no album is selected and no category filter, show unassigned videos if any
      const unassigned = list.filter(v => !v.album || !v.album.trim());
      if (unassigned.length > 0) {
        list = unassigned;
      }
    }

    // Filter by Video Filter / Category
    if (activeFilter !== 'All') {
      const filterLower = activeFilter.trim().toLowerCase();
      list = list.filter(v => {
        const cat = (v.category || '').toLowerCase();
        const vf = (v.videoFilter || '').toLowerCase();
        const title = (v.title || '').toLowerCase();
        const desc = (v.description || '').toLowerCase();
        return vf === filterLower || cat === filterLower || vf.includes(filterLower) || cat.includes(filterLower) || title.includes(filterLower) || desc.includes(filterLower);
      });
    }

    return list;
  }, [videos, selectedAlbum, activeFilter, albums.length]);

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

  // WhatsApp & LinkedIn Connect URLs
  const whatsappUrl = "https://wa.me/8801760624753?text=Hello%20Muhammad%20Saimoon%2C%20I%20recently%20viewed%20your%20portfolio%20and%20was%20very%20impressed%20by%20your%20work.%20I%20am%20interested%20in%20your%20services%20and%20would%20love%20to%20discuss%20a%20potential%20collaboration";
  const linkedinUrl = "https://www.linkedin.com/in/saimoonhassan/";

  const isLongDescription = Boolean(playingVideo?.description && playingVideo.description.length > 120);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter size={14} className="mr-1 self-center" style={{ color: '#5A7A6A' }} />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer"
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

      {/* Dynamic Album Carousel Strip (Shown whenever albums exist) */}
      <AlbumStrip
        albums={albums}
        selectedAlbum={selectedAlbum}
        onSelectAlbum={(name) => setSelectedAlbum(name)}
        accentColor="#1976d2"
        itemLabel="Videos"
      />

      {/* Video Player Section */}
      {playingVideo && (
        <div 
          ref={playerRef} 
          className="w-full flex flex-col gap-4 rounded-xl overflow-hidden p-4 transition-all duration-500 shadow-xl"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(25, 118, 210, 0.25)' }}
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
                <a href={playingVideo.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm mt-2">
                  Watch externally
                </a>
              </div>
            )}
            
            {/* Close Button */}
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black/95 text-white transition-all z-10 cursor-pointer shadow-lg"
              title="Close Player"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 px-2 mt-2">
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              {playingVideo.title}
            </h2>
            <div className="flex items-center gap-4 text-sm mt-1">
               <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider font-semibold"
                  style={{ background: 'rgba(25, 118, 210, 0.15)', color: '#1976d2' }}
                >
                  {playingVideo.category}
               </span>
               {playingVideo.album && (
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider"
                  style={{ background: 'rgba(0, 200, 83, 0.12)', color: '#00C853' }}
                >
                  📁 {playingVideo.album}
                </span>
               )}
               <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <Clock size={14} />
                  {playingVideo.duration}
               </span>
            </div>
            
            {/* Collapsible Video Description Section */}
            {playingVideo.description && (
              <div 
                className="mt-3 p-3.5 sm:p-4 rounded-xl text-sm leading-relaxed transition-all duration-300 relative" 
                style={{ 
                  background: 'rgba(25, 118, 210, 0.05)', 
                  border: '1px solid rgba(25, 118, 210, 0.15)',
                  borderLeft: '4px solid #1976d2' 
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#1976d2]">
                    Description & Overview
                  </span>
                  {isLongDescription && (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1976d2] hover:text-[#0d47a1] dark:hover:text-[#64b5f6] bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <span>{showFullDescription ? 'See Less' : 'See More'}</span>
                      {showFullDescription ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  )}
                </div>

                <div 
                  className={`text-gray-800 dark:text-gray-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed transition-all duration-300 ${
                    !showFullDescription && isLongDescription 
                      ? 'line-clamp-2 max-h-12 overflow-hidden' 
                      : 'max-h-[600px] overflow-y-auto pr-1'
                  }`}
                >
                  {playingVideo.description}
                </div>

                {isLongDescription && !showFullDescription && (
                  <div className="mt-2 pt-1.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowFullDescription(true)}
                      className="text-xs font-semibold text-[#1976d2] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read full description (See More)</span>
                      <ChevronDown size={13} />
                    </button>
                  </div>
                )}
                
                {isLongDescription && showFullDescription && (
                  <div className="mt-2 pt-1.5 flex items-center border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowFullDescription(false)}
                      className="text-xs font-semibold text-[#1976d2] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Show less (See Less)</span>
                      <ChevronUp size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Direct Connect CTA Actions at the bottom of the video player */}
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#5A7A6A]">
                  Direct Collaboration
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Interested in video editing or creative services?
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                {/* WhatsApp Connect Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                  }}
                  title="Connect with Muhammad Saimoon on WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span className="font-semibold tracking-wide">WhatsApp</span>
                </a>

                {/* LinkedIn Connect Button */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
                    boxShadow: '0 4px 14px rgba(10, 102, 194, 0.3)',
                  }}
                  title="Connect with Muhammad Saimoon on LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 fill-current shrink-0" />
                  <span className="font-semibold tracking-wide">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Header / Active Album Status */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {selectedAlbum ? (
            <span className="flex items-center gap-2 text-[#1976d2]">
              <span>📁 {selectedAlbum}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                ({filtered.length} {filtered.length === 1 ? 'Video' : 'Videos'})
              </span>
            </span>
          ) : albums.length > 0 && videos.some(v => !v.album) ? (
            <span>Other Video Projects ({filtered.length})</span>
          ) : (
            <span>All Video Projects ({filtered.length})</span>
          )}
        </span>

        {selectedAlbum && (
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-xs font-mono text-[#1976d2] hover:underline cursor-pointer"
          >
            ← View All
          </button>
        )}
      </div>

      {/* Video Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-mono text-xs">
          No videos found in this category or album.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
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
                src={video.thumbnail || undefined}
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

                {/* Top badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {video.album && (
                    <div
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                      style={{ background: 'rgba(0, 200, 83, 0.85)', color: '#fff' }}
                    >
                      {video.album}
                    </div>
                  )}
                  <div
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{ background: 'rgba(0, 0, 0, 0.6)', color: '#fff' }}
                  >
                    <Clock size={10} className="inline mr-1" />
                    {video.duration}
                  </div>
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
      )}
    </div>
  );
}
