"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReadingCard from './components/ReadingCard';
import HymnCard from './components/HymnCard';
import { countries, Country } from '@/lib/countryData';

interface Reading {
  type: string;
  reference: string;
  text: string;
}

interface Hymn {
  title: string;
  liturgical_moment: string;
  lyrics: string;
  chords: string;
  video_url?: string;
  pdf_url?: string;
}

interface LiturgyData {
  readings: Reading[];
  hymns: Hymn[];
  date: string; // Add date to LiturgyData interface
}

interface Comment {
  id: string;
  author: string;
  email?: string; // New field
  countryCode?: string; // New field
  phoneNumber?: string; // New field
  text: string;
  timestamp: number;
}

export default function Home() {
  const router = useRouter();
  const [liturgyData, setLiturgyData] = useState<LiturgyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState(''); // New state for email
  const [newCommentCountryCode, setNewCommentCountryCode] = useState('+1'); // Default to +1
  const [newCommentPhoneNumber, setNewCommentPhoneNumber] = useState(''); // New state for phone number
  const [newCommentText, setNewCommentText] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      setLang(storedLang as 'en' | 'es');
    }
  }, []);

  useEffect(() => {
    const fetchLiturgyData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/liturgy?lang=${lang}&date=${selectedDate}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setLiturgyData(data);
      } catch (e: unknown) {
        setError(e.message);
        console.error("Failed to fetch liturgy data:", e);
      }
    };

    fetchLiturgyData();
  }, [lang, selectedDate]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comments');
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        } else {
          console.error('Failed to fetch comments:', await res.text());
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'es') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor || !newCommentEmail || !newCommentText) {
      alert(lang === 'es' ? 'Por favor, complete todos los campos de comentarios (Nombre, Email, Comentario).': 'Please fill in all comment fields (Name, Email, Comment).');
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          author: newCommentAuthor,
          email: newCommentEmail,
          countryCode: newCommentCountryCode,
          phoneNumber: newCommentPhoneNumber,
          text: newCommentText
        }),
      });
      if (res.ok) {
        setNewCommentAuthor('');
        setNewCommentText('');
        // Re-fetch comments to update the list
        const updatedCommentsRes = await fetch('/api/comments');
        if (updatedCommentsRes.ok) {
          const updatedComments = await updatedCommentsRes.json();
          setComments(updatedComments);
        }
      } else {
        alert(lang === 'es' ? 'Error al enviar comentario.' : 'Failed to submit comment.' + await res.text());
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(lang === 'es' ? 'Error al enviar comentario.' : 'Error submitting comment.');
    }
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url); // Redirect to Stripe Checkout
      } else {
        alert(lang === 'es' ? 'Error al iniciar el proceso de pago.' : 'Error initiating payment process.');
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      alert(lang === 'es' ? 'Error al iniciar el proceso de pago.' : 'Error initiating payment process.');
    }
  };

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <h1 className="text-3xl font-bold mb-6 text-red-600">{lang === 'es' ? 'Error al cargar datos litúrgicos' : 'Error Loading Liturgical Data'}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">{error}</p>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-2">{lang === 'es' ? 'Asegúrese de que la API esté funcionando y sea accesible.' : 'Please ensure the API is running and accesible.'}</p>
      </main>
    );
  }

  if (!liturgyData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <h1 className="text-3xl font-bold mb-6">{lang === 'es' ? 'Cargando datos litúrgicos...' : 'Loading Liturgical Data...'}</h1>
      </main>
    );
  }

  const { readings, hymns } = liturgyData;

  const groupHymnsByMoment = (hymns: Hymn[]) => {
    const grouped: { [key: string]: Hymn[] } = {
      Entrance: [],
      Offertory: [],
      Communion: [],
      Recessional: [],
    };
    hymns.forEach(hymn => {
      if (grouped[hymn.liturgical_moment]) {
        grouped[hymn.liturgical_moment].push(hymn);
      } else {
        grouped[hymn.liturgical_moment] = [hymn];
      }
    });
    return grouped;
  };

  const groupedHymns = groupHymnsByMoment(hymns);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex justify-center mb-8">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-4 py-2 rounded-l-md ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageChange('es')}
          className={`px-4 py-2 rounded-r-md ${lang === 'es' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
        >
          Español
        </button>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center leading-tight">
        {lang === 'es' ? 'Lecturas y Cantos Litúrgicos Católicos' : 'Catholic Liturgical Readings & Hymns'}
      </h1>
      {liturgyData && liturgyData.date && !isNaN(new Date(liturgyData.date).getTime()) && (
        <p className="text-xl md:text-2xl text-center text-gray-700 dark:text-gray-300 mb-8">
          {lang === 'es' ? 'Domingo' : 'Sunday'}: {new Date(liturgyData.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}

      {/* Date Picker */}
      <div className="mb-8">
        <label htmlFor="date-picker" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'es' ? 'Seleccionar Fecha' : 'Select Date'}:
        </label>
        <input
          type="date"
          id="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          {lang === 'es' ? 'Lecturas Dominicales' : 'Sunday Readings'}
        </h2>
        <div className="space-y-6">
          {readings.map((reading, index) => (
            <ReadingCard key={index} {...reading} lang={lang} />
          ))}
        </div>
      </section>

      <section className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700 dark:text-green-400">
          {lang === 'es' ? 'Cantos Sugeridos' : 'Suggested Hymns'}
        </h2>
        <div className="space-y-8">
          {Object.entries(groupedHymns).map(([moment, hymnsForMoment]) => (
            hymnsForMoment.length > 0 && (
              <div key={moment} className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-400">{moment}</h3>
                <div className="space-y-6">
                  {hymnsForMoment.map((hymn, index) => (
                    <HymnCard key={index} {...hymn} lang={lang} />
                  ))
                }
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Comments Section */}
      <section className="w-full max-w-4xl mt-12 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          {lang === 'es' ? 'Comentarios' : 'Comments'}
        </h2>
        <div className="space-y-4 mb-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{comment.author} <span className="text-sm text-gray-500 dark:text-gray-400">({new Date(comment.timestamp).toLocaleString()})</span></p>
                <p className="text-gray-700 dark:text-gray-200">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{lang === 'es' ? 'No hay comentarios todavía. ¡Sé el primero en comentar!' : 'No comments yet. Be the first to comment!'}</p>
          )}
        </div>
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={lang === 'es' ? 'Tu nombre' : 'Your Name'}
            value={newCommentAuthor}
            onChange={(e) => setNewCommentAuthor(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <input
            type="email"
            placeholder={lang === 'es' ? 'Tu correo electrónico' : 'Your Email'}
            value={newCommentEmail}
            onChange={(e) => setNewCommentEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          />
          <div className="flex space-x-2">
            <select
              value={newCommentCountryCode}
              onChange={(e) => setNewCommentCountryCode(e.target.value)}
              className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.dial_code}>
                  {country.flag} {country.dial_code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder={lang === 'es' ? 'Número de teléfono' : 'Phone Number'}
              value={newCommentPhoneNumber}
              onChange={(e) => setNewCommentPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          <textarea
            placeholder={lang === 'es' ? 'Tu comentario' : 'Your Comment'}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={4}
            className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
          >
            {lang === 'es' ? 'Enviar Comentario' : 'Submit Comment'}
          </button>
        </form>
      </section>

      {/* Subscription Section */}
      <section className="w-full max-w-4xl mt-12 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">
          {lang === 'es' ? 'Apoya Nuestro Proyecto' : 'Support Our Project'}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
          {lang === 'es' ?
            'Si deseas colaborar con este proyecto para que llegue a más hermanos, puedes suscribirte donando $0.50 centavos de dólar al mes. ¡Gracias por tu colaboración y que Dios te bendiga y te lo multiplique!' :
            'If you wish to collaborate with this project so that it reaches more brothers and sisters, you can subscribe by donating $0.50. Thank you for your collaboration, and may God bless you and multiply it!'
          }
        </p>
        <button
          onClick={handleSubscribe}
          className="bg-green-600 text-white text-xl font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          {lang === 'es' ? 'Suscribirse y Donar $0.50' : 'Subscribe and Donate $0.50'}
        </button>
      </section>
    </main>
  );
}