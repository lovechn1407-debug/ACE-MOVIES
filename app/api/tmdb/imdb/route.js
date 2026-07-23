import { NextResponse } from 'next/server';
import { getTMDBMovieDetails } from '@/lib/tmdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get('id');

  if (!imdbId) {
    return NextResponse.json({ error: 'Missing IMDB ID parameter' }, { status: 400 });
  }

  // Ensure format starts with tt or handles raw numbers
  const formattedId = imdbId.trim().startsWith('tt') ? imdbId.trim() : `tt${imdbId.trim()}`;
  const details = await getTMDBMovieDetails(formattedId);
  return NextResponse.json(details);
}
