import { NextResponse } from 'next/server';
import { getTopHeroMovie, setTopHeroMovie } from '@/lib/db';

export async function GET() {
  const heroMovie = getTopHeroMovie();
  return NextResponse.json({ heroMovie });
}

export async function POST(request) {
  try {
    const { movieId } = await request.json();
    if (!movieId) {
      return NextResponse.json({ error: 'movieId is required' }, { status: 400 });
    }
    const heroMovie = setTopHeroMovie(movieId);
    return NextResponse.json({ success: true, heroMovie });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
