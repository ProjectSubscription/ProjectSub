import React from 'react';
import { PaymentItemInfo } from '@/components/payment/PaymentItemInfo';
import { CouponSection } from '@/components/payment/CouponSection';
import { PaymentMethod } from '@/components/payment/PaymentMethod';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { getSubscriptionPlans, createSubscription, getContent } from '@/app/lib/api';
import { mockCoupons } from '@/app/mockData';

export function PaymentPage({ type, itemId, channelId, onNavigate }) {
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [item, setItem] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);

  // 구독 상품 또는 콘텐츠 정보 조회
  React.useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        if (type === 'subscription' && channelId && itemId) {
          const plans = await getSubscriptionPlans(channelId);
          const plan = plans?.find(p => p.planId === Number(itemId));
          if (plan) {
            // PlanType을 한글로 변환
            const planTypeName = plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독';
            setItem({
              ...plan,
              name: planTypeName,
              description: plan.planType === 'MONTHLY' 
                ? '모든 강의 무제한 시청' 
                : '모든 강의 무제한 시청 + 특별 보너스',
              duration: plan.planType
            });
          }
        } else if (type === 'content' && itemId) {
          const content = await getContent(itemId);
          setItem(content);
        }
      } catch (err) {
        console.error('결제 정보 조회 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [type, itemId, channelId]);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">오류: {error}</div>;
  }

  if (!item) {
    return <div className="text-center py-12">결제 정보를 찾을 수 없습니다.</div>;
  }

  const baseAmount = item.price || 0;
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
    if (processing) return;
    
    try {
      setProcessing(true);
      
      if (type === 'subscription' && channelId && itemId) {
        // 구독 신청
        const subscriptionId = await createSubscription(
          Number(channelId), 
          Number(itemId)
        );
        
        // TODO: 실제 결제 API 호출 (현재는 구독 신청만 처리)
        // await paySubscription({ subscriptionId });
        
        alert('구독이 완료되었습니다!');
        onNavigate('payment-success', { amount: finalAmount, subscriptionId });
      } else if (type === 'content' && itemId) {
        // 콘텐츠 단건 구매
        // TODO: purchaseContent API 호출
        alert('결제가 완료되었습니다!');
        onNavigate('payment-success', { amount: finalAmount });
      }
    } catch (err) {
      console.error('결제 실패:', err);
      alert('결제에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setProcessing(false);
    }
  };

  const availableCoupons = mockCoupons.filter(c => !c.isUsed);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">결제하기</h1>
        <p className="text-gray-600">안전한 결제 환경을 제공합니다</p>
      </div>

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
            processing={processing}
          />
        </div>
      </div>
    </div>
  );
}
