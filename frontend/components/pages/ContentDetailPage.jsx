import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { ContentInfo } from '@/components/content/ContentInfo';
import { ReviewSection } from '@/components/content/ReviewSection';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import CouponList from '@/components/coupon/CouponList';
import { getContent, getContentCoupons, getChannel, getFeaturedContents, likeContent, unlikeContent, createReview, getReviews } from '@/app/lib/api';
import { useUser } from '@/components/contexts/UserContext';

export function ContentDetailPage({ contentId, onNavigate }) {
  const { currentUser } = useUser();
  const [isLiked, setIsLiked] = React.useState(false);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [review, setReview] = React.useState('');
  const [reviews, setReviews] = React.useState([]);
  const [coupons, setCoupons] = React.useState([]);
  const [content, setContent] = React.useState(null);
  const [channel, setChannel] = React.useState(null);
  const [relatedContents, setRelatedContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 콘텐츠 데이터 로드
  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // contentId를 숫자로 변환
        const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
        if (!id || isNaN(id)) {
          throw new Error('유효하지 않은 콘텐츠 ID입니다.');
        }

        // 콘텐츠 상세 조회
        const contentData = await getContent(id);
        setContent(contentData);
        setIsLiked(contentData.isLiked || false);

        // 채널 정보 조회
        if (contentData && contentData.channelId) {
          try {
            const channelData = await getChannel(contentData.channelId);
            setChannel(channelData);

            // 관련 콘텐츠 조회 (채널의 대표 콘텐츠)
            try {
              const featuredContents = await getFeaturedContents(contentData.channelId);
              // 현재 콘텐츠 제외
              const filtered = featuredContents.filter(c => {
                const cId = c.contentId || c.id;
                const currentId = contentData.contentId || contentData.id;
                return cId !== currentId;
              });
              setRelatedContents(filtered.slice(0, 3));
            } catch (err) {
              console.warn('관련 콘텐츠 조회 실패:', err);
              setRelatedContents([]);
            }
          } catch (err) {
            console.warn('채널 정보 조회 실패:', err);
          }
        }

        // 쿠폰 목록 조회
        try {
          const couponsData = await getContentCoupons(id);
          setCoupons(couponsData || []);
        } catch (err) {
          console.warn('쿠폰 목록 조회 실패:', err);
          setCoupons([]);
        }

        // 리뷰 목록 조회
        try {
          const reviewsData = await getReviews(id);
          setReviews(reviewsData || []);
        } catch (err) {
          console.warn('리뷰 목록 조회 실패:', err);
          setReviews([]);
        }
      } catch (err) {
        console.error('콘텐츠 로딩 실패:', err);
        setError(err.message || '콘텐츠를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  // 접근 권한 확인
  // 백엔드에서 hasAccess 필드를 제공하므로 이를 사용
  const hasFullAccess = content && (
    content.accessType === 'FREE' ||
    (content.hasAccess === true)
  );
  const hasAccess = hasFullAccess;

  const handleLikeToggle = async () => {
    try {
      const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
      if (isLiked) {
        await unlikeContent(id);
        setIsLiked(false);
        if (content) {
          setContent({ ...content, likeCount: Math.max(0, content.likeCount - 1), isLiked: false });
        }
      } else {
        await likeContent(id);
        setIsLiked(true);
        if (content) {
          setContent({ ...content, likeCount: (content.likeCount || 0) + 1, isLiked: true });
        }
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      alert(err.message || '좋아요 처리에 실패했습니다.');
    }
  };

  const handlePurchase = () => {
    // contentId는 prop으로 받은 값 또는 content.id 사용
    const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
    const finalContentId = content?.id || content?.contentId || id;

    if (content.accessType === 'SINGLE_PURCHASE') {
      onNavigate('payment', { type: 'content', contentId: finalContentId });
    } else if (content.accessType === 'SUBSCRIBER_ONLY') {
      onNavigate('channel-detail', { channelId: content.channelId });
    } else if (content.accessType === 'PARTIAL') {
      onNavigate('payment', { type: 'content', contentId: finalContentId });
    }
  };

  // 리뷰 목록 새로고침 함수
  const fetchReviews = async () => {
    try {
      const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
      const reviewsData = await getReviews(id);
      setReviews(reviewsData || []);
    } catch (err) {
      console.error('리뷰 목록 조회 실패:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigate('login');
      return;
    }

    if (!review.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      // contentId를 숫자로 변환
      const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
      
      // 백엔드에서 memberId는 세션(@AuthenticationPrincipal)에서 가져오므로
      // request body에는 rating과 comment만 전달
      // contentId는 URL path variable로 전달됨
      await createReview(id, {
        rating: rating,
        comment: review.trim()
      });

      alert('리뷰가 등록되었습니다!');
      setShowReviewForm(false);
      setReview('');
      setRating(5);
      
      // 리뷰 목록 새로고침
      await fetchReviews();
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert(error.message || '리뷰 등록에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error && !content) {
    return <div className="text-center py-12 text-red-600">오류: {error}</div>;
  }

  if (!content) {
    return <div className="text-center py-12">콘텐츠를 찾을 수 없습니다.</div>;
  }

  // 백엔드 응답을 프론트엔드 컴포넌트에 맞게 변환
  const contentForPlayer = {
    ...content,
    contentType: content.contentType,
    thumbnailUrl: content.mediaUrl || '/placeholder-video.jpg',
    title: content.title,
    accessType: content.accessType,
    price: content.price,
    body: content.body,
    previewRatio: content.previewRatio,
  };

  const contentForInfo = {
    ...content,
    description: content.body || '콘텐츠 설명이 없습니다.',
    createdAt: content.createdAt ? new Date(content.createdAt).toLocaleDateString('ko-KR') : '',
    hasAccess: content.hasAccess,
  };

  const channelForSidebar = channel ? {
    id: channel.id,
    name: channel.title || channel.name,
    creatorName: channel.creatorId ? `크리에이터 ${channel.creatorId}` : '크리에이터',
    thumbnailUrl: '/placeholder-channel.jpg',
    subscriberCount: channel.subscriberCount || 0,
  } : null;

  const relatedContentsForSidebar = relatedContents.map(c => ({
    id: c.contentId || c.id,
    title: c.title,
    thumbnailUrl: c.mediaUrl || '/placeholder-content.jpg',
    viewCount: c.viewCount || 0,
  }));

  // 텍스트 콘텐츠일 때는 VideoPlayer를 표시하지 않음 (ContentInfo에서 표시)
  const isTextContent = content && (content.contentType === 'TEXT' || content.content_type === 'TEXT');

  return (
    <div className="space-y-8 pb-12">
      {/* 텍스트 콘텐츠가 아닐 때만 VideoPlayer 표시 */}
      {!isTextContent && (
        <VideoPlayer
          content={contentForPlayer}
          hasAccess={hasFullAccess}
          onPurchase={handlePurchase}
        />
      )}

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
            content={contentForInfo}
            isLiked={isLiked}
            onLikeToggle={handleLikeToggle}
            onPurchase={handlePurchase}
            hasAccess={hasFullAccess}
          />

          <ReviewSection
            reviews={reviews}
            hasAccess={hasAccess}
            showReviewForm={showReviewForm}
            onToggleReviewForm={() => {
              if (!currentUser) {
                alert('로그인이 필요한 서비스입니다.');
                onNavigate('login');
                return;
              }
              setShowReviewForm(!showReviewForm);
            }}
            onSubmitReview={handleSubmitReview}
            rating={rating}
            onRatingChange={setRating}
            review={review}
            onReviewChange={setReview}
            currentUser={currentUser}
            onNavigate={onNavigate}
          />
        </div>

        {channelForSidebar && (
          <ContentSidebar
            channel={channelForSidebar}
            relatedContents={relatedContentsForSidebar}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
}
