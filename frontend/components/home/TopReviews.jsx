import React from 'react';
import { Star, ThumbsUp, ArrowRight } from 'lucide-react';

export function TopReviews({ reviews, onNavigate }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ThumbsUp className="w-6 h-6 text-blue-600" />
          가장 추천이 많은 후기
        </h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            onClick={() => onNavigate('content-detail', { contentId: review.contentId })}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
          >
            <div className="flex gap-4">
              {/* 콘텐츠 썸네일 */}
              {review.contentThumbnailUrl ? (
                <img
                  src={review.contentThumbnailUrl}
                  alt={review.contentTitle}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {review.contentTitle?.[0] || '?'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* 콘텐츠 제목 */}
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900 truncate">
                    {review.contentTitle}
                  </h4>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                {/* 리뷰 정보 */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {review.nickname || '익명'}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'fill-current text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {review.comment}
                  </p>
                </div>

                {/* 추천 수 */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-medium text-blue-600">
                      {review.likeCount || 0}명이 도움됨
                    </span>
                  </div>
                  <span>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('ko-KR')
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
