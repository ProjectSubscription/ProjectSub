import React from 'react';
import { Star } from 'lucide-react';

export function ContentSidebar({ channel, relatedContents, onNavigate, averageRating = 0 }) {
  const handleChannelClick = () => {
    if (channel?.id) {
      onNavigate('channel-detail', { channelId: channel.id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Channel Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="cursor-pointer">
          <div 
            onClick={handleChannelClick}
            className="flex items-center gap-3 mb-4"
          >
            {channel.thumbnailUrl ? (
              <img
                src={channel.thumbnailUrl}
                alt={channel.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                {channel.name?.slice(0, 1) || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate">{channel.name}</h4>
              <p className="text-sm text-gray-500">{channel.creatorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Star className="w-4 h-4 fill-current text-yellow-500" />
            <span>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'} 평점</span>
            <span>•</span>
            <span>{channel.subscriberCount.toLocaleString()} 구독자</span>
          </div>
          <button 
            onClick={handleChannelClick}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            채널 방문하기
          </button>
        </div>
      </div>

      {/* Related Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4">이 채널의 다른 콘텐츠</h4>
        <div className="space-y-3">
          {relatedContents.map((relatedContent) => (
            <div
              key={relatedContent.id}
              onClick={() => window.location.href = `/contents/${relatedContent.id}`}
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
  );
}
