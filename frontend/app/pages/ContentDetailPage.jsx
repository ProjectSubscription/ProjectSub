import React from 'react';
import {
  Play,
  Heart,
  Share2,
  Lock,
  Star,
  ThumbsUp,
  MessageSquare,
  Eye,
  Calendar
} from 'lucide-react';
import { PageRoute } from '../types';
import { mockContents, mockChannels, mockReviews } from '../mockData';

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

  return (
    <div className="space-y-8 pb-12">
      {/* Video Player */}
      <div className="bg-black rounded-2xl overflow-hidden">
        <div className="aspect-video relative">
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          {!hasAccess ? (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white max-w-md px-6">
                <Lock className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">이 콘텐츠는 잠겨있습니다</h3>
                <p className="text-gray-300 mb-6">
                  {content.accessType === 'SUBSCRIPTION'
                    ? '이 콘텐츠를 보려면 채널 구독이 필요합니다.'
                    : `이 콘텐츠를 구매하시면 시청할 수 있습니다.`}
                </p>
                {content.accessType === 'PAID' && (
                  <p className="text-3xl font-bold mb-6">
                    {content.price?.toLocaleString()}원
                  </p>
                )}
                <button
                  onClick={handlePurchase}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {content.accessType === 'SUBSCRIPTION' ? '구독하러 가기' : '구매하기'}
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
              <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
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
                <span>{content.viewCount.toLocaleString()} 조회</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{content.likeCount.toLocaleString()} 좋아요</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{content.createdAt}</span>
              </div>
              <div className="flex items-center gap-1">
                {content.accessType === 'FREE' && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    무료
                  </span>
                )}
                {content.accessType === 'SUBSCRIPTION' && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    구독 필요
                  </span>
                )}
                {content.accessType === 'PAID' && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                    {content.price?.toLocaleString()}원
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">콘텐츠 설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.description}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                리뷰 ({contentReviews.length})
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
              {contentReviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {rev.userName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{rev.userName}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rev.rating
                                  ? 'fill-current text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{rev.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{rev.comment}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-blue-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>도움됨</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Channel Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div
              onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{channel.name}</h4>
                  <p className="text-sm text-gray-500">{channel.creatorName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span>4.8 평점</span>
                <span>•</span>
                <span>{channel.subscriberCount.toLocaleString()} 구독자</span>
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
                .filter(c => c.channelId === channel.id && c.id !== content.id)
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
