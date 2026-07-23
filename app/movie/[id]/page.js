'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastNotification from '@/components/ToastNotification';
import { 
  Play, Share2, Star, Clock, Globe, ArrowLeft, ExternalLink, 
  Film, Cloud, HardDrive, Shield 
} from 'lucide-react';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlayUrl, setActivePlayUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (!params?.id) return;
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/movies/${encodeURIComponent(params.id)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Movie not found');
        const data = await res.json();
        setMovie(data.movie);
        if (data.movie && data.movie.playLink) {
          setActivePlayUrl(data.movie.playLink);
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [params?.id]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('Direct movie link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to ensure URLs always have a valid protocol (https://)
  const formatLinkUrl = (url) => {
    if (!url || url === '#' || url.trim().length === 0) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleOpenLink = (e, url) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetUrl = formatLinkUrl(url);
    if (!targetUrl) {
      showToast('No valid URL configured for this link.');
      return;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading Movie Details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 pt-32">
          <Film className="w-16 h-16 text-[#e50914]" />
          <h1 className="text-3xl font-bold">Movie Not Found</h1>
          <p className="text-gray-400">The movie you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e50914] text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Action buttons configured for this movie
  const allButtons = [];
  if (movie.playLink) {
    allButtons.push({ label: 'Primary Link (Default)', url: movie.playLink, isPrimary: true });
  }
  if (Array.isArray(movie.extraButtons)) {
    movie.extraButtons.forEach((btn) => {
      if (btn.url) {
        allButtons.push({ label: btn.label || 'Watch Server', url: btn.url, isPrimary: false });
      }
    });
  }

  const backdropSrc = movie.backdrop || movie.poster || null;
  const primaryUrl = movie.playLink || activePlayUrl || '';
  const cardButtonType = movie.cardButtonType || 'play'; // 'play' | 'terabox' | 'gdrive' | 'mega'

  return (
    <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
      <Navbar />

      <main className="flex-1 pt-20 pb-16 space-y-8">
        
        {/* 16:9 Landscape Image Card - Full Screen Width, Edge-to-Edge, 0 Border Radius */}
        <div className="w-full relative bg-black overflow-hidden aspect-video max-h-[70vh] group">
          {backdropSrc ? (
            <img
              src={backdropSrc}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Film className="w-16 h-16 text-[#e50914]" />
              <span className="font-bold text-lg text-white">{movie.title}</span>
            </div>
          )}

          {/* Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

          {/* Back & Title Info on top left of image card */}
          <div className="absolute top-4 left-4 sm:left-8 right-4 z-20 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-200 hover:text-white bg-black/60 hover:bg-black/80 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/15 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs font-bold text-gray-200 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/15 truncate max-w-[200px] sm:max-w-xs">
              {movie.title}
            </span>
          </div>

          {/* Center Custom Overlay Button (50+ Radius / rounded-full) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            {cardButtonType === 'terabox' ? (
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, primaryUrl)}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-blue-600/70 transition-all transform hover:scale-105 border border-blue-400/50 cursor-pointer"
              >
                <Cloud className="w-5 h-5 fill-white" />
                <span>Open with TeraBox</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </button>
            ) : cardButtonType === 'gdrive' ? (
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, primaryUrl)}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0f9d58] hover:bg-[#0b8043] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-green-600/70 transition-all transform hover:scale-105 border border-green-400/50 cursor-pointer"
              >
                <HardDrive className="w-5 h-5" />
                <span>Open with Google Drive</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </button>
            ) : cardButtonType === 'mega' ? (
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, primaryUrl)}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#d9272e] hover:bg-[#b81d23] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-red-600/70 transition-all transform hover:scale-105 border border-red-400/50 cursor-pointer"
              >
                <Shield className="w-5 h-5" />
                <span>Open with Mega</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </button>
            ) : (
              /* Default Red Play Icon Circle (50+ Radius) */
              <button
                type="button"
                onClick={(e) => handleOpenLink(e, primaryUrl)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e50914] hover:bg-[#f6121d] text-white flex items-center justify-center shadow-2xl shadow-red-900/80 transition-all transform hover:scale-110 border-2 border-white/20 cursor-pointer"
                title="Click to Play"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Content Container - Clean & Free of Container Background Boxes */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Details Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Metadata Header */}
            <div className="space-y-3">
              {movie.logo ? (
                <img
                  src={movie.logo}
                  alt={movie.title}
                  className="max-h-24 object-contain py-1 drop-shadow-2xl"
                />
              ) : (
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {movie.rating || '8.5'}
                </span>
                <span className="text-gray-400">•</span>
                <span>{movie.releaseYear || '2024'}</span>
                {movie.runtime && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {movie.runtime}
                    </span>
                  </>
                )}
                {movie.languages && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      {movie.languages}
                    </span>
                  </>
                )}
              </div>

              {/* Share Direct Link Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#e50914]" />
                  <span>{copied ? 'Link Copied!' : 'Share Direct Link'}</span>
                </button>
              </div>
            </div>

            {/* Custom Streaming & Download Server Link Buttons */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-[#e50914] fill-[#e50914]" />
                Streaming & Download Links
              </h3>
              
              {allButtons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleOpenLink(e, btn.url)}
                      className={`flex items-center justify-between p-4 rounded-2xl text-sm font-semibold transition-all transform hover:scale-[1.02] cursor-pointer text-left ${
                        btn.isPrimary
                          ? 'bg-[#e50914] text-white shadow-xl shadow-red-900/40 hover:bg-[#f6121d]'
                          : 'bg-white/10 text-gray-200 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 fill-current" />
                        <span>{btn.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-gray-300 uppercase font-bold">
                          {btn.isPrimary ? 'Primary' : 'Mirror'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No stream links configured for this movie yet.</p>
              )}
            </div>

            {/* Synopsis Section */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-lg font-bold text-white">Movie Synopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{movie.description}</p>

              {movie.cast && (
                <div className="pt-3 space-y-1">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Starring Cast</h4>
                  <p className="text-sm font-medium text-gray-200">{movie.cast}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Poster & Meta Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-4 space-y-4 shadow-xl">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full rounded-xl object-cover aspect-[2/3] shadow-md"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-900 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                  No Poster Image
                </div>
              )}

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">Release Date</span>
                  <span className="font-semibold text-gray-200">{movie.releaseDate || movie.releaseYear}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">Rating</span>
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {movie.rating}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">Languages</span>
                  <span className="font-semibold text-gray-200">{movie.languages || 'English'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-400">Endpoint ID</span>
                  <span className="font-mono text-gray-400 truncate max-w-[120px]">{movie.id}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <ToastNotification message={toastMessage} />
    </div>
  );
}
