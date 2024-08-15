"use client";

import { useState } from 'react';

interface FiltersProps {
  onFilterChange: (
    relevance: string,
    sentiment: string,
    startDate: string,
    endDate: string
  ) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [relevance, setRelevance] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>(''); 
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleFilterChange = () => {
    const filteredRelevance = relevance || 'ALL';
    const filteredSentiment = sentiment || 'ALL'; 

    const formatDateTime = (dateTime: string) => {
      if (!dateTime) return '';
      const [date, time] = dateTime.split('T');
      return `${date} ${time}:00`;
    };

    const formattedStartDate = formatDateTime(startDate);
    const formattedEndDate = formatDateTime(endDate);

    console.log('Filtered values:', {
      filteredRelevance,
      filteredSentiment,
      formattedStartDate,
      formattedEndDate,
    });

    onFilterChange(filteredRelevance, filteredSentiment, formattedStartDate, formattedEndDate);
  };

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Relevance</label>
          <select
            value={relevance}
            onChange={(e) => setRelevance(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sentiment</label>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
      </div>
      <button
        onClick={handleFilterChange}
        className="self-start bg-blue-500 text-white py-2 px-4 rounded-md"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default Filters;
