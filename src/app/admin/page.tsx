"use client";

import { useState, useEffect } from 'react';

interface Reading {
  id?: string;
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
  id?: string;
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



export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [newReading, setNewReading] = useState<Reading>({
    date: '', type_en: '', type_es: '', title_en: '', title_es: '', reference: '', text_en: '', text_es: ''
  });
  const [newHymn, setNewHymn] = useState<Hymn>({
    date: '', title_en: '', title_es: '', liturgical_moment: '', lyrics_en: '', lyrics_es: '', chords_en: '', chords_es: '', video_url: '', pdf_url: ''
  });
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [editingHymn, setEditingHymn] = useState<Hymn | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('adminApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      checkAuth(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchReadings();
      fetchHymns();
    }
  }, [authenticated, fetchReadings, fetchHymns]);

  const checkAuth = async (key: string) => {
    try {
      const res = await fetch('/api/admin/readings', {
        headers: { 'x-api-key': key }
      });
      if (res.ok) {
        setAuthenticated(true);
        localStorage.setItem('adminApiKey', key);
      } else {
        setAuthenticated(false);
        alert('Authentication failed. Invalid API Key.');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthenticated(false);
      alert('Authentication check failed. Server error.');
    }
  };

  const handleLogin = () => {
    checkAuth(apiKey);
  };

  const fetchReadings = async () => {
    try {
      const res = await fetch('/api/admin/readings', {
        headers: { 'x-api-key': apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        setReadings(data);
      } else {
        console.error('Failed to fetch readings:', await res.text());
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  };

  const fetchHymns = async () => {
    try {
      const res = await fetch('/api/admin/hymns', {
        headers: { 'x-api-key': apiKey }
      });
      if (res.ok) {
        const data = await res.json();
        setHymns(data);
      } else {
        console.error('Failed to fetch hymns:', await res.text());
      }
    } catch (error) {
      console.error('Error fetching hymns:', error);
    }
  };

  const handleAddReading = async () => {
    try {
      const res = await fetch('/api/admin/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(newReading),
      });
      if (res.ok) {
        setNewReading({ date: '', type_en: '', type_es: '', title_en: '', title_es: '', reference: '', text_en: '', text_es: '' });
        fetchReadings();
      } else {
        alert('Failed to add reading: ' + await res.text());
      }
    } catch (error) {
      console.error('Error adding reading:', error);
    }
  };

  const handleUpdateReading = async () => {
    if (!editingReading?.id) return;
    try {
      const res = await fetch(`/api/admin/readings/${editingReading.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(editingReading),
      });
      if (res.ok) {
        setEditingReading(null);
        fetchReadings();
      } else {
        alert('Failed to update reading: ' + await res.text());
      }
    } catch (error) {
      console.error('Error updating reading:', error);
    }
  };

  const handleDeleteReading = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading?')) return;
    try {
      const res = await fetch(`/api/admin/readings/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        fetchReadings();
      } else {
        alert('Failed to delete reading: ' + await res.text());
      }
    } catch (error) {
      console.error('Error deleting reading:', error);
    }
  };

  const handleAddHymn = async () => {
    try {
      const res = await fetch('/api/admin/hymns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(newHymn),
      });
      if (res.ok) {
        setNewHymn({ title_en: '', title_es: '', liturgical_moment: '', lyrics_en: '', lyrics_es: '', chords_en: '', chords_es: '', video_url: '', pdf_url: '' });
        fetchHymns();
      } else {
        alert('Failed to add hymn: ' + await res.text());
      }
    } catch (error) {
      console.error('Error adding hymn:', error);
    }
  };

  const handleUpdateHymn = async () => {
    if (!editingHymn?.id) return;
    try {
      const res = await fetch(`/api/admin/hymns/${editingHymn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(editingHymn),
      });
      if (res.ok) {
        setEditingHymn(null);
        fetchHymns();
      } else {
        alert('Failed to update hymn: ' + await res.text());
      }
    } catch (error) {
      console.error('Error updating hymn:', error);
    }
  };

  const handleDeleteHymn = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hymn?')) return;
    try {
      const res = await fetch(`/api/admin/hymns/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': apiKey },
      });
      if (res.ok) {
        fetchHymns();
      } else {
        alert('Failed to delete hymn: ' + await res.text());
      }
    } catch (error) {
      console.error('Error deleting hymn:', error);
    }
  };

  if (!authenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800">
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter API Key"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Console</h1>

      {/* Add Reading Form */}
      <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Add New Reading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" placeholder="Date" value={newReading.date} onChange={(e) => setNewReading({ ...newReading, date: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Type (English)" value={newReading.type_en} onChange={(e) => setNewReading({ ...newReading, type_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Type (Spanish)" value={newReading.type_es} onChange={(e) => setNewReading({ ...newReading, type_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Title (English)" value={newReading.title_en} onChange={(e) => setNewReading({ ...newReading, title_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Title (Spanish)" value={newReading.title_es} onChange={(e) => setNewReading({ ...newReading, title_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Reference" value={newReading.reference} onChange={(e) => setNewReading({ ...newReading, reference: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <textarea placeholder="Text (English)" value={newReading.text_en} onChange={(e) => setNewReading({ ...newReading, text_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          <textarea placeholder="Text (Spanish)" value={newReading.text_es} onChange={(e) => setNewReading({ ...newReading, text_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
        </div>
        <button onClick={handleAddReading} className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Reading</button>
      </section>

      {/* Edit Reading Form */}
      {editingReading && (
        <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Edit Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" placeholder="Date" value={editingReading.date} onChange={(e) => setEditingReading({ ...editingReading, date: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Type (English)" value={editingReading.type_en} onChange={(e) => setEditingReading({ ...editingReading, type_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Type (Spanish)" value={editingReading.type_es} onChange={(e) => setEditingReading({ ...editingReading, type_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Title (English)" value={editingReading.title_en} onChange={(e) => setEditingReading({ ...editingReading, title_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Title (Spanish)" value={editingReading.title_es} onChange={(e) => setEditingReading({ ...editingReading, title_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Reference" value={editingReading.reference} onChange={(e) => setEditingReading({ ...editingReading, reference: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <textarea placeholder="Text (English)" value={editingReading.text_en} onChange={(e) => setEditingReading({ ...editingReading, text_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
            <textarea placeholder="Text (Spanish)" value={editingReading.text_es} onChange={(e) => setEditingReading({ ...editingReading, text_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={handleUpdateReading} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Update Reading</button>
            <button onClick={() => setEditingReading(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">Cancel</button>
          </div>
        </section>
      )}

      {/* Readings List */}
      <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Readings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Type (EN)</th>
                <th className="py-2 px-4 border-b text-left">Title (EN)</th>
                <th className="py-2 px-4 border-b text-left">Reference</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => (
                <tr key={reading.id}>
                  <td className="py-2 px-4 border-b">{reading.date}</td>
                  <td className="py-2 px-4 border-b">{reading.type_en}</td>
                  <td className="py-2 px-4 border-b">{reading.title_en}</td>
                  <td className="py-2 px-4 border-b">{reading.reference}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => setEditingReading(reading)} className="bg-yellow-500 text-white p-1 rounded text-sm mr-2 hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDeleteReading(reading.id!)} className="bg-red-500 text-white p-1 rounded text-sm hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Hymn Form */}
      <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Add New Hymn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" placeholder="Date" value={newHymn.date} onChange={(e) => setNewHymn({ ...newHymn, date: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Title (English)" value={newHymn.title_en} onChange={(e) => setNewHymn({ ...newHymn, title_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Title (Spanish)" value={newHymn.title_es} onChange={(e) => setNewHymn({ ...newHymn, title_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="Liturgical Moment" value={newHymn.liturgical_moment} onChange={(e) => setNewHymn({ ...newHymn, liturgical_moment: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
          <textarea placeholder="Lyrics (English)" value={newHymn.lyrics_en} onChange={(e) => setNewHymn({ ...newHymn, lyrics_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          <textarea placeholder="Lyrics (Spanish)" value={newHymn.lyrics_es} onChange={(e) => setNewHymn({ ...newHymn, lyrics_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          <textarea placeholder="Chords (English)" value={newHymn.chords_en} onChange={(e) => setNewHymn({ ...newHymn, chords_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          <textarea placeholder="Chords (Spanish)" value={newHymn.chords_es} onChange={(e) => setNewHymn({ ...newHymn, chords_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
          <input type="text" placeholder="Video URL" value={newHymn.video_url} onChange={(e) => setNewHymn({ ...newHymn, video_url: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500" />
          <input type="text" placeholder="PDF URL" value={newHymn.pdf_url} onChange={(e) => setNewHymn({ ...newHymn, pdf_url: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500" />
        </div>
        <button onClick={handleAddHymn} className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Hymn</button>
      </section>

      {/* Edit Hymn Form */}
      {editingHymn && (
        <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Edit Hymn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" placeholder="Date" value={editingHymn?.date || ''} onChange={(e) => setEditingHymn({ ...editingHymn, date: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Title (English)" value={editingHymn.title_en} onChange={(e) => setEditingHymn({ ...editingHymn, title_en: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Title (Spanish)" value={editingHymn.title_es} onChange={(e) => setEditingHymn({ ...editingHymn, title_es: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="Liturgical Moment" value={editingHymn.liturgical_moment} onChange={(e) => setEditingHymn({ ...editingHymn, liturgical_moment: e.target.value })} className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500" />
            <textarea placeholder="Lyrics (English)" value={editingHymn.lyrics_en} onChange={(e) => setEditingHymn({ ...editingHymn, lyrics_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
            <textarea placeholder="Lyrics (Spanish)" value={editingHymn.lyrics_es} onChange={(e) => setEditingHymn({ ...editingHymn, lyrics_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
            <textarea placeholder="Chords (English)" value={editingHymn.chords_en} onChange={(e) => setEditingHymn({ ...editingHymn, chords_en: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
            <textarea placeholder="Chords (Spanish)" value={editingHymn.chords_es} onChange={(e) => setEditingHymn({ ...editingHymn, chords_es: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500"></textarea>
            <input type="text" placeholder="Video URL" value={editingHymn.video_url} onChange={(e) => setEditingHymn({ ...editingHymn, video_url: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500" />
            <input type="text" placeholder="PDF URL" value={editingHymn.pdf_url} onChange={(e) => setEditingHymn({ ...editingHymn, pdf_url: e.target.value })} className="p-2 border rounded md:col-span-2 dark:bg-gray-600 dark:border-gray-500" />
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={handleUpdateHymn} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Update Hymn</button>
            <button onClick={() => setEditingHymn(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">Cancel</button>
          </div>
        </section>
      )}

      {/* Hymns List */}
      <section className="mb-8 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Hymns</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Title (EN)</th>
                <th className="py-2 px-4 border-b text-left">Moment</th>
                <th className="py-2 px-4 border-b text-left">Video URL</th>
                <th className="py-2 px-4 border-b text-left">PDF URL</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hymns.map((hymn) => (
                <tr key={hymn.id}>
                  <td className="py-2 px-4 border-b">{hymn.date}</td>
                  <td className="py-2 px-4 border-b">{hymn.title_en}</td>
                  <td className="py-2 px-4 border-b">{hymn.liturgical_moment}</td>
                  <td className="py-2 px-4 border-b"><a href={hymn.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></td>
                  <td className="py-2 px-4 border-b"><a href={hymn.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => setEditingHymn(hymn)} className="bg-yellow-500 text-white p-1 rounded text-sm mr-2 hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDeleteHymn(hymn.id!)} className="bg-red-500 text-white p-1 rounded text-sm hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
