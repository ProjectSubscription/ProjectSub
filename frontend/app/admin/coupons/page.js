'use client';

import { useEffect, useState } from 'react';
import { createAdminCoupon, getAdminCoupons } from '@/app/lib/api';

const DISCOUNT_TYPES = [
  { value: 'RATE', label: '비율 할인 (%)' },
  { value: 'AMOUNT', label: '금액 할인 (원)' },
];

const REFUND_TYPES = [
  { value: 'RESTORE_ON_REFUND', label: '환불 시 쿠폰 복원' },
  { value: 'EXPIRE_ON_REFUND', label: '환불 시 쿠폰 소멸' },
];

const TARGET_TYPES = [
  { value: 'SUBSCRIPTION', label: '구독 상품' },
  { value: 'CONTENT', label: '콘텐츠 단건 구매' },
];

export default function AdminCouponsPage() {
  const [discountType, setDiscountType] = useState('RATE');
  const [discountValue, setDiscountValue] = useState('');
  const [refundType, setRefundType] = useState('RESTORE_ON_REFUND');
  const [expiredAt, setExpiredAt] = useState('');

  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCouponCode, setCreatedCouponCode] = useState('');

  const [coupons, setCoupons] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const loadCoupons = async () => {
    try {
      setListLoading(true);
      setListError('');
      const data = await getAdminCoupons();
      // 배열 또는 Page 형태 모두 대응
      const list = Array.isArray(data) ? data : data?.content || [];
      setCoupons(list);
    } catch (err) {
      setListError(err.message || '쿠폰 목록을 불러오는 중 오류가 발생했습니다.');
      console.error('쿠폰 목록 조회 오류:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatedCouponCode('');

    // 기본 검증
    if (!discountValue || Number(discountValue) <= 0) {
      setError('할인 값을 올바르게 입력해주세요.');
      return;
    }

    if (!expiredAt) {
      setError('쿠폰 만료 일시를 입력해주세요.');
      return;
    }

    if (discountType === 'RATE') {
      const value = Number(discountValue);
      if (value < 1 || value > 100) {
        setError('비율 할인은 1~100 사이의 정수여야 합니다.');
        return;
      }
    }

    const payload = {
      discountType,
      discountValue: Number(discountValue),
      refundType,
      expiredAt, // LocalDateTime 문자열 (예: 2026-01-15T23:59)
      targets:
        targetType
          ? [
              {
                targetType,
                targetId: targetId ? Number(targetId) : null,
              },
            ]
          : [],
    };

    setIsSubmitting(true);
    try {
      const res = await createAdminCoupon(payload);
      setSuccess('쿠폰이 성공적으로 생성되었습니다.');
      if (res && res.code) {
        setCreatedCouponCode(res.code);
      }
      // 입력값 초기화 (만료일은 유지)
      setDiscountValue('');
      setTargetType('');
      setTargetId('');
      // 목록 새로고침
      await loadCoupons();
    } catch (err) {
      setError(err.message || '쿠폰 생성 중 오류가 발생했습니다.');
      console.error('쿠폰 생성 오류:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">쿠폰 관리</h1>
        <p className="text-gray-600">쿠폰을 생성하고, 발급 및 사용 현황을 관리하는 관리자 전용 페이지입니다.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">새 쿠폰 생성</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <p>{success}</p>
              {createdCouponCode && (
                <p className="mt-1">
                  자동 생성된 쿠폰 코드:{' '}
                  <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded">
                    {createdCouponCode}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* 할인 정보 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                할인 유형 <span className="text-red-500">*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                할인 값 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'RATE' ? '예: 10 (10%)' : '예: 3000 (3,000원)'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 환불 정책 & 만료일 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 시 쿠폰 처리
              </label>
              <select
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {REFUND_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                만료 일시 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                이 시점 이후에는 쿠폰 발급 및 사용이 모두 불가능합니다.
              </p>
            </div>
          </div>

          {/* 적용 대상 (선택) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                적용 대상 (선택)
              </label>
              <span className="text-xs text-gray-400">
                비워두면 모든 구독/콘텐츠에 사용 가능합니다.
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">전체 대상</option>
                  {TARGET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="특정 상품 ID (선택)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || !targetType}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '쿠폰 생성 중...' : '쿠폰 생성하기'}
          </button>
        </form>
      </div>

      {/* 쿠폰 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">쿠폰 목록</h2>
          <p className="text-xs text-gray-400">
            총 {coupons.length}개
          </p>
        </div>

        {listError && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-sm text-red-700">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            쿠폰 목록을 불러오는 중입니다...
          </div>
        ) : coupons.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            생성된 쿠폰이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    쿠폰 코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    할인 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    환불 정책
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    만료 일시
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {coupon.discountType === 'RATE'
                        ? `비율 ${coupon.discountValue}%`
                        : `금액 ${coupon.discountValue?.toLocaleString()}원`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {coupon.refundType === 'EXPIRE_ON_REFUND'
                        ? '환불 시 쿠폰 소멸'
                        : '환불 시 쿠폰 복원'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {coupon.expiredAt
                        ? new Date(coupon.expiredAt).toLocaleString('ko-KR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}