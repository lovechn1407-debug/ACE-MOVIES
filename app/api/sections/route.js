import { NextResponse } from 'next/server';
import { getSections, saveSection, toggleSectionVisibility, deleteSection } from '@/lib/db';

export async function GET() {
  const sections = getSections();
  return NextResponse.json({ sections });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Action types: 'create', 'toggle', 'delete'
    if (body.action === 'toggle') {
      const sections = toggleSectionVisibility(body.id, body.visible);
      return NextResponse.json({ success: true, sections });
    }
    
    if (body.action === 'delete') {
      const sections = deleteSection(body.id);
      return NextResponse.json({ success: true, sections });
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    const sections = saveSection({
      id: body.id,
      name: body.name,
      visible: body.visible !== undefined ? body.visible : false // unchecked by default when fetched/added
    });

    return NextResponse.json({ success: true, sections });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
