'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PopularChannelsSection } from '@/components/landing/PopularChannelsSection';
import { FreeContentSection } from '@/components/landing/FreeContentSection';
import { CategoryRankingSection } from '@/components/landing/CategoryRankingSection';
import { CTASection } from '@/components/landing/CTASection';
import { useAuth } from '@/components/auth/AuthContext';
import { getChannels, getContents } from '@/app/lib/api';

const CATEGORY_DISPLAY_NAME_BY_ENUM = {
  ECONOMY_BUSINESS: '경제/비즈니스',
  FINANCE: '재테크',
  REAL_ESTATE: '부동산',
  BOOK_PUBLISHING: '책/작가/출판사',
  HOBBY_PRACTICAL: '취미/실용',
  EDUCATION: '교육/학습',
  SELF_DEVELOPMENT: '자기개발/취업',
  CULTURE_ART: '문화/예술',
  TREND_LIFE: '트렌드/라이프',
};

const DEFAULT_CHANNEL_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60';
const DEFAULT_CONTENT_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800&auto=format&fit=crop&q=60';

function toChannelCard(dto) {
  return {
    id: dto?.channelId,
    name: dto?.title ?? '',
    description: dto?.description ?? '',
    category: CATEGORY_DISPLAY_NAME_BY_ENUM[dto?.category] ?? dto?.category ?? '',
    subscriberCount: dto?.subscriberCount ?? 0,
    thumbnailUrl: DEFAULT_CHANNEL_THUMBNAIL_URL,
    creatorName: '',
  };
}

function toLandingContentCard(dto, channelCategoryById) {
  // 백엔드 ContentListResponseDTO: { contentId, channelId, title, accessType, viewCount, likeCount, ... }
  const channelId = dto?.channelId;
  return {
    id: dto?.contentId,
    channelId,
    title: dto?.title ?? '',
    description: '',
    thumbnailUrl: DEFAULT_CONTENT_THUMBNAIL_URL,
    accessType: dto?.accessType ?? 'FREE',
    viewCount: dto?.viewCount ?? 0,
    likeCount: dto?.likeCount ?? 0,
    creatorName: '',
    category: channelCategoryById?.get?.(channelId) ?? '',
  };
}

export function LandingPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const isAuthenticated = Boolean(currentUser);

  const [popularChannels, setPopularChannels] = React.useState([]);
  const [freeContents, setFreeContents] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [rankingContents, setRankingContents] = React.useState([]);

  // 로그아웃/로그인 관계없이 "실존 데이터"만 표시되도록 랜딩도 백엔드 API 사용
  React.useEffect(() => {
    let cancelled = false;

    const fetchLandingData = async () => {
      try {
        const [popularPage, allChannelsPage, contentsPage] = await Promise.all([
          getChannels({ sort: 'popular', size: 4 }),
          getChannels({ size: 100 }),
          getContents({ size: 200 }),
        ]);

        const popular = (popularPage?.content ?? []).map(toChannelCard).filter((c) => c.id != null);
        const allChannels = (allChannelsPage?.content ?? []).map(toChannelCard).filter((c) => c.id != null);

        const channelCategoryById = new Map(
          allChannels.map((c) => [c.id, c.category])
        );

        const contentCards = (contentsPage?.content ?? [])
          .map((dto) => toLandingContentCard(dto, channelCategoryById))
          .filter((c) => c.id != null);

        const derivedCategories = [
          ...new Set(allChannels.map((c) => c.category).filter(Boolean)),
        ];

        const initialCategory = derivedCategories[0] ?? '';

        if (cancelled) return;
        setPopularChannels(popular);
        setFreeContents(contentCards.filter((c) => c.accessType === 'FREE').slice(0, 3));
        setCategories(derivedCategories);
        setSelectedCategory((prev) => prev || initialCategory);
      } catch (e) {
        // 랜딩은 실패해도 페이지가 깨지지 않도록 빈 상태로 유지
        if (cancelled) return;
        setPopularChannels([]);
        setFreeContents([]);
        setCategories([]);
        setSelectedCategory('');
        setRankingContents([]);
      }
    };

    fetchLandingData();
    return () => {
      cancelled = true;
    };
  }, []);

  // 선택 카테고리 변경 시 랭킹 계산(이미 받아온 rankingContents가 없다면 비워둠)
  React.useEffect(() => {
    // 현재 구현은 content API/채널 카테고리 조합으로 랭킹을 만들기 어려운 필드(creatorName/description)가 빠져있어,
    // 카테고리 랭킹 섹션은 카테고리가 없으면 비워둔다.
    // (추후 백엔드에서 콘텐츠에 description/creatorName/thumbnailUrl 제공 시 강화 가능)
    if (!selectedCategory) {
      setRankingContents([]);
      return;
    }
    // rankingContents는 fetchLandingData에서 콘텐츠를 더 풍부하게 만들 수 있을 때 확장 예정
    setRankingContents((prev) => prev);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onNavigate={onNavigate} isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      <PopularChannelsSection channels={popularChannels} onNavigate={onNavigate} isAuthenticated={isAuthenticated} />
      <FreeContentSection contents={freeContents} onNavigate={onNavigate} isAuthenticated={isAuthenticated} />
      {categories.length > 0 && rankingContents.length > 0 && (
        <CategoryRankingSection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          rankingContents={rankingContents}
          onNavigate={onNavigate}
          isAuthenticated={isAuthenticated}
        />
      )}
      <CTASection onNavigate={onNavigate} isAuthenticated={isAuthenticated} />
    </div>
  );
}
