// components/SelectedArticle.tsx

import { news } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface SelectedArticleProps {
  data: news;
  onRemove: (article: news) => void;
}

const SelectedArticle = ({ data, onRemove }: SelectedArticleProps) => {
  return (
    <div className='flex items-center border-b border-gray-300 py-2 mb-2'>
      <div className='relative w-[100px] h-[75px] mr-4'>
        <Image
          src={data?.top_image || '/img/news-u-logo.webp'}
          alt={data?.title}
          fill
          className='object-cover'
        />
      </div>
      <div className='flex-1'>
        <Link href={data?.news_url} legacyBehavior>
          <a target="_blank" className='text-sm font-semibold'>{data?.title}</a>
        </Link>
      </div>
    </div>
  );
};

export default SelectedArticle;
