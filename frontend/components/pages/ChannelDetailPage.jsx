'use client';

import React from 'react';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { SubscriptionPlans } from '@/components/channel/SubscriptionPlans';
import { ChannelTabs } from '@/components/channel/ChannelTabs';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { ChannelAbout } from '@/components/channel/ChannelAbout';
import { getChannel, getSubscriptionPlans, getMySubscriptions } from '@/app/lib/api';
import { mockContents, mockReviews } from '@/app/mockData';

const DEFAULT_CHANNEL_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=60';

function normalizeChannelDetail(channelId, dto) {
  // 백엔드 ChannelDetailResponse: { channelName, channelDescription, subscriberCount, subscribed }
  // UI에서 기대하는 형태로 최소 매핑
  const name = dto?.channelName ?? dto?.name ?? dto?.title ?? '';
  const description = dto?.channelDescription ?? dto?.description ?? '';

  return {
    id: Number(channelId),
    name,
    description,
    subscriberCount: dto?.subscriberCount ?? 0,
    // 백엔드 상세 응답에 category/creatorName/thumbnail이 없어 임시값 사용
    category: '',
    creatorName: '',
    thumbnailUrl: DEFAULT_CHANNEL_THUMBNAIL_URL,
  };
}

export function ChannelDetailPage({ channelId, onNavigate }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [channel, setChannel] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [channelContents, setChannelContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 채널 정보 및 구독 상품 조회
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [channelData, plansData, mySubscriptions] = await Promise.all([
          getChannel(channelId),
          getSubscriptionPlans(channelId),
          getMySubscriptions().catch(() => []) // 구독 목록은 실패해도 계속 진행
        ]);

        setChannel(normalizeChannelDetail(channelId, channelData));
        setPlans(plansData || []);
        
        // 구독 상태 확인: 백엔드 상세 응답(subscribed)을 우선 사용, 없으면 내 구독 목록으로 fallback
        if (typeof channelData?.subscribed === 'boolean') {
          setIsSubscribed(channelData.subscribed);
        } else {
          const hasActiveSubscription = mySubscriptions?.some(
            sub => sub.channelId === Number(channelId) && sub.status === 'ACTIVE'
          );
          setIsSubscribed(Boolean(hasActiveSubscription));
        }

        // 임시로 mockContents 사용 (콘텐츠 API 연동 필요 시 수정)
        // channelId가 숫자 경로로 바뀌었기 때문에, mock 데이터(채널 id가 'channel-1')와는 매칭되지 않을 수 있음
        const contents = mockContents.filter(c => String(c.channelId) === String(channelId));
        setChannelContents(contents);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchData();
    }
  }, [channelId]);

  const handleSubscribe = (planId) => {
    onNavigate('payment', { type: 'subscription', planId, channelId });
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">오류: {error}</div>;
  }

  if (!channel) {
    return <div className="text-center py-12">채널을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        onSubscribeToggle={() => setIsSubscribed(!isSubscribed)}
      />

      {!isSubscribed && (
        <SubscriptionPlans plans={plans} onSubscribe={handleSubscribe} />
      )}

      <ChannelTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        contentCount={channelContents.length}
      />

      {activeTab === 'content' && (
        <ContentGrid
          contents={channelContents}
          isSubscribed={isSubscribed}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === 'about' && (
        <ChannelAbout
          channel={channel}
          contentCount={channelContents.length}
          reviews={mockReviews}
        />
      )}
    </div>
  );
}
