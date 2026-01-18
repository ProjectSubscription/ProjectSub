'use client';

import { useState } from 'react';
import { issueCoupon } from '@/app/lib/api';

/**
 * 쿠폰 카드 컴포넌트
 * 이미지 디자인을 참고하여 쿠폰 카드 형태로 표시
 * 
 * @param {Object} coupon - 쿠폰 정보
 * @param {number} coupon.id - 쿠폰 ID
 * @param {string} coupon.code - 쿠폰 코드
 * @param {string} coupon.discountType - 할인 타입 (RATE, AMOUNT)
 * @param {number} coupon.discountValue - 할인 값
 * @param {string} coupon.expiredAt - 만료일
 * @param {boolean} coupon.isIssued - 발급 여부
 * @param {string} coupon.usedAt - 사용일 (null이면 미사용, MyCouponCard에서 사용)
 * @param {Array} coupon.targets - 쿠폰 적용 대상
 * @param {Function} onIssueSuccess - 쿠폰 발급 성공 시 콜백
 * @param {boolean} hideCode - 쿠폰 코드 숨김 여부
 * @param {string} mode - 모드 ('issue' | 'my'), 기본값 'issue'
 * @param {Function} renderRightSection - 오른쪽 섹션 커스텀 렌더링 함수
 */
export default function CouponCard({ coupon, onIssueSuccess, hideCode = false, mode = 'issue', renderRightSection }) {
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState(null);
  const [isIssued, setIsIssued] = useState(coupon.isIssued);

  // 할인 정보 포맷팅
  const formatDiscount = () => {
    if (coupon.discountType === 'RATE') {
      return `${coupon.discountValue}% 할인`;
    } else {
      return `${coupon.discountValue?.toLocaleString()}원 할인`;
    }
  };

  // 만료일 포맷팅
  const formatExpiredAt = () => {
    if (!coupon.expiredAt) return '';
    const date = new Date(coupon.expiredAt);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}까지`;
  };

  // 쿠폰 발급 처리
  const handleIssue = async () => {
    if (isIssued || isIssuing) return;

    setIsIssuing(true);
    setError(null);

    try {
      await issueCoupon(coupon.id);
      setIsIssued(true);
      if (onIssueSuccess) {
        onIssueSuccess(coupon.id);
      }
    } catch (err) {
      setError(err.message || '쿠폰 발급에 실패했습니다.');
      console.error('쿠폰 발급 오류:', err);
    } finally {
      setIsIssuing(false);
    }
  };

  // 쿠폰 사용 가능 대상 확인
  // targets가 null이거나 비어있으면 둘 다 사용 가능 (뱃지 두 개 표시)
  const targets = coupon.targets || [];
  const hasSubscription = targets.length === 0 || targets.some(t => t.targetType === 'SUBSCRIPTION');
  const hasContent = targets.length === 0 || targets.some(t => t.targetType === 'CONTENT');

  // MyCouponCard 모드에서 사용되는 상태 계산
  const isUsed = mode === 'my' && coupon.usedAt !== null && coupon.usedAt !== undefined;
  const isExpired = mode === 'my' && coupon.expiredAt && new Date(coupon.expiredAt) < new Date();
  const isDisabled = isUsed || isExpired;

  return (
    <div className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border h-full ${
      mode === 'my' && isDisabled ? 'border-gray-200 opacity-60' : 'border-gray-100'
    }`}>
      {/* 쿠폰 카드 컨테이너 */}
      <div className="flex h-full min-h-[180px]">
        {/* 왼쪽: 쿠폰 정보 */}
        <div className="flex-1 p-6 pr-4 flex flex-col justify-between">
          <div>
            {/* 할인 정보 */}
            <div className="mb-3">
              <h3 className={`text-2xl font-bold bg-gradient-to-r ${
                mode === 'my' && isDisabled ? 'from-gray-600 to-gray-600' : 'from-blue-600 to-blue-600'
              } bg-clip-text text-transparent`}>
                {formatDiscount()}
              </h3>
            </div>

            {/* 쿠폰 설명 */}
            <div className="space-y-1.5">
              {/* 뱃지 표시 */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasSubscription && (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    mode === 'my' && isDisabled ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    구독
                  </span>
                )}
                {hasContent && (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    mode === 'my' && isDisabled ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'
                  }`}>
                    콘텐츠
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {coupon.targets?.length > 0 ? (
                  <span>
                    {hasSubscription && hasContent
                      ? '구독/콘텐츠'
                      : hasSubscription
                      ? '구독'
                      : '콘텐츠'} 결제 시 사용 가능
                  </span>
                ) : (
                  <span>결제 시 사용 가능</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatExpiredAt()}
              </div>
              {coupon.code && !hideCode && (
                <div className="text-xs text-gray-400 mt-1">
                  쿠폰 코드: {coupon.code}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 가운데 점선 구분선 */}
        <div className="relative w-8 flex-shrink-0">
          <div className="absolute inset-y-0 left-1/2 w-0.5 border-l-2 border-dashed border-gray-300"></div>
        </div>

        {/* 오른쪽: 상태 표시 (가운데 정렬) */}
        <div className="flex-shrink-0 w-22 flex flex-col items-center justify-center p-4 text-center">
          {renderRightSection ? (
            renderRightSection({ isUsed, isExpired, isDisabled })
          ) : mode === 'my' ? (
            // MyCouponCard 모드: 사용/만료 상태 표시
            isUsed ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-1.5">
                  <svg
                    className="w-6 h-6 text-gray-600 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-600 text-center">사용 완료</span>
              </div>
            ) : isExpired ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-1.5">
                  <svg
                    className="w-6 h-6 text-red-600 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-red-600 text-center">만료됨</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-1.5">
                  <svg
                    className="w-6 h-6 text-green-600 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-green-600 text-center">사용 가능</span>
              </div>
            )
          ) : (
            // 기본 모드: 쿠폰 발급 버튼
            isIssued ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-1.5">
                  <svg
                    className="w-6 h-6 text-green-600 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-green-600 text-center">사용 가능</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={handleIssue}
                  disabled={isIssuing}
                  className="mb-1.5 p-2 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mx-auto"
                >
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-blue-600 text-center">
                  {isIssuing ? '발급 중...' : '받기'}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-6 pb-4">
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
