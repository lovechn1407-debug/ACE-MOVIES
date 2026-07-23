'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastNotification from '@/components/ToastNotification';
import { 
  Play, Share2, Star, Clock, Globe, ArrowLeft, ExternalLink, 
  Film, Cloud, HardDrive, Shield, Download, Folder 
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
  const primaryUrl = movie.playLink || activePlayUrl || '#';
  const cardButtonType = movie.cardButtonType || 'play'; // 'play' | 'terabox' | 'gdrive' | 'mega'

  return (
    <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Backdrop Cover Section */}
        <div className="relative w-full min-h-[40vh] sm:min-h-[50vh] flex items-end pb-12 px-4 sm:px-8 lg:px-16 overflow-hidden bg-black">
          {backdropSrc && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-50"
              style={{ backgroundImage: `url(${backdropSrc})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/80 to-transparent w-full md:w-2/3" />
            </div>
          )}

          <div className="relative z-20 max-w-4xl space-y-4">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-white/15 transition-all mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            {movie.logo ? (
              <img
                src={movie.logo}
                alt={movie.title}
                className="max-h-24 sm:max-h-32 object-contain py-2 drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                {movie.title}
              </h1>
            )}

            {/* Metadata pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                {movie.rating || '8.5'}
              </span>
              <span className="px-2.5 py-0.5 rounded border border-white/20 bg-white/5">
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

            {/* Share Button */}
            <div className="pt-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-semibold"
              >
                <Share2 className="w-4 h-4 text-[#e50914]" />
                <span>{copied ? 'Link Copied!' : 'Share Direct Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 16:9 Landscape Card & Streaming Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 -mt-8 relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main 16:9 Landscape Card & Buttons */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 16:9 Landscape Image Card */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#12131a] border-2 border-white/15 shadow-2xl relative group">
              {backdropSrc ? (
                <img
                  src={backdropSrc}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-950 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Film className="w-16 h-16 text-[#e50914]" />
                  <span className="font-bold text-lg text-white">{movie.title}</span>
                </div>
              )}

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Title Tag top left */}
              <div className="absolute top-4 left-4 max-w-[70%]">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider bg-black/60 px-3 py-1 rounded-md backdrop-blur-md border border-white/10">
                  {movie.title}
                </span>
              </div>

              {/* Center Custom Overlay Button Widget */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {cardButtonType === 'terabox' ? (
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0084ff] hover:bg-[#0073e6] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-blue-600/60 transition-all transform hover:scale-105 border border-blue-400/40"
                  >
                    <Cloud className="w-5 h-5 fill-white" />
                    <span>Open with TeraBox</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                  </a>
                ) : cardButtonType === 'gdrive' ? (
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0f9d58] hover:bg-[#0b8043] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-green-600/60 transition-all transform hover:scale-105 border border-green-400/40"
                  >
                    <HardDrive className="w-5 h-5" />
                    <span>Open with Google Drive</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                  </a>
                ) : cardButtonType === 'mega' ? (
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#d9272e] hover:bg-[#b81d23] text-white font-extrabold text-sm sm:text-base shadow-2xl shadow-red-600/60 transition-all transform hover:scale-105 border border-red-400/40"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Open with Mega</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                  </a>
                ) : (
                  /* Default Red Play Icon Circle */
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#e50914] hover:bg-[#f6121d] text-white flex items-center justify-center shadow-2xl shadow-red-900/80 transition-all transform hover:scale-110 border-2 border-white/20"
                    title="Click to Play"
                  >
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                  </a>
                )}
              </div>
            </div>

            {/* Custom Play & Stream Link Buttons Below */}
            <div className="bg-[#12131a] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-[#e50914] fill-[#e50914]" />
                Streaming & Download Servers
              </h3>
              
              {allButtons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allButtons.map((btn, idx) => (
                    <a
                      key={idx}
                      href={btn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-4 rounded-xl border text-sm font-semibold transition-all ${
                        btn.isPrimary
                          ? 'bg-[#e50914] border-[#e50914] text-white shadow-lg shadow-red-900/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4" />
                        <span>{btn.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-gray-300 uppercase font-bold">
                          {btn.isPrimary ? 'Primary' : 'Mirror'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No play links configured for this movie yet.</p>
              )}
            </div>

            {/* Description & Details */}
            <div className="bg-[#12131a] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Movie Synopsis</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{movie.description}</p>

              {movie.cast && (
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Starring Cast</h4>
                  <p className="text-sm font-medium text-gray-200">{movie.cast}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Poster & Meta Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#12131a] p-4 space-y-4 shadow-xl">
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
