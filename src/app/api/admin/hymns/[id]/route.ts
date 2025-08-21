import { NextRequest, NextResponse } from 'next/server';
import initializedDbPromise, { Hymn } from '@/lib/db';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key';

function authenticate(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise;
  const { id } = params;
  const updatedHymn: Hymn = await request.json();

  await db.read();
  const index = db.data.hymns.findIndex(h => h.id === id);

  if (index !== -1) {
    db.data.hymns[index] = { ...db.data.hymns[index], ...updatedHymn, id };
    await db.write();
    return NextResponse.json(db.data.hymns[index]);
  } else {
    return NextResponse.json({ message: 'Hymn not found' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise;
  const { id } = params;

  await db.read();
  const initialLength = db.data.hymns.length;
  db.data.hymns = db.data.hymns.filter(h => h.id !== id);

  if (db.data.hymns.length < initialLength) {
    await db.write();
    return NextResponse.json({ message: 'Hymn deleted' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Hymn not found' }, { status: 404 });
  }
}