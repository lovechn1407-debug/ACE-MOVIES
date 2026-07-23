'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Share2, Info, Star, Clock, Globe } from 'lucide-react';

export default function HeroBanner({ movie, onToast }) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-end pb-16 pt-28 px-4 sm:px-8 lg:px-16 overflow-hidden bg-black">
      {/* Background Cover Backdrop */}
      {movie.backdrop && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform transition-transform duration-1000"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          {/* Multi-layered dark Netflix gradients for seamless readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/70 to-transparent w-full md:w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Content Overlay Container */}
      <div className="relative z-20 max-w-2xl text-left space-y-5">
        
        {/* Top 1 Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/90 border border-red-500/30 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-red-900/50">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          TOP #1 FEATURED MOVIE
        </div>

        {/* Separate Movie Logo / Title */}
        {movie.logo ? (
          <div className="max-w-md py-2">
            <img 
              src={movie.logo} 
              alt={movie.title} 
              className="max-h-28 sm:max-h-36 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
            />
          </div>
        ) : (
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            {movie.title}
          </h1>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
          <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md font-semibold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {movie.rating || '8.5'}
          </span>
          <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-gray-200">
            {movie.releaseYear || '2024'}
          </span>
          {movie.runtime && (
            <span className="flex items-center gap-1 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {movie.runtime}
            </span>
          )}
          {movie.languages && (
            <span className="flex items-center gap-1 text-gray-300">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              {movie.languages}
            </span>
          )}
        </div>

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {movie.genres.map((genre, idx) => (
              <span 
                key={idx} 
                className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-gray-200 backdrop-blur-sm border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Movie Description */}
        <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
          {movie.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-3 px-7 py-3.5 rounded-xl bg-[#e50914] hover:bg-[#f6121d] text-white font-bold text-base transition-all transform hover:scale-105 shadow-xl shadow-red-900/50"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Click to Play</span>
          </Link>

          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base backdrop-blur-md border border-white/20 transition-all"
          >
            <Info className="w-5 h-5 text-gray-200" />
            <span>More Info</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white backdrop-blur-md border border-white/15 transition-all"
            title="Share direct link"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{copied ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
