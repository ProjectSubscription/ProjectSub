import React from 'react';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { SubscriptionPlans } from '@/components/channel/SubscriptionPlans';
import { ChannelTabs } from '@/components/channel/ChannelTabs';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { ChannelAbout } from '@/components/channel/ChannelAbout';
import { getChannel, getSubscriptionPlans, getMySubscriptions } from '@/app/lib/api';
import { useUser } from '@/app/lib/UserContext';
import { mockChannels, mockContents, mockReviews } from '@/app/mockData';

export function ChannelDetailPage({ channelId, onNavigate }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [channel, setChannel] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [channelContents, setChannelContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { currentUser } = useUser();

  // 사용자 정보 및 채널 정보 조회
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 사용자 정보는 Context에서 가져옴
        const userInfo = currentUser;

        // 채널 정보 및 구독 상품 조회
        const [channelData, plansData] = await Promise.all([
          getChannel(channelId),
          getSubscriptionPlans(channelId),
        ]);

        setChannel(channelData);
        setPlans(plansData || []);
        
        // 구독 상태 확인 (로그인한 경우만)
        if (userInfo) {
          try {
            const mySubscriptions = await getMySubscriptions();
            const hasActiveSubscription = mySubscriptions?.some(
              sub => sub.channelId === Number(channelId) && sub.status === 'ACTIVE'
            );
            setIsSubscribed(hasActiveSubscription);
          } catch (subErr) {
            // 구독 목록 조회 실패 - 구독하지 않은 것으로 처리
            console.log('구독 목록 조회 실패:', subErr.message);
            setIsSubscribed(false);
          }
        } else {
          setIsSubscribed(false);
        }

        // 임시로 mockContents 사용 (콘텐츠 API 연동 필요 시 수정)
        const contents = mockContents.filter(c => c.channelId === channelId);
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
  }, [channelId, currentUser]);

  const handleSubscribe = async (planId) => {
    // 로그인 상태 확인
    if (!currentUser) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      const redirectUrl = `/channels/${channelId}`;
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = loginUrl;
      return;
    }
    
    // 로그인한 경우 결제 페이지로 이동
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
