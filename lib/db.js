import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_DATA = {
  topHeroMovieId: 'movie-top-1',
  apiProvider: 'auto', // 'auto' | 'tmdb' | 'omdb'
  sections: [
    { id: 'sec-trending', name: 'Trending Now', visible: true },
    { id: 'sec-action', name: 'Action & Sci-Fi Blockbusters', visible: true },
    { id: 'sec-popular', name: 'Most Popular Hits', visible: true },
    { id: 'sec-drama', name: 'Critically Acclaimed Dramas', visible: false }
  ],
  movies: [
    {
      id: 'movie-top-1',
      tmdbId: 693134,
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
      releaseYear: '2024',
      releaseDate: '2024-02-27',
      rating: '8.6',
      runtime: '166 min',
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLPoLStVJ2LTaPhftYmgPSp1.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/xOMo8Wh8M85A2x2y2C746sZgA75.jpg',
      logo: 'https://image.tmdb.org/t/p/w500/8tS2m8tYV2Z6J6s8v4l0V4f6.png',
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      languages: 'English',
      cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem',
      sectionId: 'sec-trending',
      playLink: 'https://www.youtube.com/embed/Way9Dexny3w',
      extraButtons: [
        { label: 'Watch Server 1 (1080p HD)', url: 'https://www.youtube.com/embed/Way9Dexny3w' },
        { label: 'Watch Server 2 (4K Ultra)', url: 'https://www.youtube.com/embed/Way9Dexny3w' }
      ]
    },
    {
      id: 'movie-2',
      tmdbId: 157336,
      title: 'Interstellar',
      description: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
      releaseYear: '2014',
      releaseDate: '2014-11-05',
      rating: '8.4',
      runtime: '169 min',
      poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fKjVQsXio.jpg',
      logo: null,
      genres: ['Sci-Fi', 'Drama', 'Adventure'],
      languages: 'English',
      cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
      sectionId: 'sec-action',
      playLink: 'https://www.youtube.com/embed/zSWdZVtXT7E',
      extraButtons: [
        { label: 'Stream 1080p HD', url: 'https://www.youtube.com/embed/zSWdZVtXT7E' }
      ]
    },
    {
      id: 'movie-3',
      tmdbId: 299536,
      title: 'Avengers: Infinity War',
      description: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.',
      releaseYear: '2018',
      releaseDate: '2018-04-25',
      rating: '8.3',
      runtime: '149 min',
      poster: 'https://image.tmdb.org/t/p/w500/7WsyChLLEzcqIFT2AasPWUdGZdu.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/mbfBh2TmFZBchMQiqVfg6ibZ2Z.jpg',
      logo: null,
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      languages: 'English',
      cast: 'Robert Downey Jr., Chris Hemsworth, Mark Ruffalo, Chris Evans',
      sectionId: 'sec-popular',
      playLink: 'https://www.youtube.com/embed/6ZfuNTqbHE8',
      extraButtons: [
        { label: 'Play Server 1', url: 'https://www.youtube.com/embed/6ZfuNTqbHE8' },
        { label: 'Download 720p', url: 'https://www.youtube.com/embed/6ZfuNTqbHE8' }
      ]
    },
    {
      id: 'movie-4',
      tmdbId: 550,
      title: 'Fight Club',
      description: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      releaseYear: '1999',
      releaseDate: '1999-10-15',
      rating: '8.4',
      runtime: '139 min',
      poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/hZkgoQY85KGdfwZh3WFMTCLrjPh.jpg',
      logo: null,
      genres: ['Drama', 'Thriller'],
      languages: 'English',
      cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter',
      sectionId: 'sec-trending',
      playLink: 'https://www.youtube.com/embed/qtRKDVOm4nc',
      extraButtons: []
    },
    {
      id: 'movie-5',
      tmdbId: 27205,
      title: 'Inception',
      description: 'Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is offered a chance at redemption if he can perform inception.',
      releaseYear: '2010',
      releaseDate: '2010-07-15',
      rating: '8.4',
      runtime: '148 min',
      poster: 'https://image.tmdb.org/t/p/w500/oYuLEW9WAFK1P22v929B9aeWnKl.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHA84E.jpg',
      logo: null,
      genres: ['Action', 'Sci-Fi', 'Adventure'],
      languages: 'English',
      cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
      sectionId: 'sec-action',
      playLink: 'https://www.youtube.com/embed/YoHD9XEInc0',
      extraButtons: [
        { label: 'Direct Play HD', url: 'https://www.youtube.com/embed/YoHD9XEInc0' }
      ]
    }
  ]
};

// Global in-memory cache for serverless environments
let memoryStore = null;

function ensureDataLoaded() {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      memoryStore = JSON.parse(fileContent);
      if (!memoryStore.apiProvider) memoryStore.apiProvider = 'auto';
    } else {
      memoryStore = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveStore(memoryStore);
    }
  } catch (err) {
    console.error('Error reading store.json, using fallback memory store:', err);
    memoryStore = JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  return memoryStore;
}

function saveStore(data) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write to disk (Vercel read-only filesystem or permissions), using memory persistence:', err.message);
  }
}

// Database helper functions
export function getStore() {
  return ensureDataLoaded();
}

export function getApiProvider() {
  return getStore().apiProvider || 'auto';
}

export function setApiProvider(provider) {
  const store = getStore();
  store.apiProvider = provider;
  saveStore(store);
  return store.apiProvider;
}

export function getMovies() {
  return getStore().movies || [];
}

export function getMovieById(id) {
  const movies = getMovies();
  return movies.find(m => String(m.id) === String(id) || String(m.tmdbId) === String(id)) || null;
}

export function saveMovie(movieData) {
  const store = getStore();
  const index = store.movies.findIndex(m => String(m.id) === String(movieData.id));
  
  if (index >= 0) {
    store.movies[index] = { ...store.movies[index], ...movieData };
  } else {
    const newId = movieData.id || `movie-${Date.now()}`;
    store.movies.push({ ...movieData, id: newId });
  }
  saveStore(store);
  return store.movies;
}

export function deleteMovie(id) {
  const store = getStore();
  store.movies = store.movies.filter(m => String(m.id) !== String(id));
  if (String(store.topHeroMovieId) === String(id)) {
    store.topHeroMovieId = store.movies[0]?.id || null;
  }
  saveStore(store);
  return store.movies;
}

export function getSections() {
  return getStore().sections || [];
}

export function saveSection(sectionData) {
  const store = getStore();
  const index = store.sections.findIndex(s => String(s.id) === String(sectionData.id));
  if (index >= 0) {
    store.sections[index] = { ...store.sections[index], ...sectionData };
  } else {
    const newId = sectionData.id || `sec-${Date.now()}`;
    store.sections.push({ ...sectionData, id: newId });
  }
  saveStore(store);
  return store.sections;
}

export function toggleSectionVisibility(sectionId, visible) {
  const store = getStore();
  const section = store.sections.find(s => String(s.id) === String(sectionId));
  if (section) {
    section.visible = visible;
    saveStore(store);
  }
  return store.sections;
}

export function deleteSection(sectionId) {
  const store = getStore();
  store.sections = store.sections.filter(s => String(s.id) !== String(sectionId));
  store.movies.forEach(m => {
    if (String(m.sectionId) === String(sectionId)) {
      m.sectionId = null;
    }
  });
  saveStore(store);
  return store.sections;
}

export function getTopHeroMovie() {
  const store = getStore();
  const heroId = store.topHeroMovieId;
  const heroMovie = getMovieById(heroId) || store.movies[0] || null;
  return heroMovie;
}

export function setTopHeroMovie(movieId) {
  const store = getStore();
  store.topHeroMovieId = movieId;
  saveStore(store);
  return getTopHeroMovie();
}
