import React from 'react';
import { Heart, Share2, Eye, Calendar } from 'lucide-react';

export function ContentInfo({ content, isLiked, onLikeToggle }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={onLikeToggle}
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
  );
}
