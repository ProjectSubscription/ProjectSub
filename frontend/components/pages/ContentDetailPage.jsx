import React from 'react';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { ContentInfo } from '@/components/content/ContentInfo';
import { ReviewSection } from '@/components/content/ReviewSection';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { getContent, likeContent, unlikeContent, getChannel, getFeaturedContents } from '@/app/lib/api';
import { mockReviews } from '@/app/mockData';

export function ContentDetailPage({ contentId, onNavigate }) {
  const [content, setContent] = React.useState(null);
  const [channel, setChannel] = React.useState(null);
  const [relatedContents, setRelatedContents] = React.useState([]);
  const [isLiked, setIsLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [review, setReview] = React.useState('');

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
        console.log('Content data:', contentData); // 디버깅용
        console.log('hasAccess:', contentData.hasAccess); // 디버깅용
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
              const filtered = featuredContents.filter(c => c.contentId !== contentData.contentId);
              setRelatedContents(filtered.slice(0, 3));
            } catch (err) {
              console.warn('관련 콘텐츠 조회 실패:', err);
              setRelatedContents([]);
            }
          } catch (err) {
            console.warn('채널 정보 조회 실패:', err);
          }
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
  // 백엔드에서 구매/구독 여부를 확인하여 hasAccess 값을 설정함
  const hasFullAccess = content && (
    content.accessType === 'FREE' || 
    (content.hasAccess === true)
  );
  
  // PARTIAL 타입은 구매하지 않았어도 미리보기는 제공
  // 하지만 구매했으면 전체 콘텐츠를 보여줘야 함
  const hasAccess = hasFullAccess;
  
  // 접근 권한이 필요한 콘텐츠인지 확인
  const requiresAccess = content && content.accessType !== 'FREE';

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

  const handleSubmitReview = (e) => {
    e.preventDefault();
    alert('리뷰가 등록되었습니다!');
    setShowReviewForm(false);
    setReview('');
    setRating(5);
  };

  // 리뷰 데이터 (임시로 mock 데이터 사용, 추후 API 연동 필요)
  const contentReviews = mockReviews.filter(r => r.contentId === contentId);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error && !content) {
    // 접근 권한 에러인 경우
    if (error.includes('접근 권한') || error.includes('구독') || error.includes('구매')) {
      return (
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">콘텐츠 접근 권한이 없습니다</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                이 콘텐츠를 보시려면 채널을 구독하거나 콘텐츠를 구매해야 합니다.
              </p>
            </div>
          </div>
        </div>
      );
    }
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
    hasAccess: content.hasAccess, // hasAccess 필드 유지
  };

  const channelForSidebar = channel ? {
    id: channel.id,
    name: channel.title,
    creatorName: channel.creatorId ? `크리에이터 ${channel.creatorId}` : '크리에이터',
    thumbnailUrl: '/placeholder-channel.jpg',
    subscriberCount: channel.subscriberCount || 0,
  } : null;

  const relatedContentsForSidebar = relatedContents.map(c => ({
    id: c.contentId,
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
