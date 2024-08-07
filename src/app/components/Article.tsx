import { useState } from 'react';
import { news } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import Tag from './Tag';

const MAX_DESCRIPTION_LINES = 3;
const MAX_SUMMARY_LINES = 3;

const Article = ({ data }: { data: news }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tagsArray = typeof data?.tags === 'string' ? data.tags.split(',') : [];

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className='p-6 border rounded-lg shadow-md max-w-2xl'>
      <div className='relative w-full h-[200px]'>
        <Image
          src={`${data?.top_image !== null ? data?.top_image : '/img/news-u-logo.webp'}`}
          alt={data?.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 100vw"
          className='object-cover'
        />
      </div>
      <Link href={data?.news_url} legacyBehavior>
        <a target="_blank" className='font-bold text-lg mb-3 block'>
          {data?.title}
        </a>
      </Link>
      <div className='flex flex-wrap space-x-2 my-3'>
        <Tag data={data?.source_domain} />
        <Tag data={new Date(data?.date_publish).toDateString()} />
        <Tag data={data?.relevance} />
        <Tag data={data?.sentiment} />
      </div>
      <p
        className={`text-sm mb-3 ${!isExpanded ? 'line-clamp-3' : ''}`}
        style={{ maxHeight: isExpanded ? 'none' : '4.8em' }} // Approximately 3 lines
      >
        {data?.description}
      </p>
      {data?.description && data?.description.length > 200 && (
        <button
          onClick={handleToggle}
          className='text-blue-500 underline'
        >
          {isExpanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
      <p
        className={`text-sm mb-4 ${!isExpanded ? 'line-clamp-3' : ''}`}
        style={{ maxHeight: isExpanded ? 'none' : '4.8em' }} // Approximately 3 lines
      >
        {data?.summary}
      </p>
      {data?.summary && data?.summary.length > 200 && (
        <button
          onClick={handleToggle}
          className='text-blue-500 underline'
        >
          {isExpanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
      <div className='flex flex-wrap space-x-2'>
        {tagsArray.map(tag => (
          <Tag key={tag} data={tag} />
        ))}
      </div>
    </div>
  );
};

export default Article;
