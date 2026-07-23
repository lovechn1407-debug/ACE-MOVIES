import { NextResponse } from 'next/server';
import { getMovieById, saveMovie, deleteMovie } from '@/lib/db';
import { getTMDBMovieDetails } from '@/lib/tmdb';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  const id = decodeURIComponent(rawId);

  let movie = await getMovieById(id);
  
  // Dynamic fallback: If movie is not in Firebase store, fetch on demand by TMDB/IMDB ID!
  if (!movie && id) {
    try {
      const fetchedDetails = await getTMDBMovieDetails(id);
      if (fetchedDetails && fetchedDetails.title) {
        movie = {
          ...fetchedDetails,
          id: id,
          playLink: fetchedDetails.trailerUrl || '',
          extraButtons: []
        };
      }
    } catch (err) {
      console.warn('Dynamic fallback movie fetch error:', err.message);
    }
  }

  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }
  return NextResponse.json({ movie });
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = decodeURIComponent(resolvedParams.id);
    const updateData = await request.json();
    updateData.id = id;
    const movies = await saveMovie(updateData);
    return NextResponse.json({ success: true, movies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);
  const movies = await deleteMovie(id);
  return NextResponse.json({ success: true, movies });
}
