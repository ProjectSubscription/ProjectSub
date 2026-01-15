import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { ContentInfo } from '@/components/content/ContentInfo';
import { ReviewSection } from '@/components/content/ReviewSection';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { mockContents, mockChannels } from '@/app/mockData';
import { getMyInfo } from '@/app/lib/api';

export function ContentDetailPage({ contentId: propContentId, onNavigate }) {
  // Temporary override: Force contentId to 1 as per previous instructions
  const contentId = 1;

  const [isLiked, setIsLiked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  
  // State for real data
  const [contentData, setContentData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real data from backend for ID 1
        const contentResponse = await axios.get(`http://localhost:8080/api/contents/${contentId}`);
        const fetchedContent = contentResponse.data;
        setContentData(fetchedContent);

        if (fetchedContent && fetchedContent.channelId) {
          const channelResponse = await axios.get(`http://localhost:8080/api/channels/${fetchedContent.channelId}`);
          setChannelData(channelResponse.data);
        }

        // Fetch current user info
        try {
          const user = await getMyInfo();
          setCurrentUser(user);
        } catch (error) {
          console.log('User not logged in');
          setCurrentUser(null);
        }

      } catch (error) {
        console.error('Failed to fetch content data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchReviews();
  }, [contentId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/contents/${contentId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (!contentData || !channelData) {
    return <div className="text-center py-12">콘텐츠를 찾을 수 없습니다.</div>;
  }

  // Simulate access control
  const hasAccess = contentData.accessType === 'FREE';

  const handlePurchase = () => {
    if (contentData.accessType === 'PAID') {
      onNavigate('payment', { type: 'content', contentId: contentData.id || contentData.contentId });
    } else if (contentData.accessType === 'SUBSCRIPTION') {
      onNavigate('channel-detail', { channelId: channelData.id });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigate('login');
      return;
    }

    try {
      // Note: memberId is now handled by backend session/token, but we keep it here if needed or remove it
      // The backend controller uses @AuthenticationPrincipal, so memberId in body might be ignored or optional
      await axios.post(`http://localhost:8080/api/contents/${contentId}/reviews`, {
        contentId: contentId,
        memberId: currentUser.id, 
        rating: rating,
        comment: review
      });
      alert('리뷰가 등록되었습니다!');
      setShowReviewForm(false);
      setReview('');
      setRating(5);
      fetchReviews(); // Refresh reviews list
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  // Mock related contents for now (or fetch from backend if API exists)
  const relatedContents = mockContents
    .filter(c => c.channelId === channelData.id && c.id !== contentData.id)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <VideoPlayer
        content={contentData}
        hasAccess={hasAccess}
        onPurchase={handlePurchase}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ContentInfo
            content={contentData}
            isLiked={isLiked}
            onLikeToggle={() => setIsLiked(!isLiked)}
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

        <ContentSidebar
          channel={channelData}
          relatedContents={relatedContents}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
