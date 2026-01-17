import React from 'react';
import { PaymentItemInfo } from '@/components/payment/PaymentItemInfo';
import { CouponSection } from '@/components/payment/CouponSection';
import { PaymentMethod } from '@/components/payment/PaymentMethod';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { mockContents, mockCoupons } from '@/app/mockData';
import { getSubscriptionPlans, getContent, createSubscription } from '@/app/lib/api';
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
    const coupon = mockCoupons.find(c => c.code === couponCode && !c.isUsed);
    if (coupon) {
      if (baseAmount >= (coupon.minAmount || 0)) {
        setAppliedCoupon(coupon);
      } else {
        alert(`최소 ${coupon.minAmount?.toLocaleString()}원 이상 구매 시 사용 가능합니다.`);
      }
    } else {
      alert('유효하지 않은 쿠폰입니다.');
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

  const availableCoupons = mockCoupons.filter(c => !c.isUsed);

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
