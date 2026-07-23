import { NextResponse } from 'next/server';
import { getTMDBMovieDetails } from '@/lib/tmdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('id');

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing tmdbId parameter' }, { status: 400 });
  }

  const details = await getTMDBMovieDetails(tmdbId);
  return NextResponse.json(details);
}
