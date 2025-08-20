import { NextResponse } from 'next/server';

import initializedDbPromise, { Reading, Hymn } from '@/lib/db'; // Import the promise

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Removed scrapeVaticanNews and scrapeMusicaliturgica functions as per user request

function getNextSundayDate(today: Date) {
  const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday.toISOString().split('T')[0]; // YYYY-MM-DD format
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'en') as 'en' | 'es';
  let targetDate = searchParams.get('date'); // Get date from query parameter

  // Determine the date to fetch data for
  if (!targetDate) {
    targetDate = getNextSundayDate(new Date());
  }

  const cacheKey = `liturgy-data-${lang}-${targetDate}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Returning cached data.');
    return NextResponse.json(cachedData.data);
  }

  let finalReadings: Reading[] = [];
  let finalHymns: Hymn[] = [];

  // 1. Try to fetch from Database for the targetDate
  const db = await initializedDbPromise; // Await the promise
  await db.read();
  const dbReadings = db.data.readings.filter(r => r.date === targetDate);
  const dbHymns = db.data.hymns.filter(h => h.date === targetDate); // Assuming hymns also have a date field

  console.log('API received lang parameter:', lang);
  console.log('API received targetDate parameter:', targetDate);
  console.log('DB Readings count for targetDate:', dbReadings.length);
  console.log('DB Hymns count for targetDate:', dbHymns.length);

  // If data exists in DB for the targetDate, use it
  if (dbReadings.length > 0) {
    console.log('Returning readings from database for targetDate.');
    finalReadings = dbReadings.map(r => ({
      type: lang === 'es' ? r.type_es : r.type_en,
      reference: r.reference,
      text: lang === 'es' ? r.text_es : r.text_en,
      title_en: r.title_en,
      title_es: r.title_es,
    }));
  }

  if (dbHymns.length > 0) {
    console.log('Returning hymns from database for targetDate.');
    finalHymns = dbHymns.map(h => ({
      title: lang === 'es' ? h.title_es : h.title_en,
      liturgical_moment: h.liturgical_moment,
      lyrics: lang === 'es' ? h.lyrics_es : h.lyrics_en,
      chords: lang === 'es' ? h.chords_es : h.chords_en,
      video_url: h.video_url,
      pdf_url: h.pdf_url,
    }));
  }

  // Removed web scraping and local JSON fallback as per user request

  const responseData = {
    readings: finalReadings,
    hymns: finalHymns,
  };

  cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
  console.log('Data fetched and cached.');

  return NextResponse.json(responseData);
}
