import { NextResponse } from 'next/server';
import initializedDbPromise, { Reading } from '@/lib/db'; // Import the promise

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your_secret_admin_key';

function authenticate(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  const { id } = params;
  const updatedReading: Reading = await request.json();

  await db.read();
  const index = db.data.readings.findIndex(r => r.id === id);

  if (index !== -1) {
    db.data.readings[index] = { ...db.data.readings[index], ...updatedReading, id };
    await db.write();
    return NextResponse.json(db.data.readings[index]);
  } else {
    return NextResponse.json({ message: 'Reading not found' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authError = authenticate(request);
  if (authError) {
    return authError;
  }

  const db = await initializedDbPromise; // Await the promise
  const { id } = params;

  await db.read();
  const initialLength = db.data.readings.length;
  db.data.readings = db.data.readings.filter(r => r.id !== id);

  if (db.data.readings.length < initialLength) {
    await db.write();
    return NextResponse.json({ message: 'Reading deleted' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Reading not found' }, { status: 404 });
  }
}
