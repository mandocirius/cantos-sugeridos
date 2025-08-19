import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

interface Reading {
  id: string;
  date: string;
  type_en: string;
  type_es: string;
  title_en: string;
  title_es: string;
  reference: string;
  text_en: string;
  text_es: string;
}

interface Hymn {
  id: string;
  date: string;
  title_en: string;
  title_es: string;
  liturgical_moment: string;
  lyrics_en: string;
  lyrics_es: string;
  chords_en: string;
  chords_es: string;
  video_url: string;
  pdf_url: string;
}

interface Data {
  readings: Reading[];
  hymns: Hymn[];
  comments: Comment[];
}

const file = path.join(process.cwd(), 'db.json');
const adapter = new JSONFile<Data>(file);
const db = new Low<Data>(adapter, { readings: [], hymns: [], comments: [] }); // Provide default data here

// Export a promise that resolves when the DB is initialized
const initializeDbPromise = (async () => {
  await db.read();
  // If the file was empty or didn't exist, db.data will be null. Set default.
  if (!db.data) {
    db.data = { readings: [], hymns: [], comments: [] };
    await db.write();
  }
  return db;
})();

export default initializeDbPromise;
export type { Reading, Hymn };

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}