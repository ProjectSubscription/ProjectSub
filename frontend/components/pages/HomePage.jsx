 'use client';

import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingChannels } from '@/components/home/TrendingChannels';
import { NewContent } from '@/components/home/NewContent';
import { CategoryChannels } from '@/components/home/CategoryChannels';
import { getChannels, getContents, getChannelCategories } from '@/app/lib/api';

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

export function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [channels, setChannels] = React.useState([]);
  const [trendingChannels, setTrendingChannels] = React.useState([]);
  const [loadingChannels, setLoadingChannels] = React.useState(true);
  const [channelError, setChannelError] = React.useState(null);
  const [newContents, setNewContents] = React.useState([]);
  const [loadingContents, setLoadingContents] = React.useState(true);
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
        if (!cancelled) setNewContents(items);
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

  // 인기 채널
  React.useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      try {
        const page = await getChannels({ sort: 'popular', size: 6 });
        const items = (page?.content ?? [])
          .map((dto) => toChannelCard(dto, categoryNameById))
          .filter((c) => c.id != null);
        if (!cancelled) setTrendingChannels(items);
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
    </div>
  );
}
