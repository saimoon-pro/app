import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Folder, Sparkles, Check } from 'lucide-react';

export interface AlbumData {
  name: string;
  count: number;
  thumbnails: string[];
}

interface AlbumStripProps {
  albums: AlbumData[];
  selectedAlbum: string | null;
  onSelectAlbum: (albumName: string | null) => void;
  accentColor?: string; // e.g. '#1976d2' for video, '#00C853' for green
  itemLabel?: string; // e.g. 'Videos' or 'Projects'
}

// Intelligent Flag / Icon Helper based on album name
export function getAlbumBadge(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('bd') || lower.includes('bangladesh')) {
    return { flag: '🇧🇩', label: 'Bangladesh' };
  }
  if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('britain') || lower.includes('london')) {
    return { flag: '🇬🇧', label: 'UK' };
  }
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('america') || lower.includes('us client')) {
    return { flag: '🇺🇸', label: 'USA' };
  }
  if (lower.includes('canada')) {
    return { flag: '🇨🇦', label: 'Canada' };
  }
  if (lower.includes('germany') || lower.includes('deutschland')) {
    return { flag: '🇩🇪', label: 'Germany' };
  }
  if (lower.includes('pakistan') && lower.includes('india')) {
    return { flag: '🇮🇳 🇵🇰', label: 'South Asia' };
  }
  if (lower.includes('india')) {
    return { flag: '🇮🇳', label: 'India' };
  }
  if (lower.includes('pakistan')) {
    return { flag: '🇵🇰', label: 'Pakistan' };
  }
  if (lower.includes('australia')) {
    return { flag: '🇦🇺', label: 'Australia' };
  }
  if (lower.includes('dubai') || lower.includes('uae')) {
    return { flag: '🇦🇪', label: 'UAE' };
  }
  if (lower.includes('portfolio') || lower.includes('showcase') || lower.includes('featured')) {
    return { flag: '💼', label: 'Showcase' };
  }
  return { flag: '📁', label: 'Collection' };
}

// Engaging Visual Collage of Album Items
function AlbumThumbnailCollage({ thumbnails, name }: { thumbnails: string[]; name: string }) {
  const validThumbs = thumbnails.filter((t) => typeof t === 'string' && t.trim().length > 0);
  const count = validThumbs.length;

  if (count === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
        <Folder size={32} className="text-white/30" />
      </div>
    );
  }

  // 1 thumbnail: Full cover
  if (count === 1) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-black">
        <img
          src={validThumbs[0]}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
    );
  }

  // 2 thumbnails: Split vertical
  if (count === 2) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-black/40 overflow-hidden">
        <img
          src={validThumbs[0]}
          alt={`${name} 1`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <img
          src={validThumbs[1]}
          alt={`${name} 2`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  // 3 thumbnails: 1 Large on Left, 2 stacked on Right
  if (count === 3) {
    return (
      <div className="w-full h-full grid grid-cols-3 gap-0.5 bg-black/40 overflow-hidden">
        <div className="col-span-2 h-full overflow-hidden">
          <img
            src={validThumbs[0]}
            alt={`${name} main`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="grid grid-rows-2 gap-0.5 h-full overflow-hidden">
          <img
            src={validThumbs[1]}
            alt={`${name} 2`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <img
            src={validThumbs[2]}
            alt={`${name} 3`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // 4 or more thumbnails: 2x2 Grid with +N badge
  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 bg-black/40 overflow-hidden relative">
      <img
        src={validThumbs[0]}
        alt={`${name} 1`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <img
        src={validThumbs[1]}
        alt={`${name} 2`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <img
        src={validThumbs[2]}
        alt={`${name} 3`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={validThumbs[3]}
          alt={`${name} 4`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {count > 4 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-mono text-[11px] font-bold tracking-wider">
              +{count - 3}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlbumStrip({
  albums,
  selectedAlbum,
  onSelectAlbum,
  accentColor = '#1976d2',
  itemLabel = 'Videos',
}: AlbumStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // If no albums exist in this section, hide the strip completely
  if (!albums || albums.length === 0) {
    return null;
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [albums]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 my-1">
      {/* Album Strip Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>Client & Portfolio Albums</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 font-normal text-gray-500 dark:text-gray-400">
              {albums.length} {albums.length === 1 ? 'Album' : 'Albums'}
            </span>
          </span>
        </div>

        {/* Scroll Arrows & Reset */}
        <div className="flex items-center gap-1.5">
          {selectedAlbum && (
            <button
              onClick={() => onSelectAlbum(null)}
              className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all cursor-pointer mr-1"
              style={{
                background: 'rgba(25, 118, 210, 0.1)',
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              Clear Filter ✕
            </button>
          )}

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Projects Card */}
        <div
          onClick={() => onSelectAlbum(null)}
          className={`group flex-shrink-0 w-[160px] sm:w-[180px] h-[145px] sm:h-[155px] rounded-xl overflow-hidden relative cursor-pointer transition-all duration-300 ${
            selectedAlbum === null
              ? 'ring-2 scale-[1.02] shadow-lg'
              : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: selectedAlbum === null ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.12)',
            boxShadow: selectedAlbum === null ? `0 0 16px ${accentColor}40` : 'none',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90 flex flex-col justify-between p-3.5">
            <div className="flex items-center justify-between">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${accentColor}25`, color: accentColor }}
              >
                <Sparkles size={16} />
              </div>
              {selectedAlbum === null && (
                <span 
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-0.5"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  <Check size={10} /> Active
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-0.5">
                Overview
              </span>
              <h4 className="font-display font-bold text-sm text-white leading-tight">
                All Works
              </h4>
              <p className="text-[10px] text-gray-400 font-mono mt-1">
                Browse complete portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Album Cards */}
        {albums.map((album) => {
          const isSelected = selectedAlbum === album.name;
          const badge = getAlbumBadge(album.name);

          return (
            <div
              key={album.name}
              onClick={() => onSelectAlbum(isSelected ? null : album.name)}
              className={`group flex-shrink-0 w-[220px] sm:w-[245px] h-[145px] sm:h-[155px] rounded-xl overflow-hidden relative cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'ring-2 scale-[1.02] shadow-xl'
                  : 'hover:scale-[1.02] hover:shadow-lg opacity-95 hover:opacity-100'
              }`}
              style={{
                border: isSelected ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isSelected ? `0 0 20px ${accentColor}50` : '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {/* Thumbnail Collage Preview */}
              <div className="absolute inset-0">
                <AlbumThumbnailCollage thumbnails={album.thumbnails} name={album.name} />
              </div>

              {/* Dark Gradient Overlay & Info */}
              <div 
                className="absolute inset-0 flex flex-col justify-between p-3 transition-colors duration-300"
                style={{
                  background: isSelected
                    ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
                }}
              >
                {/* Top Row: Country Badge + Item Count */}
                <div className="flex items-center justify-between gap-1 z-10">
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider backdrop-blur-md flex items-center gap-1 shadow"
                    style={{
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span>{badge.flag}</span>
                    <span className="uppercase text-[9px]">{badge.label}</span>
                  </span>

                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider backdrop-blur-md shadow"
                    style={{
                      background: isSelected ? accentColor : 'rgba(0, 0, 0, 0.65)',
                      color: '#fff',
                      border: isSelected ? `1px solid ${accentColor}` : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {album.count} {album.count === 1 ? itemLabel.replace(/s$/, '') : itemLabel}
                  </span>
                </div>

                {/* Bottom Row: Album Name & Status */}
                <div className="z-10">
                  <h4 className="font-display font-bold text-sm sm:text-base text-white leading-snug drop-shadow-md group-hover:text-[#90caf9] transition-colors">
                    {album.name}
                  </h4>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
                      {isSelected ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <Check size={11} /> Viewing Collection
                        </span>
                      ) : (
                        <span>Click to open collection →</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
