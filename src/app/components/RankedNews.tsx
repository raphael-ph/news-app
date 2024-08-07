"use client";

import { useEffect, useState } from 'react';
import DraggableArticle from './DraggableArticle';
import { news } from '@/types';

const RankedNews = () => {
  const [rankedNews, setRankedNews] = useState<news[]>([]);

  const fetchRankedNews = async () => {
    try {
      const response = await fetch(`/api/news?limit=10`); // Fetch news with limit
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: news[] = await response.json();
      console.log('Fetched news:', data); // Debug line

      // Sort by relevance (ascending) and date_publish (descending)
      data.sort((a, b) => {
        const relevanceDiff = parseInt(a.relevance) - parseInt(b.relevance);
        if (relevanceDiff !== 0) return relevanceDiff;
        return new Date(b.date_publish).getTime() - new Date(a.date_publish).getTime();
      });

      console.log('Sorted news:', data); // Debug line
      setRankedNews(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchRankedNews();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Top 10 Ranked News</h2>
      <div className='flex flex-wrap gap-4'>
        {rankedNews.length > 0 ? (
          rankedNews.map((article, idx) => (
            <DraggableArticle key={`${article.title}-${idx}`} article={article} />
          ))
        ) : (
          <p>No ranked articles available</p>
        )}
      </div>
    </div>
  );
};

export default RankedNews;
