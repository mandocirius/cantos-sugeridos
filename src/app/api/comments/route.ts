import { NextResponse } from 'next/server';
import initializedDbPromise from '@/lib/db'; // Import the promise
import { v4 as uuidv4 } from 'uuid';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export async function GET() {
  const db = await initializedDbPromise; // Await the promise to get the initialized db instance
  await db.read();
  // Ensure db.data and db.data.comments are initialized
  if (!db.data || !db.data.comments) {
    db.data = { readings: [], hymns: [], comments: [] };
    await db.write();
  }
  console.log('db.data before serialization:', db.data);
  console.log('db.data.comments before serialization:', db.data.comments);

  // Ensure comments is a plain array of plain objects
  const comments = db.data.comments.map(comment => ({ ...comment }));
  
  console.log('Comments after mapping:', comments);
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const db = await initializedDbPromise; // Await the promise
  const { author, text } = await request.json();
  const newComment: Comment = {
    id: uuidv4(),
    author,
    text,
    timestamp: Date.now(),
  };

  await db.read();
  db.data.comments.push(newComment);
  await db.write();

  return NextResponse.json(newComment, { status: 201 });
}
