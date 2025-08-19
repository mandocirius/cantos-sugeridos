import React from 'react';

interface ReadingCardProps {
  type: string;
  title_en: string;
  title_es: string;
  reference: string;
  text: string;
  lang: 'en' | 'es';
}

const ReadingCard: React.FC<ReadingCardProps> = ({ type, title_en, title_es, reference, text, lang }) => {
  const displayTitle = lang === 'es' ? title_es : title_en;
  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-zinc-800 dark:border-neutral-700">
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{type}</h3>
      {displayTitle && <h4 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">{displayTitle}</h4>}
      <p className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">{lang === 'es' ? 'Referencia' : 'Reference'}: {reference}</p>
      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{text}</p>
    </div>
  );
};

export default ReadingCard;
