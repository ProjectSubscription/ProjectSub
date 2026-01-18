import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingChannels } from '@/components/home/TrendingChannels';
import { NewContent } from '@/components/home/NewContent';
import { CategoryChannels } from '@/components/home/CategoryChannels';
import { getContents, getChannels } from '@/app/lib/api';
import { mockChannels } from '@/app/mockData';

export function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [newContents, setNewContents] = React.useState([]);
  const [trendingChannels, setTrendingChannels] = React.useState([]);
  const [filteredChannels, setFilteredChannels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const categories = [
    { id: 'all', name: '전체' },
    { id: '예술', name: '예술' },
    { id: '교육', name: '교육' },
    { id: '음악', name: '음악' },
    { id: '건강', name: '건강' },
    { id: '요리', name: '요리' },
    { id: '비즈니스', name: '비즈니스' }
  ];

  // 콘텐츠 목록 로드
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 최신 콘텐츠 조회 (생성일 기준 내림차순, 최대 4개)
        const contentsResponse = await getContents({
          page: 0,
          size: 4,
          sort: 'createdAt,DESC'
        });
        
        // Page 객체에서 content 배열 추출
        const contents = contentsResponse?.content || contentsResponse || [];
        setNewContents(contents);

        // 채널 목록 조회
        try {
          const channelsResponse = await getChannels();
          const channels = Array.isArray(channelsResponse) ? channelsResponse : [];
          setTrendingChannels(channels.slice(0, 6));
          setFilteredChannels(channels);
        } catch (err) {
          console.warn('채널 목록 조회 실패, mock 데이터 사용:', err);
          // 채널 API 실패 시 mock 데이터 사용
          setTrendingChannels(mockChannels.slice(0, 6));
          setFilteredChannels(mockChannels);
        }
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        // 에러 발생 시 빈 배열로 설정
        setNewContents([]);
        setTrendingChannels(mockChannels.slice(0, 6));
        setFilteredChannels(mockChannels);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 카테고리 변경 시 채널 필터링
  React.useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredChannels(trendingChannels.length > 0 ? trendingChannels : mockChannels);
    } else {
      const filtered = (trendingChannels.length > 0 ? trendingChannels : mockChannels)
        .filter(c => c.category === selectedCategory);
      setFilteredChannels(filtered);
    }
  }, [selectedCategory, trendingChannels]);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error && newContents.length === 0) {
    return <div className="text-center py-12 text-red-600">오류: {error}</div>;
  }

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
