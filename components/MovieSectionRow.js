'use client';

import { useRef } from 'react';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MovieSectionRow({ section, movies, onToast }) {
  const rowRef = useRef(null);

  if (!section || !section.visible) return null;

  // Filter movies for this section (if sectionId matches or if movies are explicitly added to section)
  const sectionMovies = (movies || []).filter(
    (m) => String(m.sectionId) === String(section.id)
  );

  if (sectionMovies.length === 0) return null;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-6 px-4 sm:px-8 lg:px-16 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-l-4 border-[#e50914] pl-3">
          {section.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Movie Slider Row */}
      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
      >
        {sectionMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onToast={onToast} />
        ))}
      </div>
    </div>
  );
}
