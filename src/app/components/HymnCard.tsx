import React from 'react';

interface HymnCardProps {
  title: string;
  liturgical_moment: string;
  lyrics: string;
  chords: string;
  video_url?: string;
  pdf_url?: string;
  lang: 'en' | 'es';
}

const HymnCard: React.FC<HymnCardProps> = ({ title, liturgical_moment, lyrics, chords, video_url, pdf_url, lang }) => {
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|youtu\.be\/)([\w-]{11}))/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : '';
  };

  const embedUrl = video_url ? getYouTubeEmbedUrl(video_url) : '';

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-zinc-800 dark:border-neutral-700">
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">{lang === 'es' ? 'Momento' : 'Moment'}: {liturgical_moment}</p>
      
      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-white">{lang === 'es' ? 'Letra' : 'Lyrics'}:</h4>
      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line mb-4">{lyrics}</p>

      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-white">{lang === 'es' ? 'Acordes' : 'Chords'}:</h4>
      <pre className="bg-gray-100 dark:bg-zinc-700 p-3 rounded-md text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm mb-4">{chords}</pre>

      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{lang === 'es' ? 'Video' : 'Video'}:</h4>
        {embedUrl ? (
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-md"
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">{lang === 'es' ? 'No disponible' : 'Not available'}</p>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{lang === 'es' ? 'Partitura (PDF)' : 'Sheet Music (PDF)'}:</h4>
        {pdf_url ? (
          <div className="relative" style={{ paddingBottom: '100%', height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-md"
              src={pdf_url}
              title={`${title} PDF`}
              frameBorder="0"
            ></iframe>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">{lang === 'es' ? 'No disponible' : 'Not available'}</p>
        )}
      </div>
    </div>
  );
};

export default HymnCard;
