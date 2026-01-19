import React from 'react';
import { Heart, Share2, Eye, Calendar } from 'lucide-react';

export function ContentInfo({ content, isLiked, onLikeToggle, onPurchase, hasAccess }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
          {/* 가격 표시 및 구매 버튼 - 무료 콘텐츠 제외, 접근 권한이 없을 때만 표시 */}
          {content.accessType !== 'FREE' && content.price && !hasAccess && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {content.price.toLocaleString()}원
                </span>
                {content.accessType === 'PARTIAL' && content.previewRatio && (
                  <span className="text-sm text-gray-500">
                    (미리보기 {content.previewRatio}%)
                  </span>
                )}
              </div>
              {onPurchase && (
                <button
                  onClick={onPurchase}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {content.accessType === 'SUBSCRIBER_ONLY'
                    ? '구독하러 가기'
                    : '구매하기'}
                </button>
              )}
            </div>
          )}
          {/* 구독 필요 타입인데 가격이 없고 접근 권한이 없는 경우 */}
          {content.accessType === 'SUBSCRIBER_ONLY' && !content.price && !hasAccess && onPurchase && (
            <button
              onClick={onPurchase}
              className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              구독하러 가기
            </button>
          )}
          {/* 구매/구독 완료 메시지 */}
          {content.accessType !== 'FREE' && hasAccess && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                {content.accessType === 'SUBSCRIBER_ONLY'
                  ? '✓ 구독 중'
                  : content.accessType === 'SINGLE_PURCHASE'
                  ? '✓ 구매 완료'
                  : content.accessType === 'PARTIAL'
                  ? '✓ 구매 완료'
                  : '✓ 접근 가능'}
              </span>
            </div>
          )}
        </div>
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
          {content.accessType === 'SUBSCRIBER_ONLY' && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              구독 필요
            </span>
          )}
          {content.accessType === 'SINGLE_PURCHASE' && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
              단일 구매
            </span>
          )}
          {content.accessType === 'PARTIAL' && !hasAccess && content.previewRatio && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
              미리보기 {content.previewRatio}%
            </span>
          )}
        </div>
      </div>

      {/* 텍스트 콘텐츠 본문 표시 */}
      {content.contentType === 'TEXT' && content.body && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">콘텐츠</h3>
            </div>
            {(() => {
              // PARTIAL 타입이고 접근 권한이 없을 때만 미리보기 표시
              // PARTIAL이 아니고 접근 권한이 없으면 내용을 가림
              const showPreview = content.accessType === 'PARTIAL' && !hasAccess;
              const showContent = hasAccess || showPreview;
              
              if (!showContent) {
                // 접근 권한이 없고 PARTIAL이 아닌 경우 내용을 가림
                return (
                  <div className="bg-gray-100 rounded-lg p-12 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">콘텐츠가 잠겨있습니다</h4>
                    <p className="text-gray-600 mb-6">
                      {content.accessType === 'SUBSCRIBER_ONLY'
                        ? '이 콘텐츠를 보려면 채널 구독이 필요합니다.'
                        : '이 콘텐츠를 구매하시면 볼 수 있습니다.'}
                    </p>
                    {onPurchase && (
                      <button
                        onClick={onPurchase}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        {content.accessType === 'SUBSCRIBER_ONLY' ? '구독하러 가기' : '구매하기'}
                      </button>
                    )}
                  </div>
                );
              }
              
              // 접근 권한이 있거나 PARTIAL 미리보기인 경우 내용 표시
              const body = content.body || '';
              let displayText = body;
              if (showPreview && content.previewRatio) {
                const previewLength = Math.floor(body.length * (content.previewRatio / 100));
                displayText = body.substring(0, previewLength) + '...';
              }
              
              return (
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
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
