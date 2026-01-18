import React from 'react';
import { Play, Lock, FileText } from 'lucide-react';

export function VideoPlayer({ content, hasAccess, onPurchase }) {
  const contentType = content.contentType || content.content_type;
  const isText = contentType === 'TEXT';
  const isVideo = contentType === 'VIDEO';
  const isPartial = content.accessType === 'PARTIAL';
  const previewRatio = content.previewRatio;

  // PARTIAL 타입이 아니고 접근 권한이 없을 때 잠금 화면
  if (!hasAccess && !isPartial) {
    return (
      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className={`${isVideo ? 'aspect-video' : 'min-h-[400px]'} relative flex items-center justify-center`}>
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="text-center text-white max-w-md px-6">
              <Lock className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">이 콘텐츠는 잠겨있습니다</h3>
              <p className="text-gray-300 mb-6">
                {content.accessType === 'SUBSCRIBER_ONLY'
                  ? '이 콘텐츠를 보려면 채널 구독이 필요합니다.'
                  : content.accessType === 'SINGLE_PURCHASE'
                  ? '이 콘텐츠를 구매하시면 볼 수 있습니다.'
                  : content.accessType === 'PARTIAL'
                  ? '전체 콘텐츠를 보려면 구매가 필요합니다.'
                  : '이 콘텐츠를 구매하시면 볼 수 있습니다.'}
              </p>
              {(content.accessType === 'SINGLE_PURCHASE' || content.accessType === 'PARTIAL') && (
                <p className="text-3xl font-bold mb-6">
                  {content.price?.toLocaleString()}원
                </p>
              )}
              <button
                onClick={onPurchase}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {content.accessType === 'SUBSCRIBER_ONLY' 
                  ? '구독하러 가기' 
                  : content.accessType === 'SINGLE_PURCHASE' || content.accessType === 'PARTIAL'
                  ? '구매하기'
                  : '구매하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 텍스트 콘텐츠
  if (isText) {
    const body = content.body || '';
    const previewRatio = content.previewRatio;
    // PARTIAL 타입이고 접근 권한이 없을 때만 미리보기 표시
    // 구매했으면 (hasAccess === true) 전체 콘텐츠 표시
    const showPreview = content.accessType === 'PARTIAL' && !hasAccess;
    
    // PARTIAL 타입이고 접근 권한이 없을 때 미리보기만 표시
    let displayText = body;
    if (showPreview && previewRatio) {
      const previewLength = Math.floor(body.length * (previewRatio / 100));
      displayText = body.substring(0, previewLength) + '...';
    }

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">텍스트 콘텐츠</h3>
          </div>
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayText}
            </div>
            {showPreview && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  이 콘텐츠는 미리보기입니다. 전체 내용을 보시려면 구매가 필요합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 비디오 콘텐츠
  if (isVideo) {
    return (
      <div className="bg-black rounded-2xl overflow-hidden">
        <div className="aspect-video relative">
          <img
            src={content.thumbnailUrl || content.mediaUrl || '/placeholder-video.jpg'}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-blue-600 ml-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 기본 (타입을 알 수 없는 경우)
  return (
    <div className="bg-gray-100 rounded-2xl p-8 text-center">
      <p className="text-gray-600">콘텐츠를 불러올 수 없습니다.</p>
    </div>
  );
}
