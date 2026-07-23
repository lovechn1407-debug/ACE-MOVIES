import { db } from './firebase';
import { ref, get, set, update, remove } from 'firebase/database';

// Firebase Realtime Database Helper Functions

export async function getStore() {
  try {
    const snapshot = await get(ref(db));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        topHeroMovieId: data.topHeroMovieId || null,
        apiProvider: data.apiProvider || 'auto',
        sections: data.sections ? Object.values(data.sections) : [],
        movies: data.movies ? Object.values(data.movies) : []
      };
    }
  } catch (err) {
    console.error('Firebase getStore error:', err.message);
  }
  return { topHeroMovieId: null, apiProvider: 'auto', sections: [], movies: [] };
}

export async function getApiProvider() {
  try {
    const snapshot = await get(ref(db, 'apiProvider'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (err) {
    console.error('Firebase getApiProvider error:', err.message);
  }
  return 'auto';
}

export async function setApiProvider(provider) {
  try {
    await set(ref(db, 'apiProvider'), provider);
    return provider;
  } catch (err) {
    console.error('Firebase setApiProvider error:', err.message);
    return 'auto';
  }
}

export async function getMovies() {
  try {
    const snapshot = await get(ref(db, 'movies'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      return Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    }
  } catch (err) {
    console.error('Firebase getMovies error:', err.message);
  }
  return [];
}

export async function getMovieById(id) {
  if (!id) return null;
  try {
    const cleanId = String(id);
    const snapshot = await get(ref(db, `movies/${cleanId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    // Fallback search by tmdbId or scanning movies array/object
    const movies = await getMovies();
    return movies.find(m => String(m.id) === cleanId || String(m.tmdbId) === cleanId) || null;
  } catch (err) {
    console.error('Firebase getMovieById error:', err.message);
  }
  return null;
}

export async function saveMovie(movieData) {
  try {
    const movieId = movieData.id || `movie-${Date.now()}`;
    const finalMovie = { ...movieData, id: String(movieId) };
    await set(ref(db, `movies/${finalMovie.id}`), finalMovie);
    return await getMovies();
  } catch (err) {
    console.error('Firebase saveMovie error:', err.message);
    throw err;
  }
}

export async function deleteMovie(id) {
  try {
    const cleanId = String(id);
    await remove(ref(db, `movies/${cleanId}`));
    
    // Check if deleted movie was top hero movie
    const heroSnapshot = await get(ref(db, 'topHeroMovieId'));
    if (heroSnapshot.exists() && String(heroSnapshot.val()) === cleanId) {
      const movies = await getMovies();
      const nextHeroId = movies[0]?.id || null;
      await set(ref(db, 'topHeroMovieId'), nextHeroId);
    }
    return await getMovies();
  } catch (err) {
    console.error('Firebase deleteMovie error:', err.message);
    return await getMovies();
  }
}

export async function getSections() {
  try {
    const snapshot = await get(ref(db, 'sections'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      return Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
    }
  } catch (err) {
    console.error('Firebase getSections error:', err.message);
  }
  return [];
}

export async function saveSection(sectionData) {
  try {
    const secId = sectionData.id || `sec-${Date.now()}`;
    const finalSection = {
      ...sectionData,
      id: String(secId),
      visible: sectionData.visible !== undefined ? Boolean(sectionData.visible) : true
    };
    await set(ref(db, `sections/${finalSection.id}`), finalSection);
    return await getSections();
  } catch (err) {
    console.error('Firebase saveSection error:', err.message);
    throw err;
  }
}

export async function toggleSectionVisibility(sectionId, visible) {
  try {
    const cleanId = String(sectionId);
    await update(ref(db, `sections/${cleanId}`), { visible: Boolean(visible) });
    return await getSections();
  } catch (err) {
    console.error('Firebase toggleSectionVisibility error:', err.message);
    return await getSections();
  }
}

export async function deleteSection(sectionId) {
  try {
    const cleanId = String(sectionId);
    await remove(ref(db, `sections/${cleanId}`));
    
    // Unassign sectionId from any movies in that section
    const movies = await getMovies();
    for (const m of movies) {
      if (String(m.sectionId) === cleanId) {
        await update(ref(db, `movies/${m.id}`), { sectionId: null });
      }
    }
    return await getSections();
  } catch (err) {
    console.error('Firebase deleteSection error:', err.message);
    return await getSections();
  }
}

export async function getTopHeroMovie() {
  try {
    const snapshot = await get(ref(db, 'topHeroMovieId'));
    if (snapshot.exists() && snapshot.val()) {
      const heroMovie = await getMovieById(snapshot.val());
      if (heroMovie) return heroMovie;
    }
    // Fallback to first available movie
    const movies = await getMovies();
    return movies[0] || null;
  } catch (err) {
    console.error('Firebase getTopHeroMovie error:', err.message);
  }
  return null;
}

export async function setTopHeroMovie(movieId) {
  try {
    await set(ref(db, 'topHeroMovieId'), String(movieId));
    return await getTopHeroMovie();
  } catch (err) {
    console.error('Firebase setTopHeroMovie error:', err.message);
    return null;
  }
}

// ─── Admin Auth Config ────────────────────────────────────────────────────────

export async function getAdminConfig() {
  try {
    const snapshot = await get(ref(db, 'adminConfig'));
    if (snapshot.exists()) return snapshot.val();
  } catch (err) {
    console.error('Firebase getAdminConfig error:', err.message);
  }
  return null;
}

/**
 * Called on first-ever admin login.
 * Registers the Google user as the sole authorized admin in Firebase.
 */
export async function registerPrimaryAdmin(user) {
  try {
    const adminConfig = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      registeredAt: new Date().toISOString()
    };
    await set(ref(db, 'adminConfig'), adminConfig);
    return adminConfig;
  } catch (err) {
    console.error('Firebase registerPrimaryAdmin error:', err.message);
    throw err;
  }
}

/**
 * Checks if the signed-in Google user matches the registered primary admin.
 * Returns { authorized: boolean, adminConfig: object | null }
 */
export async function checkAdminAuthorization(user) {
  try {
    const config = await getAdminConfig();
    if (!config) {
      // No admin registered yet — this user will become primary admin
      return { authorized: 'first_time', adminConfig: null };
    }
    if (config.uid === user.uid) {
      return { authorized: true, adminConfig: config };
    }
    return { authorized: false, adminConfig: config };
  } catch (err) {
    console.error('Firebase checkAdminAuthorization error:', err.message);
    return { authorized: false, adminConfig: null };
  }
}

