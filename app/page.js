'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import MovieSectionRow from '@/components/MovieSectionRow';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';
import ToastNotification from '@/components/ToastNotification';
import { Film, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [sections, setSections] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [heroRes, secRes, movRes] = await Promise.all([
        fetch('/api/hero', { cache: 'no-store' }),
        fetch('/api/sections', { cache: 'no-store' }),
        fetch('/api/movies', { cache: 'no-store' })
      ]);

      const heroData = await heroRes.json();
      const secData = await secRes.json();
      const movData = await movRes.json();

      setHeroMovie(heroData.heroMovie || null);
      setSections(secData.sections || []);
      setMovies(movData.movies || []);
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const visibleSections = sections.filter(s => s.visible);
  
  // Filter movies if search query active
  const filteredMovies = searchQuery.trim()
    ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
      <Navbar onSearch={(q) => setSearchQuery(q)} />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] space-y-4">
          <div className="w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium animate-pulse">Loading Movies Platform...</p>
        </div>
      ) : searchQuery.trim() ? (
        /* Search Results View */
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 pt-32 pb-16 w-full space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Sparkles className="w-6 h-6 text-[#e50914]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Search Results for <span className="text-[#e50914]">"{searchQuery}"</span>
            </h1>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
              {filteredMovies.map((m) => (
                <MovieCard key={m.id} movie={m} onToast={showToast} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <Film className="w-12 h-12 text-gray-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-300">No movies found</h2>
              <p className="text-gray-400 text-sm">Try searching for another movie title.</p>
            </div>
          )}
        </main>
      ) : (
        /* Standard Netflix Homepage View */
        <main className="flex-1 pb-16">
          {/* Top 1 Hero Movie Banner */}
          {heroMovie && <HeroBanner movie={heroMovie} onToast={showToast} />}

          {/* Dynamic Movie Sections */}
          <div className="space-y-4 -mt-10 relative z-30">
            {visibleSections.length > 0 ? (
              visibleSections.map((sec) => (
                <MovieSectionRow
                  key={sec.id}
                  section={sec}
                  movies={movies}
                  onToast={showToast}
                />
              ))
            ) : (
              <div className="max-w-4xl mx-auto my-12 p-8 text-center bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <Film className="w-10 h-10 text-[#e50914] mx-auto" />
                <h3 className="text-lg font-semibold text-white">No sections currently visible</h3>
                <p className="text-sm text-gray-400">
                  Go to the Admin Panel to enable sections or add movies to sections.
                </p>
              </div>
            )}
          </div>
        </main>
      )}

      <Footer />
      <ToastNotification message={toastMessage} />
    </div>
  );
}
