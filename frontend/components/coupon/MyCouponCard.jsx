'use client';

/**
 * 다운받은 쿠폰 카드 컴포넌트
 * 사용자가 이미 다운받은 쿠폰을 표시
 * 
 * @param {Object} coupon - 쿠폰 정보
 * @param {number} coupon.id - 쿠폰 ID
 * @param {string} coupon.code - 쿠폰 코드
 * @param {string} coupon.discountType - 할인 타입 (RATE, AMOUNT)
 * @param {number} coupon.discountValue - 할인 값
 * @param {string} coupon.expiredAt - 만료일
 * @param {string} coupon.usedAt - 사용일 (null이면 미사용)
 * @param {Array} coupon.targets - 쿠폰 적용 대상
 */
export default function MyCouponCard({ coupon }) {
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

  // 쿠폰 사용 여부 확인
  const isUsed = coupon.usedAt !== null && coupon.usedAt !== undefined;
  
  // 쿠폰 만료 여부 확인
  const isExpired = coupon.expiredAt && new Date(coupon.expiredAt) < new Date();
  
  // 쿠폰 상태 결정
  const getStatus = () => {
    if (isUsed) return { text: '사용 완료', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    if (isExpired) return { text: '만료됨', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' };
    return { text: '사용 가능', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' };
  };

  const status = getStatus();

  return (
    <div className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border ${
      isUsed || isExpired ? 'border-gray-200 opacity-60' : 'border-gray-100'
    }`}>
      {/* 쿠폰 카드 컨테이너 */}
      <div className="flex h-full min-h-[140px]">
        {/* 왼쪽: 쿠폰 정보 */}
        <div className="flex-1 p-6 pr-4 flex flex-col justify-between">
          <div>
            {/* 할인 정보 */}
            <div className="mb-3">
              <h3 className={`text-2xl font-bold bg-gradient-to-r ${
                isUsed || isExpired ? 'from-gray-600 to-gray-600' : 'from-blue-600 to-blue-600'
              } bg-clip-text text-transparent`}>
                {formatDiscount()}
              </h3>
            </div>

            {/* 쿠폰 설명 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {coupon.targets?.some(t => t.targetType === 'CONTENT') && (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    isUsed || isExpired ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    앱전용
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                  {status.text}
                </span>
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
              {coupon.code && (
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
        <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center p-4">
          {isUsed ? (
            <div className="flex flex-col items-center">
              {/* 사용 완료 상태 */}
              <div className="mb-1.5">
                <svg
                  className="w-6 h-6 text-gray-600"
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
              <span className="text-sm font-semibold text-gray-600">사용 완료</span>
            </div>
          ) : isExpired ? (
            <div className="flex flex-col items-center">
              {/* 만료 상태 */}
              <div className="mb-1.5">
                <svg
                  className="w-6 h-6 text-red-600"
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
              <span className="text-sm font-semibold text-red-600">만료됨</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* 사용 가능 상태 */}
              <div className="mb-1.5">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <span className="text-sm font-semibold text-green-600">사용 가능</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
