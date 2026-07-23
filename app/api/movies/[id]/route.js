import { NextResponse } from 'next/server';
import { getMovieById, saveMovie, deleteMovie } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = params;
  const movie = getMovieById(id);
  if (!movie) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }
  return NextResponse.json({ movie });
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();
    updateData.id = id;
    const movies = saveMovie(updateData);
    return NextResponse.json({ success: true, movies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const movies = deleteMovie(id);
  return NextResponse.json({ success: true, movies });
}
