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
 * @param {Array} coupon.targets - 쿠폰 적용 대상
 * @param {Function} onIssueSuccess - 쿠폰 발급 성공 시 콜백
 */
export default function CouponCard({ coupon, onIssueSuccess }) {
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

  return (
    <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      {/* 쿠폰 카드 컨테이너 */}
      <div className="flex h-full min-h-[140px]">
        {/* 왼쪽: 쿠폰 정보 */}
        <div className="flex-1 p-6 pr-4 flex flex-col justify-between">
          <div>
            {/* 할인 정보 */}
            <div className="mb-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                {formatDiscount()}
              </h3>
            </div>

            {/* 쿠폰 설명 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {coupon.targets?.some(t => t.targetType === 'CONTENT') && (
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    앱전용
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {coupon.targets?.length > 0 ? (
                  <span>
                    {coupon.targets[0].targetType === 'SUBSCRIPTION' ? '구독' : '콘텐츠'} 결제 시 사용 가능
                  </span>
                ) : (
                  <span>결제 시 사용 가능</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatExpiredAt()}
              </div>
            </div>
          </div>
        </div>

        {/* 가운데 점선 구분선 */}
        <div className="relative w-8 flex-shrink-0">
          <div className="absolute inset-y-0 left-1/2 w-0.5 border-l-2 border-dashed border-gray-300"></div>
        </div>

        {/* 오른쪽: 상태 표시 (가운데 정렬) */}
        <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center p-4">
          {isIssued ? (
            <div className="flex flex-col items-center">
              {/* 완료 상태 */}
              <div className="mb-1.5">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-blue-600">완료</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* 받기 버튼 */}
              <button
                onClick={handleIssue}
                disabled={isIssuing}
                className="mb-1.5 p-2 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              <span className="text-sm font-semibold text-blue-600">
                {isIssuing ? '발급 중...' : '받기'}
              </span>
            </div>
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
