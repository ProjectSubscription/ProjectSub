'use client';

import React from 'react';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { SubscriptionPlans } from '@/components/channel/SubscriptionPlans';
import { ChannelTabs } from '@/components/channel/ChannelTabs';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { ChannelAbout } from '@/components/channel/ChannelAbout';
import CouponList from '@/components/coupon/CouponList';
import { getChannel, getSubscriptionPlans, getMySubscriptions, getChannelCoupons, getContents, getReviews, cancelSubscription } from '@/app/lib/api';
import { mockReviews } from '@/app/mockData';

function normalizeChannelDetail(channelId, dto) {
  // 백엔드 ChannelDetailResponse: { creatorId, creatorName, channelName, channelDescription, subscriberCount, subscribed }
  // UI에서 기대하는 형태로 최소 매핑
  const name = dto?.channelName ?? dto?.name ?? dto?.title ?? '';
  const description = dto?.channelDescription ?? dto?.description ?? '';
  const thumbnailUrl =
    dto?.thumbnailUrl ?? dto?.profileImageUrl ?? dto?.profileImage ?? null;

  return {
    id: Number(channelId),
    creatorId: dto?.creatorId ?? null,
    creatorName: dto?.creatorName ?? dto?.creatorNickname ?? '',
    name,
    description,
    subscriberCount: dto?.subscriberCount ?? 0,
    // 백엔드 상세 응답에 category/creatorName/thumbnail이 없어 임시값 사용
    category: '',
    thumbnailUrl,
  };
}

export function ChannelDetailPage({ channelId, onNavigate }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [currentSubscription, setCurrentSubscription] = React.useState(null); // 구독 정보 (ID, 시작일 등)
  const [channel, setChannel] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [channelContents, setChannelContents] = React.useState([]);
  const [channelReviews, setChannelReviews] = React.useState([]);
  const [reviewSummary, setReviewSummary] = React.useState({ averageRating: 0, reviewCount: 0 });
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
        let activeSubscription = null;

        if (typeof channelData?.subscribed === 'boolean') {
          setIsSubscribed(channelData.subscribed);
          // 구독 중인 경우 구독 정보 찾기
          if (channelData.subscribed) {
            activeSubscription = (mySubscriptions || []).find(
              (sub) => sub.channelId === numericChannelId && sub.status === 'ACTIVE'
            );
          }
        } else {
          activeSubscription = (mySubscriptions || []).find(
            (sub) => sub.channelId === numericChannelId && sub.status === 'ACTIVE'
          );
          setIsSubscribed(Boolean(activeSubscription));
        }

        // 현재 구독 정보 저장
        setCurrentSubscription(activeSubscription);

        // 채널의 콘텐츠 목록 조회
        try {
          const contentsResponse = await getContents({ channelId: numericChannelId });
          const contents = contentsResponse?.content || [];
          
          // 백엔드에서 이미 발행된 콘텐츠만 필터링해서 반환하므로, 프론트엔드에서는 추가 필터링 불필요
          // 콘텐츠 데이터를 ContentGrid 컴포넌트가 기대하는 형식으로 변환
          const normalizedContents = contents.map(c => ({
            id: c.contentId || c.id,
            title: c.title,
            thumbnailUrl: c.mediaUrl || '/placeholder-content.jpg',
            description: c.body || '',
            viewCount: c.viewCount || 0,
            likeCount: c.likeCount || 0,
            accessType: c.accessType || 'FREE',
            publishedAt: c.publishedAt, // publishedAt 포함
          }));
          
          setChannelContents(normalizedContents);

          const contentIds = normalizedContents
            .map((content) => content.id)
            .filter((id) => id !== undefined && id !== null);

          const reviewTargets = contentIds.slice(0, 10);
          const reviewResponses = await Promise.all(
            reviewTargets.map((contentId) =>
              getReviews(contentId).catch((err) => {
                console.warn('리뷰 목록 조회 실패:', err);
                return [];
              })
            )
          );

          const allReviews = reviewResponses.flat().map((review) => ({
            id: review?.id,
            userName: review?.nickname || '익명',
            rating: review?.rating ?? 0,
            comment: review?.comment || '',
            createdAt: review?.createdAt || null,
          }));

          const reviewCount = allReviews.length;
          const averageRating = reviewCount
            ? allReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
            : 0;

          const recentReviews = allReviews
            .map((review) => {
              const parsedDate = review.createdAt ? new Date(review.createdAt) : null;
              return {
                ...review,
                createdAtLabel: parsedDate && !Number.isNaN(parsedDate.getTime())
                  ? parsedDate.toLocaleDateString('ko-KR')
                  : '',
                createdAtSort: parsedDate ? parsedDate.getTime() : 0,
              };
            })
            .sort((a, b) => b.createdAtSort - a.createdAtSort)
            .slice(0, 3)
            .map((review) => ({
              id: review.id,
              userName: review.userName,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAtLabel,
            }));

          setChannelReviews(recentReviews);
          setReviewSummary({
            averageRating,
            reviewCount,
          });
        } catch (err) {
          console.warn('채널 콘텐츠 조회 실패:', err);
          setChannelContents([]);
          setChannelReviews([]);
          setReviewSummary({ averageRating: 0, reviewCount: 0 });
        }
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

  const handleSubscribeToggle = async () => {
    if (isSubscribed) {
      // 구독 취소 로직
      if (!currentSubscription) {
        alert('구독 정보를 찾을 수 없습니다.');
        return;
      }

      // 현재 구독의 플랜 정보 찾기
      const subscriptionPlanId = currentSubscription.planId;
      const currentPlan = (plans || []).find(plan =>
        (plan.planId || plan.id) === subscriptionPlanId
      );
      const planType = currentPlan?.planType || currentPlan?.duration; // 'MONTHLY' or 'YEARLY'

      // 구독 시작일로부터 3일 이내인지 확인
      const startedAt = new Date(currentSubscription.startedAt || currentSubscription.startDate);
      const now = new Date();
      const daysSinceStart = Math.floor((now - startedAt) / (1000 * 60 * 60 * 24));

      if (daysSinceStart > 3) {
        // 3일 이후
        if (planType === 'MONTHLY' || planType === '월간 구독') {
          // 월간 구독: 취소 불가
          alert('월간 구독은 시작 후 3일 이내에만 취소할 수 있습니다.');
          return;
        } else if (planType === 'YEARLY' || planType === '연간 구독') {
          // 연간 구독: 취소 가능하지만 만료일 연장 안내
          const confirmed = window.confirm(
            `정말로 "${channel?.name || '이 채널'}" 구독을 취소하시겠습니까?\n\n` +
            `연간 구독 취소 시, 구독 시작일로부터 1개월 후까지 구독이 유지된 후 취소됩니다.\n` +
            `(만료일: ${new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')})`
          );

          if (!confirmed) {
            return;
          }
        } else {
          // 플랜 타입을 알 수 없는 경우 백엔드로 요청하여 처리
          const confirmed = window.confirm(
            `정말로 "${channel?.name || '이 채널'}" 구독을 취소하시겠습니까?`
          );

          if (!confirmed) {
            return;
          }
        }
      } else {
        // 3일 이내: 바로 취소 가능
        const confirmed = window.confirm(
          `정말로 "${channel?.name || '이 채널'}" 구독을 취소하시겠습니까?\n구독 취소 후에는 즉시 접근이 제한됩니다.`
        );

        if (!confirmed) {
          return;
        }
      }

      try {
        const subscriptionId = currentSubscription.subscriptionId || currentSubscription.id;
        await cancelSubscription(subscriptionId);

        // 구독 상태 업데이트
        setIsSubscribed(false);
        setCurrentSubscription(null);

        // 구독 목록 다시 로드하여 최신 상태 반영
        const updatedSubscriptions = await getMySubscriptions();
        const updatedActiveSubscription = (updatedSubscriptions?.content || updatedSubscriptions || []).find(
          (sub) => sub.channelId === Number(channelId) && sub.status === 'ACTIVE'
        );
        setCurrentSubscription(updatedActiveSubscription);

        // 연간 구독이고 3일 이후 취소한 경우 만료일 연장 안내
        if (daysSinceStart > 3 && (planType === 'YEARLY' || planType === '연간 구독')) {
          alert('구독 취소가 승인되었습니다.\n구독 시작일로부터 1개월 후까지 구독이 유지된 후 취소됩니다.');
        } else {
          alert('구독이 취소되었습니다.');
        }
      } catch (err) {
        console.error('구독 취소 오류:', err);
        const errorMessage = err.message || '구독 취소 중 오류가 발생했습니다.';
        alert(errorMessage);
      }
    } else {
      // 구독하기는 기존 로직 유지 (결제 페이지로 이동)
      // 하지만 여기서는 단순히 상태만 토글하지 않고, 구독 상품 선택을 유도
      // 실제로는 구독 상품을 선택해야 하므로 이 부분은 변경하지 않음
    }
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
        averageRating={reviewSummary.averageRating}
        reviewCount={reviewSummary.reviewCount}
        onSubscribeToggle={handleSubscribeToggle}
        onCreatorClick={() => {
          if (channel?.creatorId) {
            onNavigate('creator-detail', { creatorId: channel.creatorId });
          }
        }}
      />

      {/* 쿠폰 목록 - 크리에이터 정보와 구독 상품 사이 */}
      {coupons.length > 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">다운로드 가능한 쿠폰</h2>
          <CouponList
            coupons={coupons}
            hideCode={true}
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
          reviews={channelReviews}
          averageRating={reviewSummary.averageRating}
        />
      )}
    </div>
  );
}
