'use client';

import { useState, useEffect } from 'react';
import CouponCard from './CouponCard';

/**
 * 쿠폰 목록 컴포넌트
 * 
 * @param {Array} coupons - 쿠폰 목록
 * @param {Function} onRefresh - 목록 새로고침 콜백
 */
export default function CouponList({ coupons = [], onRefresh }) {
  const [localCoupons, setLocalCoupons] = useState(coupons);

  useEffect(() => {
    setLocalCoupons(coupons);
  }, [coupons]);

  const handleIssueSuccess = (couponId) => {
    // 발급 성공 시 해당 쿠폰의 isIssued 상태 업데이트
    setLocalCoupons(prevCoupons =>
      prevCoupons.map(coupon =>
        coupon.id === couponId ? { ...coupon, isIssued: true } : coupon
      )
    );

    // 부모 컴포넌트에 새로고침 요청
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!localCoupons || localCoupons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        다운로드 가능한 쿠폰이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {localCoupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          onIssueSuccess={handleIssueSuccess}
        />
      ))}
    </div>
  );
}
