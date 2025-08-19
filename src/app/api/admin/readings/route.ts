import { NextResponse } from 'next/server';
import initializedDbPromise, { Reading } from '@/lib/db'; // Import the promise
import { v4 as uuidv4 } from 'uuid';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key'; // Use environment variable in production

function authenticate(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return null; // Authentication successful
}

export async function GET(request: Request) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  await db.read();
  return NextResponse.json(db.data.readings);
}

export async function POST(request: Request) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  const newReading: Reading = await request.json();
  newReading.id = uuidv4(); // Generate a unique ID

  await db.read();
  db.data.readings.push(newReading);
  await db.write();

  return NextResponse.json(newReading, { status: 201 });
}
