import React from 'react';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { ContentInfo } from '@/components/content/ContentInfo';
import { ReviewSection } from '@/components/content/ReviewSection';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import CouponList from '@/components/coupon/CouponList';
import { getContent, getContentCoupons } from '@/app/lib/api';
import { mockContents, mockChannels, mockReviews } from '@/app/mockData';

export function ContentDetailPage({ contentId, onNavigate }) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [review, setReview] = React.useState('');
  const [coupons, setCoupons] = React.useState([]);
  const [content, setContent] = React.useState(null);
  const [channel, setChannel] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // 컨텐츠 정보 및 쿠폰 목록 조회
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentData, couponsData] = await Promise.all([
          getContent(contentId).catch(() => {
            // API 실패 시 mock 데이터 사용
            return mockContents.find(c => c.id === contentId);
          }),
          getContentCoupons(contentId).catch(() => []) // 쿠폰 목록은 실패해도 계속 진행
        ]);

        setContent(contentData);
        setCoupons(couponsData || []);

        // 채널 정보 설정
        if (contentData) {
          const channelId = contentData.channelId || contentData.channel?.id;
          if (channelId) {
            const channelData = mockChannels.find(ch => ch.id === channelId);
            setChannel(channelData);
          }
        }
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchData();
    }
  }, [contentId]);

  const contentReviews = mockReviews.filter(r => r.contentId === contentId);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (!content) {
    return <div className="text-center py-12">콘텐츠를 찾을 수 없습니다.</div>;
  }

  // Simulate access control
  const hasAccess = content.accessType === 'FREE';

  const handlePurchase = () => {
    if (content.accessType === 'PAID') {
      onNavigate('payment', { type: 'content', contentId: content.id });
    } else if (content.accessType === 'SUBSCRIPTION') {
      onNavigate('channel-detail', { channelId: channel.id });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    alert('리뷰가 등록되었습니다!');
    setShowReviewForm(false);
    setReview('');
    setRating(5);
  };

  const relatedContents = channel
    ? mockContents
        .filter(c => {
          const cChannelId = c.channelId || c.channel?.id;
          const channelId = channel.id;
          return cChannelId === channelId && c.id !== content.id;
        })
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-8 pb-12">
      <VideoPlayer
        content={content}
        hasAccess={hasAccess}
        onPurchase={handlePurchase}
      />

      {/* 쿠폰 목록 */}
      {coupons.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">다운로드 가능한 쿠폰</h2>
          <CouponList
            coupons={coupons}
            onRefresh={async () => {
              try {
                const refreshedCoupons = await getContentCoupons(contentId);
                setCoupons(refreshedCoupons || []);
              } catch (err) {
                console.error('쿠폰 목록 새로고침 실패:', err);
              }
            }}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ContentInfo
            content={content}
            isLiked={isLiked}
            onLikeToggle={() => setIsLiked(!isLiked)}
          />

          <ReviewSection
            reviews={contentReviews}
            hasAccess={hasAccess}
            showReviewForm={showReviewForm}
            onToggleReviewForm={() => setShowReviewForm(!showReviewForm)}
            onSubmitReview={handleSubmitReview}
            rating={rating}
            onRatingChange={setRating}
            review={review}
            onReviewChange={setReview}
          />
        </div>

        <ContentSidebar
          channel={channel}
          relatedContents={relatedContents}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
