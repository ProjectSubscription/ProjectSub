'use client';

import React from 'react';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { SubscriptionPlans } from '@/components/channel/SubscriptionPlans';
import { ChannelTabs } from '@/components/channel/ChannelTabs';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { ChannelAbout } from '@/components/channel/ChannelAbout';
import CouponList from '@/components/coupon/CouponList';
import { getChannel, getSubscriptionPlans, getMySubscriptions, getChannelCoupons } from '@/app/lib/api';
import { mockChannels, mockContents, mockReviews } from '@/app/mockData';

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
  const [coupons, setCoupons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 채널 정보 및 구독 상품 조회
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // channelId를 숫자로 변환 (문자열일 수 있음)
        const numericChannelId = Number(channelId);
        console.log('채널 ID:', channelId, '-> 숫자 변환:', numericChannelId);
        
        const [channelData, plansData, mySubscriptions, couponsData] = await Promise.all([
          getChannel(numericChannelId),
          getSubscriptionPlans(numericChannelId),
          getMySubscriptions().catch((err) => {
            console.warn('구독 목록 조회 실패:', err);
            return [];
          }),
          getChannelCoupons(numericChannelId).catch((err) => {
            console.error('쿠폰 목록 조회 실패:', err);
            console.error('에러 상세:', err.message, err);
            console.error('요청 URL:', `/api/channels/${numericChannelId}/coupons`);
            return [];
          })
        ]);

        setChannel(normalizeChannelDetail(channelId, channelData));
        setPlans(plansData || []);
        
        // 쿠폰 데이터 디버깅
        console.log('쿠폰 데이터:', couponsData);
        console.log('쿠폰 개수:', couponsData?.length || 0);
        console.log('쿠폰 타입:', Array.isArray(couponsData) ? '배열' : typeof couponsData);
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
        
        // 구독 상태 확인:
        // 1) 백엔드 상세 응답(subscribed)이 있으면 우선 사용
        // 2) 없으면 내 구독 목록으로 fallback
        if (typeof channelData?.subscribed === 'boolean') {
          setIsSubscribed(channelData.subscribed);
        } else {
          const hasActiveSubscription = (mySubscriptions || []).some(
            (sub: any) => sub.channelId === Number(channelId) && sub.status === 'ACTIVE'
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

      {/* 쿠폰 목록 - 크리에이터 정보와 구독 상품 사이 */}
      {coupons.length > 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">다운로드 가능한 쿠폰</h2>
          <CouponList
            coupons={coupons}
            onRefresh={async () => {
              try {
                const numericChannelId = Number(channelId);
                const refreshedCoupons = await getChannelCoupons(numericChannelId);
                console.log('쿠폰 새로고침 결과:', refreshedCoupons);
                setCoupons(Array.isArray(refreshedCoupons) ? refreshedCoupons : []);
              } catch (err) {
                console.error('쿠폰 목록 새로고침 실패:', err);
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-center">다운로드 가능한 쿠폰이 없습니다.</p>
        </div>
      )}

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
