import React from 'react';
import { Play, Lock } from 'lucide-react';

export function VideoPlayer({ content, hasAccess, onPurchase }) {
  return (
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
                onClick={onPurchase}
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
  );
}
