 'use client';

import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingChannels } from '@/components/home/TrendingChannels';
import { NewContent } from '@/components/home/NewContent';
import { PopularContent } from '@/components/home/PopularContent';
import { CategoryChannels } from '@/components/home/CategoryChannels';
import { TopReviews } from '@/components/home/TopReviews';
import { getChannels, getContents, getChannelCategories, getTopReviews, getReviews } from '@/app/lib/api';

function toChannelCard(dto, categoryNameById) {
  // 백엔드 ChannelListResponse: { channelId, title, description, category, subscriberCount }
  return {
    id: dto?.channelId,
    name: dto?.title ?? '',
    description: dto?.description ?? '',
    category: categoryNameById?.[dto?.category] ?? dto?.category ?? '',
    subscriberCount: dto?.subscriberCount ?? 0,
    thumbnailUrl: dto?.thumbnailUrl ?? null,
    creatorName: '', // 백엔드 목록 응답에 creatorName/thumbnail이 없어 임시값
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

export function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [channels, setChannels] = React.useState([]);
  const [trendingChannels, setTrendingChannels] = React.useState([]);
  const [loadingChannels, setLoadingChannels] = React.useState(true);
  const [channelError, setChannelError] = React.useState(null);
  const [newContents, setNewContents] = React.useState([]);
  const [loadingContents, setLoadingContents] = React.useState(true);
  const [popularContents, setPopularContents] = React.useState([]);
  const [loadingPopularContents, setLoadingPopularContents] = React.useState(true);
  const [topReviews, setTopReviews] = React.useState([]);
  const [loadingTopReviews, setLoadingTopReviews] = React.useState(true);
  const [categoryOptions, setCategoryOptions] = React.useState([{ id: 'all', name: '전체' }]);

  const categoryNameById = React.useMemo(() => {
    return Object.fromEntries(
      categoryOptions
        .filter((c) => c.id !== 'all')
        .map((c) => [c.id, c.name])
    );
  }, [categoryOptions]);

  React.useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const categories = await getChannelCategories();
        if (cancelled) return;
        setCategoryOptions([{ id: 'all', name: '전체' }, ...(categories || [])]);
      } catch {
        if (!cancelled) {
          setCategoryOptions([{ id: 'all', name: '전체' }]);
        }
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // 최신 콘텐츠
  React.useEffect(() => {
    let cancelled = false;

    const fetchNewContents = async () => {
      try {
        setLoadingContents(true);
        const response = await getContents({ 
          sort: 'createdAt,desc', 
          size: 4,
          page: 0
        });
        const items = response?.content ?? [];
        
        // 발행된 콘텐츠만 필터링 (publishedAt이 null이 아니고 현재 시점 이전인 것만)
        const now = new Date();
        const publishedItems = items.filter(content => {
          if (!content.publishedAt) return false;
          const publishedAt = new Date(content.publishedAt);
          return publishedAt <= now;
        });
        
        if (!cancelled) setNewContents(publishedItems);
      } catch (e) {
        if (!cancelled) {
          setNewContents([]);
        }
      } finally {
        if (!cancelled) setLoadingContents(false);
      }
    };

    fetchNewContents();
    return () => {
      cancelled = true;
    };
  }, []);

  // 인기 콘텐츠 (좋아요 수 순)
  React.useEffect(() => {
    let cancelled = false;

    const fetchPopularContents = async () => {
      try {
        setLoadingPopularContents(true);
        const response = await getContents({ 
          sort: 'likeCount,desc', 
          size: 12,
          page: 0
        });
        const items = response?.content ?? [];
        
        // 발행된 콘텐츠만 필터링 (publishedAt이 null이 아니고 현재 시점 이전인 것만)
        const now = new Date();
        const publishedItems = items.filter(content => {
          if (!content.publishedAt) return false;
          const publishedAt = new Date(content.publishedAt);
          return publishedAt <= now;
        });
        
        if (!cancelled) setPopularContents(publishedItems);
      } catch (e) {
        if (!cancelled) {
          setPopularContents([]);
        }
      } finally {
        if (!cancelled) setLoadingPopularContents(false);
      }
    };

    fetchPopularContents();
    return () => {
      cancelled = true;
    };
  }, []);

  // 인기 채널
  React.useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      try {
        const page = await getChannels({ sort: 'popular', size: 6 });
        const items = (page?.content ?? [])
          .map((dto) => toChannelCard(dto, categoryNameById))
          .filter((c) => c.id != null);
        const enriched = await attachReviewSummary(items);
        if (!cancelled) setTrendingChannels(enriched);
      } catch (e) {
        // 인기 섹션은 실패해도 전체 화면을 막지 않음
        if (!cancelled) setTrendingChannels([]);
      }
    };

    fetchTrending();
    return () => {
      cancelled = true;
    };
  }, [categoryNameById]);

  // 카테고리(전체 포함) 채널 목록
  React.useEffect(() => {
    let cancelled = false;

    const fetchChannels = async () => {
      try {
        setLoadingChannels(true);
        setChannelError(null);

        const params = { size: 50 };
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory; // 백엔드는 enum 문자열을 기대
        }

        const page = await getChannels(params);
        const items = (page?.content ?? [])
          .map((dto) => toChannelCard(dto, categoryNameById))
          .filter((c) => c.id != null);
        if (!cancelled) setChannels(items);
      } catch (e) {
        if (!cancelled) {
          setChannels([]);
          setChannelError(e?.message || '채널 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoadingChannels(false);
      }
    };

    fetchChannels();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, categoryNameById]);

  // 가장 추천이 많은 리뷰 조회
  React.useEffect(() => {
    let cancelled = false;

    const fetchTopReviews = async () => {
      try {
        setLoadingTopReviews(true);
        const reviews = await getTopReviews(5);
        if (!cancelled) setTopReviews(reviews || []);
      } catch (e) {
        if (!cancelled) {
          setTopReviews([]);
        }
      } finally {
        if (!cancelled) setLoadingTopReviews(false);
      }
    };

    fetchTopReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <HeroBanner onNavigate={onNavigate} />
      {trendingChannels.length > 0 && (
        <TrendingChannels channels={trendingChannels} onNavigate={onNavigate} />
      )}
      {loadingContents ? (
        <div className="text-center py-8 text-gray-600">최신 콘텐츠를 불러오는 중...</div>
      ) : newContents.length > 0 ? (
        <NewContent contents={newContents} onNavigate={onNavigate} />
      ) : null}
      {loadingPopularContents ? (
        <div className="text-center py-8 text-gray-600">인기 콘텐츠를 불러오는 중...</div>
      ) : popularContents.length > 0 ? (
        <PopularContent contents={popularContents} onNavigate={onNavigate} />
      ) : null}
      {loadingChannels && (
        <div className="text-center -mt-6 text-gray-600">채널을 불러오는 중...</div>
      )}
      {channelError && (
        <div className="text-center -mt-6 text-red-600">{channelError}</div>
      )}
      <CategoryChannels
        categories={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        channels={channels}
        onNavigate={onNavigate}
      />
      {loadingTopReviews ? (
        <div className="text-center py-8 text-gray-600">인기 후기를 불러오는 중...</div>
      ) : (
        <TopReviews reviews={topReviews} onNavigate={onNavigate} />
      )}
    </div>
  );
}
