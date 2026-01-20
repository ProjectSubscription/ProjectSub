import React from 'react';
import { Star } from 'lucide-react';

export function ChannelAbout({ channel, contentCount, reviews = [], averageRating = 0 }) {
  const formattedAverageRating = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">채널 소개</h3>
        <p className="text-gray-700 leading-relaxed mb-6">
          {channel.description}
        </p>
        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-1">구독자 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {channel.subscriberCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">총 콘텐츠</p>
            <p className="text-2xl font-bold text-gray-900">
              {contentCount}개
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">평균 평점</p>
            <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
              {formattedAverageRating}
              <Star className="w-5 h-5 fill-current text-yellow-500" />
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">최근 리뷰</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {review.userName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{review.userName}</p>
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
                  <span className="text-sm text-gray-500">{review.createdAt}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
