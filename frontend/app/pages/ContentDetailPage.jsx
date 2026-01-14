import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Play,
  Heart,
  Share2,
  Lock,
  Star,
  ThumbsUp,
  MessageSquare,
  Eye,
  Calendar,
  CornerDownRight,
  MessageCircle
} from 'lucide-react';
import { PageRoute } from '../types';
import { mockContents, mockChannels } from '../mockData';

// Recursive Comment Item Component
function CommentItem({ comment, onReply, depth = 0 }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    onReply(replyText, comment.id);
    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className={`mt-3 ${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{comment.nickname || 'User'}</span>
            <span className="text-xs text-gray-500">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            답글
          </button>
        </div>
        <p className="text-sm text-gray-700">{comment.comment}</p>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <CornerDownRight className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="답글을 입력하세요..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      )}

      {/* Recursive Children */}
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-3 mt-3">
          {comment.children.map((child) => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              onReply={onReply} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Review Item Component to handle individual review comments
function ReviewItem({ review }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [review.id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`http://localhost:8080/api/reviews/${review.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (commentText, parentId = null) => {
    if (!commentText.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/reviews/${review.id}/comments`, {
        reviewId: review.id,
        memberId: 1, // Hardcoded for now
        comment: commentText,
        parentId: parentId
      });
      
      if (!parentId) {
        setNewComment('');
      }
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleMainCommentSubmit = (e) => {
    e.preventDefault();
    handleSubmitComment(newComment);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            {review.nickname ? review.nickname[0] : '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.nickname || 'Unknown User'}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-current text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
        </span>
      </div>
      <p className="text-gray-700 mb-4">{review.comment}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <button className="flex items-center gap-1 hover:text-blue-600">
          <ThumbsUp className="w-4 h-4" />
          <span>도움됨</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
        {/* Comment List */}
        {comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReply={(text, parentId) => handleSubmitComment(text, parentId)} 
              />
            ))}
          </div>
        )}

        {/* Main Comment Input */}
        <form onSubmit={handleMainCommentSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <CornerDownRight className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
}

export function ContentDetailPage({ contentId: propContentId, onNavigate }) {
  // Temporary override: Force contentId to 1
  const contentId = 1;

  const [isLiked, setIsLiked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  
  // State for content and channel data
  const [contentData, setContentData] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await axios.post(`http://localhost:8080/api/contents/${contentId}/reviews`, {
        contentId: contentId,
        memberId: 1, // Hardcoded for now as per instructions
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

  return (
    <div className="space-y-8 pb-12">
      {/* Video Player */}
      <div className="bg-black rounded-2xl overflow-hidden">
        <div className="aspect-video relative">
          <img
            src={contentData.thumbnailUrl || contentData.mediaUrl || "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600"} // Fallback image
            alt={contentData.title}
            className="w-full h-full object-cover"
          />
          {!hasAccess ? (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white max-w-md px-6">
                <Lock className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">이 콘텐츠는 잠겨있습니다</h3>
                <p className="text-gray-300 mb-6">
                  {contentData.accessType === 'SUBSCRIPTION'
                    ? '이 콘텐츠를 보려면 채널 구독이 필요합니다.'
                    : `이 콘텐츠를 구매하시면 시청할 수 있습니다.`}
                </p>
                {contentData.accessType === 'PAID' && (
                  <p className="text-3xl font-bold mb-6">
                    {contentData.price?.toLocaleString()}원
                  </p>
                )}
                <button
                  onClick={handlePurchase}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {contentData.accessType === 'SUBSCRIPTION' ? '구독하러 가기' : '구매하기'}
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all cursor-pointer">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Play className="w-10 h-10 text-blue-600 ml-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Actions */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{contentData.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{contentData.viewCount?.toLocaleString()} 조회</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{contentData.likeCount?.toLocaleString()} 좋아요</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{contentData.createdAt ? new Date(contentData.createdAt).toLocaleDateString() : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                {contentData.accessType === 'FREE' && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    무료
                  </span>
                )}
                {contentData.accessType === 'SUBSCRIPTION' && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    구독 필요
                  </span>
                )}
                {contentData.accessType === 'PAID' && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                    {contentData.price?.toLocaleString()}원
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">콘텐츠 설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {contentData.description || contentData.body}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                리뷰 ({reviews.length})
              </h3>
              {hasAccess && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  리뷰 작성
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점
                  </label>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            i < rating
                              ? 'fill-current text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    리뷰 내용
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="이 콘텐츠에 대한 의견을 남겨주세요..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    등록
                  </button>
                </div>
              </form>
            )}

            {/* Review List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <ReviewItem key={rev.id} review={rev} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Channel Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div
              onClick={() => onNavigate('channel-detail', { channelId: channelData.id })}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={channelData.thumbnailUrl || "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400"} // Fallback
                  alt={channelData.name || channelData.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{channelData.name || channelData.title}</h4>
                  <p className="text-sm text-gray-500">{channelData.creatorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span>4.8 평점</span>
                <span>•</span>
                <span>{channelData.subscriberCount?.toLocaleString()} 구독자</span>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                채널 방문하기
              </button>
            </div>
          </div>

          {/* Related Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4">이 채널의 다른 콘텐츠</h4>
            <div className="space-y-3">
              {mockContents
                .filter(c => c.channelId === channelData.id && c.id !== contentData.id)
                .slice(0, 3)
                .map((relatedContent) => (
                  <div
                    key={relatedContent.id}
                    onClick={() => onNavigate('content-detail', { contentId: relatedContent.id })}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <img
                      src={relatedContent.thumbnailUrl}
                      alt={relatedContent.title}
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {relatedContent.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {relatedContent.viewCount.toLocaleString()} 조회
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
