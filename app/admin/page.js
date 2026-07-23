'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastNotification from '@/components/ToastNotification';
import { 
  Shield, Layers, Film, Plus, Search, Check, Trash2, Edit, 
  Share2, Sparkles, RefreshCw, Star, Crown, X, Settings, Server
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'movies' | 'settings'
  const [sections, setSections] = useState([]);
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [apiProvider, setApiProvider] = useState('auto'); // 'auto' | 'tmdb' | 'omdb'
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [selectedTmdbMovie, setSelectedTmdbMovie] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);

  const [showTop1Modal, setShowTop1Modal] = useState(false);

  // Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    releaseYear: '',
    rating: '8.5',
    poster: '',
    backdrop: '',
    logo: '',
    languages: 'English',
    cast: '',
    sectionId: '',
    playLink: '',
    extraButtons: [{ label: '', url: '' }]
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [secRes, movRes, heroRes, setRes] = await Promise.all([
        fetch('/api/sections', { cache: 'no-store' }),
        fetch('/api/movies', { cache: 'no-store' }),
        fetch('/api/hero', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' })
      ]);
      const secData = await secRes.json();
      const movData = await movRes.json();
      const heroData = await heroRes.json();
      const setSetting = await setRes.json();

      setSections(secData.sections || []);
      setMovies(movData.movies || []);
      setHeroMovie(heroData.heroMovie || null);
      setApiProvider(setSetting.apiProvider || 'auto');
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- API PROVIDER SETTING HANDLER ---
  const handleUpdateApiProvider = async (newProvider) => {
    try {
      setApiProvider(newProvider);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiProvider: newProvider })
      });
      const data = await res.json();
      if (data.apiProvider) {
        showToast(`API Search Source updated to: ${newProvider.toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating API source setting');
    }
  };

  // --- SECTION MANAGEMENT HANDLERS ---
  const handleToggleSectionVisibility = async (secId, currentVisible) => {
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: secId, visible: !currentVisible })
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        showToast(`Section ${!currentVisible ? 'enabled (visible)' : 'hidden'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName.trim(), visible: true })
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        setNewSectionName('');
        setShowAddSectionModal(false);
        showToast('Section added successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (secId) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: secId })
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        showToast('Section deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchGenresSections = async () => {
    try {
      showToast('Fetching TMDB genres...');
      const res = await fetch('/api/tmdb/genres');
      const data = await res.json();
      if (data.genres && data.genres.length > 0) {
        let addedCount = 0;
        for (const g of data.genres) {
          const exists = sections.some(s => s.name.toLowerCase() === g.name.toLowerCase());
          if (!exists) {
            await fetch('/api/sections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: `${g.name} Movies`, visible: false })
            });
            addedCount++;
          }
        }
        await fetchAdminData();
        showToast(`Fetched & added ${addedCount} genre sections (unchecked by default).`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching TMDB genres');
    }
  };

  // --- MOVIE SEARCH & SELECTION HANDLERS ---
  const handleTmdbSearch = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    try {
      setTmdbSearching(true);
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(tmdbQuery)}`);
      const data = await res.json();
      setTmdbResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleSelectTmdbMovie = async (movieSummary) => {
    try {
      setFetchingDetails(true);
      const res = await fetch(`/api/tmdb/details?id=${movieSummary.tmdbId}`);
      const fullDetails = await res.json();
      
      setSelectedTmdbMovie(fullDetails);
      setMovieForm({
        tmdbId: fullDetails.tmdbId,
        title: fullDetails.title || '',
        description: fullDetails.description || '',
        releaseYear: fullDetails.releaseYear || '',
        rating: fullDetails.rating || '8.5',
        poster: fullDetails.poster || '',
        backdrop: fullDetails.backdrop || '',
        logo: fullDetails.logo || '',
        languages: fullDetails.languages || 'English',
        cast: fullDetails.cast || '',
        genres: fullDetails.genres || [],
        sectionId: '',
        playLink: fullDetails.trailerUrl || '',
        extraButtons: [{ label: 'Watch 1080p HD', url: fullDetails.trailerUrl || '' }]
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch full movie details');
    } finally {
      setFetchingDetails(false);
    }
  };

  // --- MOVIE SAVE & EDIT HANDLERS ---
  const handleSaveMovieForm = async (e) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      showToast('Movie title is required!');
      return;
    }

    try {
      const cleanExtraButtons = (movieForm.extraButtons || []).filter(b => b.url.trim().length > 0);
      const payload = {
        ...movieForm,
        extraButtons: cleanExtraButtons
      };

      let res;
      if (editingMovieId) {
        res = await fetch(`/api/movies/${editingMovieId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.movies) {
        setMovies(data.movies);
        showToast(editingMovieId ? 'Movie updated!' : 'Movie added to database!');
        setShowTmdbModal(false);
        setShowManualModal(false);
        setSelectedTmdbMovie(null);
        setEditingMovieId(null);
        resetMovieForm();
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving movie');
    }
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie.id);
    setMovieForm({
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title || '',
      description: movie.description || '',
      releaseYear: movie.releaseYear || '',
      rating: movie.rating || '8.5',
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      logo: movie.logo || '',
      languages: movie.languages || 'English',
      cast: movie.cast || '',
      sectionId: movie.sectionId || '',
      playLink: movie.playLink || '',
      extraButtons: movie.extraButtons && movie.extraButtons.length > 0 
        ? movie.extraButtons 
        : [{ label: '', url: '' }]
    });
    setShowManualModal(true);
  };

  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.movies) {
        setMovies(data.movies);
        showToast('Movie deleted from database');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTop1Hero = async (movieId) => {
    try {
      const res = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      });
      const data = await res.json();
      if (data.heroMovie) {
        setHeroMovie(data.heroMovie);
        setShowTop1Modal(false);
        showToast(`Updated Top #1 Homepage Movie to "${data.heroMovie.title}"!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareAdminMovie = (movie) => {
    const url = `${window.location.origin}/movie/${movie.id}`;
    navigator.clipboard.writeText(url);
    showToast(`Copied direct share link for "${movie.title}"`);
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      description: '',
      releaseYear: '',
      rating: '8.5',
      poster: '',
      backdrop: '',
      logo: '',
      languages: 'English',
      cast: '',
      sectionId: '',
      playLink: '',
      extraButtons: [{ label: '', url: '' }]
    });
  };

  const addExtraButtonField = () => {
    setMovieForm({
      ...movieForm,
      extraButtons: [...(movieForm.extraButtons || []), { label: '', url: '' }]
    });
  };

  const updateExtraButton = (index, field, value) => {
    const updated = [...(movieForm.extraButtons || [])];
    updated[index][field] = value;
    setMovieForm({ ...movieForm, extraButtons: updated });
  };

  const removeExtraButton = (index) => {
    const updated = [...(movieForm.extraButtons || [])];
    updated.splice(index, 1);
    setMovieForm({ ...movieForm, extraButtons: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080c] text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16 w-full space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e50914] to-red-900 flex items-center justify-center shadow-lg shadow-red-900/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                Admin Management Control
              </h1>
              <p className="text-xs text-gray-400">
                Configure sections, set movie API source, upload TMDB / manual movies, customize play links & set Top 1 Hero movie.
              </p>
            </div>
          </div>

          {/* Featured Top 1 Movie Quick Info */}
          {heroMovie && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
              <Crown className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-gray-400 block text-[10px]">CURRENT TOP #1 HERO MOVIE</span>
                <span className="font-bold text-white truncate max-w-[150px] inline-block">{heroMovie.title}</span>
              </div>
              <button
                onClick={() => setShowTop1Modal(true)}
                className="px-3 py-1 rounded-lg bg-[#e50914] text-white font-semibold hover:bg-red-600 transition-colors ml-2"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* API Provider Selector Card */}
        <div className="bg-[#12131a] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-[#e50914]" />
            <div>
              <h3 className="text-sm font-bold text-white">Movie API Search Provider Configuration</h3>
              <p className="text-xs text-gray-400">
                Select which API provider your server uses to search and fetch movie details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => handleUpdateApiProvider('auto')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                apiProvider === 'auto'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Auto (TMDB + OMDB Fallback)
            </button>
            <button
              onClick={() => handleUpdateApiProvider('tmdb')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                apiProvider === 'tmdb'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Strict TMDB API
            </button>
            <button
              onClick={() => handleUpdateApiProvider('omdb')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                apiProvider === 'omdb'
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Strict OMDB Database
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'sections'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/40'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Section Management ({sections.length})
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'movies'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/40'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            Movie Configuration ({movies.length})
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
          </div>
        ) : activeTab === 'sections' ? (
          /* SECTION MANAGEMENT TAB */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12131a] p-5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Homepage Sections Configuration</h2>
                <p className="text-xs text-gray-400">
                  Toggle checkboxes to hide or show sections on the public site.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleFetchGenresSections}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Fetch TMDB Genre Sections</span>
                </button>

                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-600 text-white font-semibold text-xs shadow-lg shadow-red-900/40 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Section</span>
                </button>
              </div>
            </div>

            {/* Sections List with Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((sec) => {
                const count = movies.filter(m => String(m.sectionId) === String(sec.id)).length;
                return (
                  <div
                    key={sec.id}
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                      sec.visible
                        ? 'bg-[#12131a] border-[#e50914]/40 shadow-lg'
                        : 'bg-white/5 border-white/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={sec.visible}
                        onChange={() => handleToggleSectionVisibility(sec.id, sec.visible)}
                        className="w-5 h-5 rounded border-white/30 bg-black text-[#e50914] focus:ring-[#e50914] cursor-pointer"
                        id={`sec-chk-${sec.id}`}
                      />
                      <div>
                        <label
                          htmlFor={`sec-chk-${sec.id}`}
                          className="font-bold text-sm text-white cursor-pointer hover:text-[#e50914] transition-colors block"
                        >
                          {sec.name}
                        </label>
                        <span className="text-[11px] text-gray-400">
                          {count} {count === 1 ? 'movie' : 'movies'} assigned • {sec.visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white/10 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* MOVIE CONFIGURATION TAB */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12131a] p-5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Movie Database Configuration</h2>
                <p className="text-xs text-gray-400">
                  Add movies from active API provider ({apiProvider.toUpperCase()}) or manually.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowTop1Modal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-all"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Edit Top 1 Hero Movie</span>
                </button>

                <button
                  onClick={() => {
                    setTmdbQuery('');
                    setTmdbResults([]);
                    setSelectedTmdbMovie(null);
                    setShowTmdbModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-600 text-white font-semibold text-xs shadow-lg shadow-red-900/40 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Add Movie from Database ({apiProvider.toUpperCase()})</span>
                </button>

                <button
                  onClick={() => {
                    setEditingMovieId(null);
                    resetMovieForm();
                    setShowManualModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Movie Manually</span>
                </button>
              </div>
            </div>

            {/* Movies Table */}
            <div className="bg-[#12131a] rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="p-4">Movie</th>
                      <th className="p-4">Section</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Play Links</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {movies.map((m) => {
                      const isTop1 = heroMovie && String(heroMovie.id) === String(m.id);
                      const secObj = sections.find(s => String(s.id) === String(m.sectionId));
                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            {m.poster ? (
                              <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-md flex-none" />
                            ) : (
                              <div className="w-10 h-14 bg-gray-800 rounded-md flex items-center justify-center text-gray-500 text-[10px] text-center p-1">No Image</div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{m.title}</span>
                                {isTop1 && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-bold">
                                    TOP #1 HERO
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-400 text-[11px] block">{m.releaseYear} • {m.languages || 'English'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md bg-white/10 text-gray-300 font-medium">
                              {secObj ? secObj.name : 'No Section (Individual)'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              {m.rating}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300 font-medium">
                              {m.playLink ? 'Primary Link Configured' : 'No Main Link'}
                              {m.extraButtons && m.extraButtons.length > 0 && ` (+${m.extraButtons.length} mirrors)`}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleShareAdminMovie(m)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10"
                              title="Copy Direct Share Endpoint"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditMovieClick(m)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10"
                              title="Edit Movie Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(m.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                              title="Delete Movie"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL 1: ADD SECTION MODAL --- */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Homepage Section</h3>
              <button onClick={() => setShowAddSectionModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. Action Blockbusters, Trending Now..."
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e50914] text-white text-xs font-semibold hover:bg-red-600"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TMDB/OMDB MOVIE SEARCH MODAL --- */}
      {showTmdbModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e50914]" />
                <h3 className="text-lg font-bold text-white">Add Movie from API Database</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 text-[#e50914] text-xs font-bold uppercase">
                  Source: {apiProvider.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setShowTmdbModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleTmdbSearch} className="flex gap-3">
              <input
                type="text"
                placeholder="Search movie title (e.g. Spider-Man, Inception, Dune, Avengers)..."
                value={tmdbQuery}
                onChange={(e) => setTmdbQuery(e.target.value)}
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#e50914] hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2"
              >
                {tmdbSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </form>

            {/* Search Results Picker with API Source Tag */}
            {tmdbResults.length > 0 && !selectedTmdbMovie && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase">Select Matching Movie:</h4>
                  <span className="text-[11px] text-gray-400">Showing {tmdbResults.length} real movie matches</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {tmdbResults.map((res) => (
                    <div
                      key={res.tmdbId}
                      onClick={() => handleSelectTmdbMovie(res)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 cursor-pointer transition-all"
                    >
                      {res.poster ? (
                        <img src={res.poster} alt={res.title} className="w-12 h-16 object-cover rounded-lg flex-none" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                      )}
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-bold text-sm text-white truncate">{res.title}</h5>
                          {res.apiSource && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-amber-400 border border-amber-400/30 flex-none font-bold">
                              {res.apiSource}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{res.releaseYear} • Rating: {res.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fetchingDetails && (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-[#e50914] animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Fetching full movie details from active API source...</p>
              </div>
            )}

            {/* Selected Movie Configuration Form */}
            {selectedTmdbMovie && !fetchingDetails && (
              <form onSubmit={handleSaveMovieForm} className="space-y-5 border-t border-white/10 pt-5">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  {selectedTmdbMovie.poster && (
                    <img src={selectedTmdbMovie.poster} alt={selectedTmdbMovie.title} className="w-16 h-24 object-cover rounded-lg" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white">{selectedTmdbMovie.title} ({selectedTmdbMovie.releaseYear})</h4>
                      {selectedTmdbMovie.apiSource && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold">
                          {selectedTmdbMovie.apiSource}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{selectedTmdbMovie.description}</p>
                  </div>
                </div>

                {/* Section Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Add to Section</label>
                  <select
                    value={movieForm.sectionId}
                    onChange={(e) => setMovieForm({ ...movieForm, sectionId: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  >
                    <option value="">No Section (Individual)</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.visible ? '(Visible)' : '(Hidden)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Play Buttons Config */}
                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold text-[#e50914] uppercase tracking-wider">Configure Play Links & Custom Buttons</h4>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Main "Click to Play" Link Input</label>
                    <input
                      type="text"
                      placeholder="Enter stream link or video embed URL (YouTube/MP4/HLS)..."
                      value={movieForm.playLink}
                      onChange={(e) => setMovieForm({ ...movieForm, playLink: e.target.value })}
                      className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  {/* Additional Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-300">Additional Streaming Mirror Buttons</label>
                      <button
                        type="button"
                        onClick={addExtraButtonField}
                        className="text-xs font-bold text-[#e50914] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add More Button
                      </button>
                    </div>

                    {(movieForm.extraButtons || []).map((btn, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Button Label (e.g. Watch 1080p, Server 2)"
                          value={btn.label}
                          onChange={(e) => updateExtraButton(idx, 'label', e.target.value)}
                          className="w-1/3 bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Stream Link URL"
                          value={btn.url}
                          onChange={(e) => updateExtraButton(idx, 'url', e.target.value)}
                          className="flex-1 bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraButton(idx)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowTmdbModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-900/40"
                  >
                    Save & Publish Movie
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* --- MODAL 3: MANUAL MOVIE ADD / EDIT MODAL --- */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12131a] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingMovieId ? 'Edit Movie Details' : 'Add Movie Manually (No API)'}
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovieForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Movie Title *</label>
                <input
                  type="text"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description / Overview</label>
                <textarea
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Release Year</label>
                  <input
                    type="text"
                    value={movieForm.releaseYear}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseYear: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rating</label>
                  <input
                    type="text"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Poster Image URL</label>
                  <input
                    type="text"
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Backdrop Image URL</label>
                  <input
                    type="text"
                    value={movieForm.backdrop}
                    onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={movieForm.logo}
                    onChange={(e) => setMovieForm({ ...movieForm, logo: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Assign to Section</label>
                <select
                  value={movieForm.sectionId}
                  onChange={(e) => setMovieForm({ ...movieForm, sectionId: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                >
                  <option value="">No Section (Individual)</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Play Link Inputs */}
              <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/10">
                <label className="block text-xs font-semibold text-gray-300">Main "Click to Play" Link Input</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={movieForm.playLink}
                  onChange={(e) => setMovieForm({ ...movieForm, playLink: e.target.value })}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-2 text-sm text-white"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-gray-300">Additional Streaming Mirror Buttons</span>
                  <button
                    type="button"
                    onClick={addExtraButtonField}
                    className="text-xs text-[#e50914] font-bold hover:underline"
                  >
                    + Add More Button
                  </button>
                </div>

                {(movieForm.extraButtons || []).map((btn, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Button Label"
                      value={btn.label}
                      onChange={(e) => updateExtraButton(idx, 'label', e.target.value)}
                      className="w-1/3 bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Stream URL"
                      value={btn.url}
                      onChange={(e) => updateExtraButton(idx, 'url', e.target.value)}
                      className="flex-1 bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button type="button" onClick={() => removeExtraButton(idx)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-600 shadow-lg shadow-red-900/40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: EDIT TOP 1 HERO MOVIE MODAL --- */}
      {showTop1Modal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Select Top #1 Homepage Hero Movie</h3>
              </div>
              <button onClick={() => setShowTop1Modal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Select one of the movies from your saved list below to feature as the Top #1 Hero Movie on the homepage.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {movies.map((m) => {
                const isSelected = heroMovie && String(heroMovie.id) === String(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSetTop1Hero(m.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                        : 'bg-white/5 border-white/10 hover:bg-white/15 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {m.poster && <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-md" />}
                      <div>
                        <h4 className="font-bold text-sm text-white">{m.title}</h4>
                        <span className="text-xs text-gray-400">{m.releaseYear} • Rating: {m.rating}</span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-3 py-1 rounded-full bg-[#e50914] text-white text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : (
                      <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white">
                        Set Top 1
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ToastNotification message={toastMessage} />
    </div>
  );
}
