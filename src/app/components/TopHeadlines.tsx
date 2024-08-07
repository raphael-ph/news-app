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
      if (relevance) queryParams.append('relevance', relevance);
      if (sentiment) queryParams.append('sentiment', sentiment);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`/api/news?${queryParams.toString()}&limit=0`); // Added limit of 10
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: news[] = await response.json();
      console.log('Fetched filtered news:', data); // Debug line

      // Sort by relevance (ascending) and date_publish (descending)
      data.sort((a, b) => {
        const relevanceDiff = parseInt(a.relevance) - parseInt(b.relevance);
        if (relevanceDiff !== 0) return relevanceDiff;
        return new Date(b.date_publish).getTime() - new Date(a.date_publish).getTime();
      });

      console.log('Sorted filtered news:', data); // Debug line
      setFilteredNews(data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchFilteredNews(relevance, sentiment, startDate, endDate);
  }, [relevance, sentiment, startDate, endDate]);

  const applyFilters = (relevance: string, sentiment: string, startDate: string, endDate: string) => {
    setRelevance(relevance);
    setSentiment(sentiment);
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div>
      <Filters onFilterChange={applyFilters} />
      <div className='flex flex-wrap gap-4'>
        {filteredNews.length > 0 ? (
          filteredNews.map((article, idx) => (
            <DraggableArticle key={`${article.title}-${idx}`} article={article} />
          ))
        ) : (
          <p>No articles available</p>
        )}
      </div>
    </div>
  );
};

export default TopHeadlines;
