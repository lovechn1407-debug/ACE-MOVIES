import { NextResponse } from 'next/server';
import { getSections, saveSection, toggleSectionVisibility, deleteSection } from '@/lib/db';

export async function GET() {
  const sections = await getSections();
  return NextResponse.json({ sections });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Action types: 'toggle', 'delete', or 'create'
    if (body.action === 'toggle') {
      const sections = await toggleSectionVisibility(body.id, body.visible);
      return NextResponse.json({ success: true, sections });
    }
    
    if (body.action === 'delete') {
      const sections = await deleteSection(body.id);
      return NextResponse.json({ success: true, sections });
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    const sections = await saveSection({
      id: body.id,
      name: body.name,
      visible: body.visible !== undefined ? body.visible : true
    });

    return NextResponse.json({ success: true, sections });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
