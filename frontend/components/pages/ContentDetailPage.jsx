import React from 'react';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { ContentInfo } from '@/components/content/ContentInfo';
import { ReviewSection } from '@/components/content/ReviewSection';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { mockContents, mockChannels, mockReviews } from '@/app/mockData';

export function ContentDetailPage({ contentId, onNavigate }) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [review, setReview] = React.useState('');

  const content = mockContents.find(c => c.id === contentId);
  const channel = content ? mockChannels.find(ch => ch.id === content.channelId) : null;
  const contentReviews = mockReviews.filter(r => r.contentId === contentId);

  if (!content || !channel) {
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

  const relatedContents = mockContents
    .filter(c => c.channelId === channel.id && c.id !== content.id)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <VideoPlayer
        content={content}
        hasAccess={hasAccess}
        onPurchase={handlePurchase}
      />

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
