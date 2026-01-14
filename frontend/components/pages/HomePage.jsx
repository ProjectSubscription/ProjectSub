import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingChannels } from '@/components/home/TrendingChannels';
import { NewContent } from '@/components/home/NewContent';
import { CategoryChannels } from '@/components/home/CategoryChannels';
import { mockChannels, mockContents } from '@/app/mockData';

export function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = [
    { id: 'all', name: '전체' },
    { id: '예술', name: '예술' },
    { id: '교육', name: '교육' },
    { id: '음악', name: '음악' },
    { id: '건강', name: '건강' },
    { id: '요리', name: '요리' },
    { id: '비즈니스', name: '비즈니스' }
  ];

  const trendingChannels = mockChannels.slice(0, 6);
  const newContents = mockContents.slice(0, 4);
  const filteredChannels = selectedCategory === 'all' 
    ? mockChannels 
    : mockChannels.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-12 pb-12">
      <HeroBanner onNavigate={onNavigate} />
      <TrendingChannels channels={trendingChannels} onNavigate={onNavigate} />
      <NewContent contents={newContents} onNavigate={onNavigate} />
      <CategoryChannels
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        channels={filteredChannels}
        onNavigate={onNavigate}
      />
    </div>
  );
}
