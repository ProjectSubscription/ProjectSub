import React from 'react';
import { Play, Lock, Heart } from 'lucide-react';

export function ContentGrid({ contents, isSubscribed, onNavigate }) {
  // 백엔드에서 이미 발행된 콘텐츠만 필터링해서 반환하므로, 프론트엔드에서는 추가 필터링 불필요
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => {
        // 접근 권한: 무료 또는 구독자 전용 콘텐츠는 구독 시 접근 가능
        // 실제 콘텐츠 접근 권한 (상세 페이지는 모두 접근 가능)
        const canAccess = content.accessType === 'FREE' || 
                         (content.accessType === 'SUBSCRIBER_ONLY' && isSubscribed) ||
                         content.accessType === 'SINGLE_PURCHASE' ||
                         content.accessType === 'PARTIAL';
        
        return (
          <div
            key={content.id}
            onClick={() => onNavigate('content-detail', { contentId: content.id })}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="relative aspect-video">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              {!canAccess && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {content.accessType === 'SUBSCRIPTION' ? '구독 필요' : '구매 필요'}
                    </p>
                  </div>
                </div>
              )}
              {canAccess && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3">
                {content.accessType === 'FREE' ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    무료
                  </span>
                ) : (
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                    유료
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                {content.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {content.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{content.viewCount.toLocaleString()} 조회</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{content.likeCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
