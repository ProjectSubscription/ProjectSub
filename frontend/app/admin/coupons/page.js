'use client';

import { useEffect, useState } from 'react';
import { createAdminCoupon, getAdminCoupons, getSubscriptionPlans, getContents } from '@/app/lib/api';

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

// 쿠폰 상태 판단 함수
const getCouponStatus = (expiredAt) => {
  if (!expiredAt) return null;
  const now = new Date();
  const expiredDate = new Date(expiredAt);
  return now <= expiredDate ? 'active' : 'expired';
};

export default function AdminCouponsPage() {
  const [discountType, setDiscountType] = useState('RATE');
  const [discountValue, setDiscountValue] = useState('');
  const [refundType, setRefundType] = useState('RESTORE_ON_REFUND');
  const [expiredAt, setExpiredAt] = useState('');

  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [channelId, setChannelId] = useState('');

  // 적용 대상 목록 (구독 상품 또는 콘텐츠)
  const [targetOptions, setTargetOptions] = useState([]);
  const [targetOptionsLoading, setTargetOptionsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCouponCode, setCreatedCouponCode] = useState('');

  const [coupons, setCoupons] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  
  // 쿠폰별 구독 상품 이름을 저장 (targetId와 channelId 조합으로 캐시)
  const [subscriptionPlanNames, setSubscriptionPlanNames] = useState({});

  const loadCoupons = async () => {
    try {
      setListLoading(true);
      setListError('');
      const data = await getAdminCoupons();
      
      // 배열 또는 Page 형태 모두 대응
      const list = Array.isArray(data) ? data : data?.content || [];
      setCoupons(list);
      
      // 각 쿠폰의 구독 상품 이름 로드
      await loadSubscriptionPlanNames(list);
    } catch (err) {
      setListError(err.message || '쿠폰 목록을 불러오는 중 오류가 발생했습니다.');
      console.error('쿠폰 목록 조회 오류:', err);
    } finally {
      setListLoading(false);
    }
  };

  // 쿠폰별 구독 상품 이름 로드 (채널별로 한 번만 호출하도록 최적화)
  const loadSubscriptionPlanNames = async (couponList) => {
    const planNamesMap = {};
    const channelPlansCache = {}; // 채널별 구독 상품 목록 캐시
    
    // 구독 상품 타겟이 있는 쿠폰들만 처리
    for (const coupon of couponList) {
      if (coupon.targets && Array.isArray(coupon.targets) && coupon.targets.length > 0) {
        const target = coupon.targets[0]; // 첫 번째 target 사용
        console.log(`쿠폰 ${coupon.id}의 target:`, target);
        
        // 구독 상품인 경우 구독 상품 이름 가져오기
        const targetType = target.targetType?.toUpperCase?.() || target.targetType;
        if (targetType === 'SUBSCRIPTION' && target.targetId && coupon.channelId) {
          try {
            // 채널별 구독 상품 목록을 캐시에서 가져오거나 새로 로드
            let plans = channelPlansCache[coupon.channelId];
            if (!plans) {
              console.log(`채널 ${coupon.channelId}의 구독 상품 목록 로드 중...`);
              const plansData = await getSubscriptionPlans(coupon.channelId);
              plans = Array.isArray(plansData) ? plansData : plansData?.content || [];
              channelPlansCache[coupon.channelId] = plans;
              console.log(`채널 ${coupon.channelId}의 구독 상품 목록:`, plans);
            }
            
            // targetId와 planId를 숫자로 비교
            const targetIdNum = Number(target.targetId);
            const plan = plans.find(p => {
              const planId = Number(p.planId || p.id);
              return planId === targetIdNum;
            });
            if (plan) {
              const planTypeName = plan.planType === 'MONTHLY' ? '월간' : '연간';
              planNamesMap[coupon.id] = `${planTypeName} 구독`;
            } else {
            }
          } catch (err) {
            console.error(`쿠폰 ${coupon.id}의 구독 상품 정보 조회 오류:`, err);
          }
        }
      }
    }
    setSubscriptionPlanNames(planNamesMap);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // 적용 대상 목록 로드 (targetType과 channelId가 모두 있을 때)
  useEffect(() => {
    const loadTargetOptions = async () => {
      if (!targetType || !channelId) {
        setTargetOptions([]);
        setTargetId('');
        return;
      }

      setTargetOptionsLoading(true);
      try {
        if (targetType === 'SUBSCRIPTION') {
          const plans = await getSubscriptionPlans(Number(channelId));
          const list = Array.isArray(plans) ? plans : plans?.content || [];
          setTargetOptions(
            list.map((plan) => ({
              id: plan.planId,
              label: `${plan.planType === 'MONTHLY' ? '월간' : '연간'} 구독 (${plan.price?.toLocaleString()}원)`,
            }))
          );
        } else if (targetType === 'CONTENT') {
          const contents = await getContents({ channelId: Number(channelId) });
          const list = Array.isArray(contents) ? contents : contents?.content || [];
          setTargetOptions(
            list.map((content) => ({
              id: content.contentId || content.id,
              label: content.title || '제목 없음',
            }))
          );
        }
      } catch (err) {
        console.error('적용 대상 목록 조회 오류:', err);
        setTargetOptions([]);
      } finally {
        setTargetOptionsLoading(false);
      }
    };

    loadTargetOptions();
  }, [targetType, channelId]);

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
      channelId: channelId ? Number(channelId) : null,
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
      setChannelId('');
      setTargetOptions([]);
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

          {/* 채널 ID (선택) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널 ID (선택)
            </label>
            <input
              type="number"
              min={1}
              value={channelId}
              onChange={(e) => {
                setChannelId(e.target.value);
                setTargetId(''); // 채널 ID 변경 시 선택 초기화
              }}
              placeholder="특정 채널에 연결할 쿠폰인 경우 채널 ID 입력"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              비워두면 전체 채널에 사용 가능한 쿠폰이 생성됩니다.
            </p>
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
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    setTargetId(''); // 타입 변경 시 선택 초기화
                  }}
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
                {targetType && channelId ? (
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || targetOptionsLoading}
                  >
                    <option value="">전체 {targetType === 'SUBSCRIPTION' ? '구독 상품' : '콘텐츠'}에 적용</option>
                    {targetOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder={targetType ? '채널 ID를 먼저 입력해주세요' : '적용 대상을 먼저 선택해주세요'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    disabled={true}
                  />
                )}
                {targetOptionsLoading && (
                  <p className="mt-1 text-xs text-gray-500">목록을 불러오는 중...</p>
                )}
                {targetType && channelId && !targetOptionsLoading && targetOptions.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    해당 채널에 {targetType === 'SUBSCRIPTION' ? '구독 상품' : '콘텐츠'}가 없습니다.
                  </p>
                )}
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
                    채널 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    적용 대상
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    구독 상품
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    환불 정책
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    만료 일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon.expiredAt);
                  const target = coupon.targets?.[0]; // 첫 번째 target 사용
                  
                  // 디버깅: target 정보 확인 (첫 번째 쿠폰만)
                  if (coupon.id === coupons[0]?.id) {
                    console.log('첫 번째 쿠폰 데이터:', {
                      id: coupon.id,
                      targets: coupon.targets,
                      target: target,
                      subscriptionPlanNames: subscriptionPlanNames
                    });
                  }
                  
                  // targetType이 문자열로 올 수 있으므로 대소문자 구분 없이 비교
                  const targetType = target?.targetType?.toUpperCase?.() || target?.targetType;
                  let targetTypeLabel = '-';
                  if (target) {
                    if (targetType === 'SUBSCRIPTION') {
                      targetTypeLabel = target.targetId ? '구독 상품 (특정)' : '구독 상품 (전체)';
                    } else if (targetType === 'CONTENT') {
                      targetTypeLabel = target.targetId ? '콘텐츠 단건 구매 (특정)' : '콘텐츠 단건 구매 (전체)';
                    }
                  } else if (coupon.targets && coupon.targets.length > 0) {
                    targetTypeLabel = '전체';
                  }
                  
                  const planName = subscriptionPlanNames[coupon.id];
                  
                  return (
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
                        {coupon.channelId ? coupon.channelId : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {targetTypeLabel}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {planName || '-'}
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
                      <td className="px-6 py-4">
                        {status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            활성
                          </span>
                        ) : status === 'expired' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            만료
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}