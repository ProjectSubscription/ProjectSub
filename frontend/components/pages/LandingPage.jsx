'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PopularChannelsSection } from '@/components/landing/PopularChannelsSection';
import { FreeContentSection } from '@/components/landing/FreeContentSection';
import { CategoryRankingSection } from '@/components/landing/CategoryRankingSection';
import { CTASection } from '@/components/landing/CTASection';
import { useAuth } from '@/components/auth/AuthContext';
import { getChannels, getContents, getChannelCategories, getReviews } from '@/app/lib/api';

const DEFAULT_CONTENT_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800&auto=format&fit=crop&q=60';

function toChannelCard(dto, categoryNameById) {
  return {
    id: dto?.channelId,
    name: dto?.title ?? '',
    description: dto?.description ?? '',
    category: categoryNameById?.[dto?.category] ?? dto?.category ?? '',
    subscriberCount: dto?.subscriberCount ?? 0,
    thumbnailUrl: dto?.thumbnailUrl ?? null,
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

async function summarizeChannelReviews(channelId, maxContents = 10) {
  const contentsResponse = await getContents({ channelId, size: maxContents, page: 0 });
  const contents = contentsResponse?.content || [];
  const contentIds = contents
    .map((content) => content.contentId || content.id)
    .filter((id) => id !== undefined && id !== null);

  if (contentIds.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const reviewLists = await Promise.all(
    contentIds.map((contentId) =>
      getReviews(contentId).catch(() => [])
    )
  );
  const reviews = reviewLists.flat();
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + (review?.rating ?? 0), 0) / reviewCount
    : 0;

  return { averageRating, reviewCount };
}

async function attachReviewSummary(channels) {
  const summaries = await Promise.all(
    channels.map(async (channel) => {
      try {
        const summary = await summarizeChannelReviews(channel.id);
        return { ...channel, ...summary };
      } catch {
        return { ...channel, averageRating: 0, reviewCount: 0 };
      }
    })
  );

  return summaries;
}

export function LandingPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const isAuthenticated = Boolean(currentUser);

  const [popularChannels, setPopularChannels] = React.useState([]);
  const [freeContents, setFreeContents] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [rankingContents, setRankingContents] = React.useState([]);
  const [categoryOptions, setCategoryOptions] = React.useState([]);

  // 로그아웃/로그인 관계없이 "실존 데이터"만 표시되도록 랜딩도 백엔드 API 사용
  React.useEffect(() => {
    let cancelled = false;

    const fetchLandingData = async () => {
      try {
        const [categoryList, popularPage, allChannelsPage, contentsPage] = await Promise.all([
          getChannelCategories(),
          getChannels({ sort: 'popular', size: 4 }),
          getChannels({ size: 100 }),
          getContents({ size: 200 }),
        ]);

        if (!cancelled) setCategoryOptions(categoryList || []);
        const categoryMap = Object.fromEntries((categoryList || []).map((c) => [c.id, c.name]));

        const popular = (popularPage?.content ?? [])
          .map((dto) => toChannelCard(dto, categoryMap))
          .filter((c) => c.id != null);
        const allChannels = (allChannelsPage?.content ?? [])
          .map((dto) => toChannelCard(dto, categoryMap))
          .filter((c) => c.id != null);

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

        const enrichedPopular = await attachReviewSummary(popular);

        if (cancelled) return;
        setPopularChannels(enrichedPopular);
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
