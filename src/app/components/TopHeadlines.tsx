"use client";

import { useEffect, useState } from 'react';
import DraggableArticle from './DraggableArticle';
import Filters from './Filters';
import { news } from '@/types';

const TopHeadlines = () => {
  const [filteredNews, setFilteredNews] = useState<news[]>([]);
  const [relevance, setRelevance] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>(''); 
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchFilteredNews = async (relevance: string, sentiment: string, startDate: string, endDate: string) => {
    try {
      const queryParams = new URLSearchParams();
      if (relevance && relevance !== 'ALL') {
        queryParams.append('relevance', relevance);
      }
      if (sentiment && sentiment !== 'ALL') {
        queryParams.append('sentiment', sentiment);
      }
      if (startDate) {
        queryParams.append('startDate', startDate);
      }
      if (endDate) {
        queryParams.append('endDate', endDate);
      }

      const response = await fetch(`/api/news?${queryParams.toString()}`);
      const news = await response.json();
      setFilteredNews(news);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  useEffect(() => {
    fetchFilteredNews(relevance, sentiment, startDate, endDate);
  }, [relevance, sentiment, startDate, endDate]);

  // Handling filter changes and passing to Filters component
  const handleFilterChange = (relevance: string, sentiment: string, startDate: string, endDate: string) => {
    setRelevance(relevance);
    setSentiment(sentiment);
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div>
      <Filters onFilterChange={handleFilterChange} />
      <div>
        {filteredNews.map((article) => (
          <DraggableArticle key={article.session_id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default TopHeadlines;
