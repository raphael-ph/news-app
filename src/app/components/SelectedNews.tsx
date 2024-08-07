"use client";

import { useEffect, useState } from 'react';
import { news } from '@/types';
import SelectedArticle from './SelectedArticle';

const SelectedNews = () => {
  const [selectedArticles, setSelectedArticles] = useState<news[]>([]);

  const fetchAllNews = async () => {
    try {
      // Fetch all news with no limit
      const response = await fetch(`/api/news`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: news[] = await response.json();
      console.log('Fetched all news:', data); // Debug line
      setSelectedArticles(data);
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
    setSelectedArticles(prev => [...prev, article]);
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
