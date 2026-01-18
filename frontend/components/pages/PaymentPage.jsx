import React from 'react';
import { PaymentItemInfo } from '@/components/payment/PaymentItemInfo';
import { CouponSection } from '@/components/payment/CouponSection';
import { PaymentMethod } from '@/components/payment/PaymentMethod';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { mockContents, mockCoupons } from '@/app/mockData';
import { getSubscriptionPlans, getContent, createSubscription, getMyCoupons, getAvailableCoupons, purchaseContent } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

export function PaymentPage({ type, itemId, channelId, onNavigate }) {
  const router = useRouter();
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [loading, setLoading] = React.useState(false);
  const [itemLoading, setItemLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [item, setItem] = React.useState(null);
  const [myCoupons, setMyCoupons] = React.useState([]);
  const [availableCouponsList, setAvailableCouponsList] = React.useState([]);
  const [couponLoading, setCouponLoading] = React.useState(false);

  // 구독 플랜 또는 콘텐츠 정보 로드
  React.useEffect(() => {
    async function loadItem() {
      try {
        setItemLoading(true);
        let itemData;
        
        if (type === 'subscription') {
          // 구독 플랜 조회
          if (!channelId) {
            throw new Error('채널 ID가 필요합니다.');
          }
          const plans = await getSubscriptionPlans(channelId);
          const plansList = Array.isArray(plans) ? plans : [];
          itemData = plansList.find(p => p.planId === Number(itemId) || p.id === Number(itemId));
        } else {
          // 콘텐츠 조회
          itemData = await getContent(itemId);
        }

        if (!itemData) {
          throw new Error('결제 정보를 찾을 수 없습니다.');
        }

        setItem(itemData);
      } catch (err) {
        console.error('아이템 로딩 실패:', err);
        setError(err.message || '결제 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setItemLoading(false);
      }
    }

    if (itemId) {
      loadItem();
    }
  }, [type, itemId, channelId]);

  // 사용 가능한 쿠폰 목록 로드
  React.useEffect(() => {
    async function loadCoupons() {
      try {
        setCouponLoading(true);
        // 보유 쿠폰과 사용 가능한 쿠폰을 모두 가져옴
        const [myCouponsData, availableCouponsData] = await Promise.all([
          getMyCoupons().catch(() => []), // 에러 시 빈 배열 반환
          getAvailableCoupons().catch(() => []) // 에러 시 빈 배열 반환
        ]);
        
        setMyCoupons(Array.isArray(myCouponsData) ? myCouponsData : []);
        setAvailableCouponsList(Array.isArray(availableCouponsData) ? availableCouponsData : []);
      } catch (err) {
        console.error('쿠폰 목록 로딩 실패:', err);
        // 쿠폰 로딩 실패는 치명적이지 않으므로 에러를 표시하지 않음
      } finally {
        setCouponLoading(false);
      }
    }

    loadCoupons();
  }, []);

  if (itemLoading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error || !item) {
    return <div className="text-center py-12 text-red-600">{error || '결제 정보를 찾을 수 없습니다.'}</div>;
  }

  const baseAmount = 'price' in item ? item.price || 0 : item.price;
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENT'
      ? Math.min(baseAmount * (appliedCoupon.discountValue / 100), appliedCoupon.maxDiscount || Infinity)
      : appliedCoupon.discountValue
    : 0;
  const finalAmount = baseAmount - discount;

  const handleApplyCoupon = () => {
    if (!couponCode || couponCode.trim() === '') {
      alert('쿠폰 코드를 입력해주세요.');
      return;
    }

    // 보유 쿠폰에서 코드로 검색 (사용 가능한 것만)
    const foundCoupon = myCoupons.find(c => {
      const isUsed = c.usedAt !== null && c.usedAt !== undefined;
      const isExpired = c.expiredAt && new Date(c.expiredAt) < new Date();
      const codeMatch = c.code && c.code.toUpperCase() === couponCode.toUpperCase().trim();
      return codeMatch && !isUsed && !isExpired;
    });

    if (foundCoupon) {
      // 쿠폰 타입 확인 (구독/콘텐츠)
      const paymentType = type === 'subscription' ? 'SUBSCRIPTION' : 'CONTENT';
      const hasValidTarget = !foundCoupon.targets || foundCoupon.targets.length === 0 || 
        foundCoupon.targets.some(t => 
          (paymentType === 'SUBSCRIPTION' && t.targetType === 'SUBSCRIPTION') ||
          (paymentType === 'CONTENT' && t.targetType === 'CONTENT')
        );

      if (!hasValidTarget) {
        alert('이 쿠폰은 해당 결제 타입에 사용할 수 없습니다.');
        return;
      }

      // 최소 금액 확인 (API 응답에 minAmount가 없을 수 있으므로 우선 적용)
      setAppliedCoupon({
        id: foundCoupon.id,
        code: foundCoupon.code,
        discountType: foundCoupon.discountType === 'RATE' ? 'PERCENT' : foundCoupon.discountType,
        discountValue: foundCoupon.discountValue,
        minAmount: foundCoupon.minAmount || 0,
        maxDiscount: foundCoupon.maxDiscount || Infinity,
      });
    } else {
      alert('유효하지 않은 쿠폰입니다. 쿠폰 코드를 확인해주세요.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (type === 'subscription') {
        // 구독 결제 처리
        if (!channelId || !itemId) {
          throw new Error('채널 ID와 플랜 ID가 필요합니다.');
        }

        const planId = Number(itemId);
        const channelIdNum = Number(channelId);

        if (isNaN(planId) || isNaN(channelIdNum)) {
          throw new Error('유효하지 않은 플랜 ID 또는 채널 ID입니다.');
        }

        // 구독 생성 (결제는 추후 통합 예정)
        // TODO: 실제 결제 API 연동 시 paySubscription 호출 후 구독 생성
        try {
          const subscriptionId = await createSubscription(channelIdNum, planId);
          console.log('구독 생성 성공:', subscriptionId);

          // 결제 성공 페이지로 이동
          onNavigate('payment-success', { 
            amount: finalAmount,
            type: 'subscription',
            subscriptionId: subscriptionId 
          });
        } catch (subscribeErr) {
          console.error('구독 생성 실패:', subscribeErr);
          throw subscribeErr;
        }
      } else {
        // 콘텐츠 단건 구매 처리 (기존 로직 유지)
        const contentId = Number(itemId);
        if (isNaN(contentId)) {
          throw new Error('유효하지 않은 콘텐츠 ID입니다.');
        }

        // 콘텐츠 결제 API 호출
        const paymentData = {
          contentId: contentId,
          amount: finalAmount,
          couponCode: appliedCoupon?.code || null,
        };

        const paymentResponse = await purchaseContent(paymentData);
        console.log('콘텐츠 결제 성공:', paymentResponse);

        // 결제 성공 페이지로 이동
        onNavigate('payment-success', { 
          amount: finalAmount,
          type: 'content',
          contentId: contentId 
        });
      }
    } catch (err) {
      console.error('결제 처리 중 오류 발생:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용 가능한 쿠폰 목록 (보유 쿠폰 중 사용 가능한 것만)
  const availableCoupons = myCoupons
    .filter(c => {
      const isUsed = c.usedAt !== null && c.usedAt !== undefined;
      const isExpired = c.expiredAt && new Date(c.expiredAt) < new Date();
      return !isUsed && !isExpired;
    })
    .map(c => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType === 'RATE' ? 'PERCENT' : c.discountType,
      discountValue: c.discountValue,
      minAmount: c.minAmount || 0,
      maxDiscount: c.maxDiscount || Infinity,
    }));

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">결제하기</h1>
        <p className="text-gray-600">안전한 결제 환경을 제공합니다</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">오류:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentItemInfo item={item} type={type} />
          <CouponSection
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            availableCoupons={availableCoupons}
          />
          <PaymentMethod
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <PaymentSummary
            baseAmount={baseAmount}
            discount={discount}
            finalAmount={finalAmount}
            onPayment={handlePayment}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
