'use client';

import CouponCard from './CouponCard';

/**
 * 다운받은 쿠폰 카드 컴포넌트
 * 사용자가 이미 다운받은 쿠폰을 표시
 * CouponCard를 재사용하여 구성
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
  return <CouponCard coupon={coupon} mode="my" hideCode={false} />;
}
