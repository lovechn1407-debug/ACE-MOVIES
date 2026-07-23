import { NextResponse } from 'next/server';
import { getMovies, saveMovie } from '@/lib/db';

export async function GET() {
  const movies = await getMovies();
  return NextResponse.json({ movies });
}

export async function POST(request) {
  try {
    const movieData = await request.json();
    if (!movieData.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const movies = await saveMovie(movieData);
    return NextResponse.json({ success: true, movies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
