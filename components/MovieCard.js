'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Star, Share2 } from 'lucide-react';

export default function MovieCard({ movie, onToast }) {
  const [copied, setCopied] = useState(false);

  if (!movie) return null;

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/movie/${movie.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (onToast) onToast(`Copied share link for "${movie.title}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex-none w-44 sm:w-56 rounded-xl overflow-hidden bg-[#12131a] border border-white/10 movie-card-hover select-none">
      <Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-900 text-gray-400">
            <span className="text-xs font-semibold">{movie.title}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          <div className="flex justify-end">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/60 hover:bg-[#e50914] text-white border border-white/20 transition-colors"
              title="Share Movie"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-red-900/60 transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>

          <div className="text-xs text-gray-300 space-y-1">
            <p className="font-semibold text-white truncate">{movie.title}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                {movie.rating || 'N/A'}
              </span>
              <span className="text-gray-400">{movie.releaseYear || ''}</span>
            </div>
          </div>
        </div>

        {/* Static Rating Tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          {movie.rating || 'N/A'}
        </div>
      </Link>

      {/* Card Info Below */}
      <div className="p-3">
        <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition-colors">
          {movie.title}
        </h3>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {movie.genres ? movie.genres.join(', ') : movie.releaseYear || 'Movie'}
        </p>
      </div>
    </div>
  );
}
