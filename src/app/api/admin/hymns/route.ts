import { NextResponse } from 'next/server';
import initializedDbPromise, { Hymn } from '@/lib/db'; // Import the promise
import { v4 as uuidv4 } from 'uuid';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key';

function authenticate(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  await db.read();
  return NextResponse.json(db.data.hymns);
}

export async function POST(request: Request) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  const newHymn: Hymn = await request.json();
  newHymn.id = uuidv4();

  await db.read();
  db.data.hymns.push(newHymn);
  await db.write();

  return NextResponse.json(newHymn, { status: 201 });
}
