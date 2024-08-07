// components/DraggableArticle.tsx

"use client";

import { news } from '@/types';
import Article from './Article';

interface DraggableArticleProps {
  article: news;
}

const DraggableArticle = ({ article }: DraggableArticleProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('article', JSON.stringify(article));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white border rounded-lg shadow-md overflow-hidden mb-4 p-4"
    >
      <Article data={article} />
    </div>
  );
};

export default DraggableArticle;
