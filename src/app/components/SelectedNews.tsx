"use client";

import { useEffect, useState } from 'react';
import { news } from '@/types';
import SelectedArticle from './SelectedArticle';

const SelectedNews = () => {
  const [selectedArticles, setSelectedArticles] = useState<news[]>([]);

  // Function to check if an article is from today
  const isArticleFromToday = (dateString: string) => {
    const articleDate = new Date(dateString);
    const today = new Date();
    return (
      articleDate.getFullYear() === today.getFullYear() &&
      articleDate.getMonth() === today.getMonth() &&
      articleDate.getDate() === today.getDate()
    );
  };

  const fetchAllNews = async () => {
    try {
      // Fetch all news with no limit
      const response = await fetch(`/api/news`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: news[] = await response.json();
      console.log('Fetched all news:', data); // Debug line

      // Filter news from today
      const todayNews = data.filter(article => isArticleFromToday(article.date_modify));

      // Sort articles by relevance (ascending) and date (most recent on top)
      const sortedData = todayNews.sort((a, b) => {
        const relevanceComparison = (parseInt(a.relevance) || 0) - (parseInt(b.relevance) || 0);
        if (relevanceComparison !== 0) return relevanceComparison;

        // If relevance is the same, sort by date (most recent first)
        return new Date(b.date_modify).getTime() - new Date(a.date_modify).getTime();
      });

      // Limit to top 10 articles
      const limitedData = sortedData.slice(0, 10);
      setSelectedArticles(limitedData);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const article = JSON.parse(e.dataTransfer.getData('article')) as news;
    // Add new article and sort by relevance (ascending order) and date (most recent first)
    setSelectedArticles(prev => {
      // Add new article
      const updatedArticles = [...prev, article];
      // Sort and limit to top 10
      const sortedArticles = updatedArticles.sort((a, b) => {
        const relevanceComparison = (parseInt(a.relevance) || 0) - (parseInt(b.relevance) || 0);
        if (relevanceComparison !== 0) return relevanceComparison;

        // If relevance is the same, sort by date (most recent first)
        return new Date(b.date_modify).getTime() - new Date(a.date_modify).getTime();
      });
      return sortedArticles.slice(0, 10);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="sticky top-0 w-[400px] h-[600px] border border-gray-300 p-4 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h2 className="text-xl font-bold mb-4">Notícias Selecionadas</h2>
      <ol className="list-decimal pl-5">
        {selectedArticles.length > 0 ? (
          selectedArticles.map((article, idx) => (
            <li key={`${article.title}-${idx}`} className="mb-2">
              <SelectedArticle data={article} onRemove={() => { /* Implement remove logic if needed */ }} />
            </li>
          ))
        ) : (
          <p>No articles available</p>
        )}
      </ol>
    </div>
  );
};

export default SelectedNews;
