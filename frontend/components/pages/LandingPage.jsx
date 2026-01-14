import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PopularChannelsSection } from '@/components/landing/PopularChannelsSection';
import { FreeContentSection } from '@/components/landing/FreeContentSection';
import { CategoryRankingSection } from '@/components/landing/CategoryRankingSection';
import { CTASection } from '@/components/landing/CTASection';
import { mockChannels, mockContents } from '@/app/mockData';

export function LandingPage({ onNavigate }) {
  const popularChannels = mockChannels.slice(0, 4);
  const freeContents = mockContents.filter(c => c.accessType === 'FREE').slice(0, 3);
  
  // 카테고리 목록 추출
  const categories = [...new Set(mockChannels.map(ch => ch.category))];
  
  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0] || '');
  
  // 카테고리별 콘텐츠 랭킹 생성
  const getCategoryRanking = (category) => {
    // 해당 카테고리의 채널 ID들 찾기
    const categoryChannelIds = mockChannels
      .filter(ch => ch.category === category)
      .map(ch => ch.id);
    
    // 해당 카테고리의 콘텐츠들을 조회수 기준으로 정렬
    const categoryContents = mockContents
      .filter(content => categoryChannelIds.includes(content.channelId))
      .map(content => {
        const channel = mockChannels.find(ch => ch.id === content.channelId);
        return {
          ...content,
          creatorName: channel?.creatorName || '',
          category: channel?.category || ''
        };
      })
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);
    
    return categoryContents;
  };
  
  const rankingContents = getCategoryRanking(selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onNavigate={onNavigate} />
      <FeaturesSection />
      <PopularChannelsSection channels={popularChannels} onNavigate={onNavigate} />
      <FreeContentSection contents={freeContents} onNavigate={onNavigate} />
      <CategoryRankingSection
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        rankingContents={rankingContents}
        onNavigate={onNavigate}
      />
      <CTASection onNavigate={onNavigate} />
    </div>
  );
}
