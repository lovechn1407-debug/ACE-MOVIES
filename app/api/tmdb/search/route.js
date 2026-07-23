import { NextResponse } from 'next/server';
import { searchTMDBMovies } from '@/lib/tmdb';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchTMDBMovies(query);
  return NextResponse.json({ results });
}
