import { NextResponse } from 'next/server';
import { getTMDBGenres } from '@/lib/tmdb';

export async function GET() {
  const genres = await getTMDBGenres();
  return NextResponse.json({ genres });
}
