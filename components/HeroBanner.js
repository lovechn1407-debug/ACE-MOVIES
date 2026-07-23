'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Share2, Star, Clock, Globe, Film } from 'lucide-react';

export default function HeroBanner({ movie, onToast }) {
  const [copied, setCopied] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  if (!movie) return null;

  const movieUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/movie/${movie.id}` 
    : `/movie/${movie.id}`;

  const handleShare = () => {
    navigator.clipboard.writeText(movieUrl);
    setCopied(true);
    if (onToast) onToast('Movie direct link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const backdropSrc = !backdropError && movie.backdrop 
    ? movie.backdrop 
    : (!posterError && movie.poster ? movie.poster : null);

  return (
    <div className="relative w-full min-h-[75vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center pt-28 pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#08080c]">
      
      {/* Background Cover Backdrop with Overlays */}
      {backdropSrc && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform transition-transform duration-1000 opacity-40"
          style={{ backgroundImage: `url(${backdropSrc})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/80 to-transparent w-full md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Main Grid Content */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Title, Metadata, Description & Action Buttons */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5 text-left">
          
          {/* Top 1 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914] border border-red-400/40 text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase shadow-xl shadow-red-900/60">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            TOP #1 FEATURED MOVIE
          </div>

          {/* Movie Logo or Title */}
          {movie.logo ? (
            <div className="max-w-md py-1">
              <img 
                src={movie.logo} 
                alt={movie.title} 
                className="max-h-24 sm:max-h-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)]"
              />
            </div>
          ) : (
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
              {movie.title}
            </h1>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-medium">
            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 sm:py-1 rounded-lg font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {movie.rating || '8.5'}
            </span>
            <span className="px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/20 bg-white/5 text-gray-200">
              {movie.releaseYear || '2024'}
            </span>
            {movie.runtime && (
              <span className="flex items-center gap-1 text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 sm:py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {movie.runtime}
              </span>
            )}
            {movie.languages && (
              <span className="flex items-center gap-1 text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 sm:py-1 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {movie.languages}
              </span>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {movie.genres.map((genre, idx) => (
                <span 
                  key={idx} 
                  className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-md bg-white/10 text-gray-200 backdrop-blur-sm border border-white/15 font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Overview Description */}
          <p className="text-xs sm:text-sm lg:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow max-w-2xl">
            {movie.description}
          </p>

          {/* Single Line Action Buttons (Play & Share only) */}
          <div className="flex items-center gap-3 pt-3 flex-row w-full sm:w-auto">
            <Link
              href={`/movie/${movie.id}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-xl bg-[#e50914] hover:bg-[#f6121d] text-white font-bold text-xs sm:text-sm transition-all transform hover:scale-105 shadow-xl shadow-red-900/60 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Click to Play</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white backdrop-blur-md border border-white/15 transition-all text-xs sm:text-sm font-semibold whitespace-nowrap"
              title="Share direct link"
            >
              <Share2 className="w-4 h-4 text-[#e50914]" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Featured Movie Poster Card (Hidden on Mobile & Tablet, visible only on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-4 justify-end">
          <div className="relative group w-64 lg:w-72 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#12131a] transform transition-transform duration-500 hover:scale-105">
            {movie.poster && !posterError ? (
              <img
                src={movie.poster}
                alt={movie.title}
                onError={() => setPosterError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-900 text-gray-400 space-y-3">
                <Film className="w-12 h-12 text-[#e50914]" />
                <span className="text-sm font-bold text-white">{movie.title}</span>
                <span className="text-xs text-gray-400">Featured Poster</span>
              </div>
            )}

            {/* Poster Tag */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {movie.rating || '8.5'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
