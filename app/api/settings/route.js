import { NextResponse } from 'next/server';
import { getApiProvider, setApiProvider } from '@/lib/db';

export async function GET() {
  const provider = await getApiProvider();
  return NextResponse.json({ apiProvider: provider });
}

export async function POST(request) {
  try {
    const { apiProvider } = await request.json();
    if (!apiProvider) {
      return NextResponse.json({ error: 'apiProvider is required' }, { status: 400 });
    }
    const updated = await setApiProvider(apiProvider);
    return NextResponse.json({ success: true, apiProvider: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
