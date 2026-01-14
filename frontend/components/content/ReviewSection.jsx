import React from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';

export function ReviewSection({ reviews, hasAccess, showReviewForm, onToggleReviewForm, onSubmitReview, rating, onRatingChange, review, onReviewChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          리뷰 ({reviews.length})
        </h3>
        {hasAccess && (
          <button
            onClick={onToggleReviewForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={onSubmitReview} className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점
            </label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onRatingChange(i + 1)}
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
              onChange={(e) => onReviewChange(e.target.value)}
              placeholder="이 콘텐츠에 대한 의견을 남겨주세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onToggleReviewForm}
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
  );
}
