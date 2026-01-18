import React from 'react';
import { PaymentItemInfo } from '@/components/payment/PaymentItemInfo';
import { CouponSection } from '@/components/payment/CouponSection';
import { PaymentMethod } from '@/components/payment/PaymentMethod';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { mockSubscriptionPlans, mockCoupons } from '@/app/mockData';
import { getContent, getChannel, getMyInfo, getSubscriptionPlans, apiRequest } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

export function PaymentPage({ type, itemId, channelId, onNavigate }) {
  const router = useRouter();
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [item, setItem] = React.useState(null);
  const [itemLoading, setItemLoading] = React.useState(true);
  const [memberId, setMemberId] = React.useState(null);

  // 현재 로그인한 사용자 정보 가져오기
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userInfo = await getMyInfo();
        console.log('사용자 정보:', userInfo); // 디버깅용
        // MyInfoResponse는 id 필드를 가지고 있음
        if (userInfo && (userInfo.id || userInfo.memberId)) {
          setMemberId(userInfo.id || userInfo.memberId);
          console.log('memberId 설정:', userInfo.id || userInfo.memberId); // 디버깅용
        } else {
          console.warn('사용자 정보에 id가 없습니다:', userInfo);
        }
      } catch (err) {
        console.error('사용자 정보 로딩 실패:', err);
        // 로그인하지 않은 경우 에러 표시하지 않고, 결제 시점에 체크
      }
    };

    fetchCurrentUser();
  }, []);

  // 백엔드에서 아이템 정보 가져오기
  React.useEffect(() => {
    const fetchItem = async () => {
      try {
        setItemLoading(true);
        if (type === 'content' && itemId) {
          // 콘텐츠 정보 가져오기
          const id = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
          const contentData = await getContent(id);
          // PaymentItemInfo에 맞는 형식으로 변환
          setItem({
            id: contentData.id || contentData.contentId || id,
            title: contentData.title,
            description: contentData.description || contentData.body,
            price: contentData.price || 0,
            thumbnailUrl: contentData.mediaUrl || contentData.thumbnailUrl,
            accessType: contentData.accessType,
          });
        } else if (type === 'subscription' && channelId && itemId) {
          // 구독 플랜 정보 가져오기
          const numericChannelId = typeof channelId === 'string' ? parseInt(channelId, 10) : channelId;
          const numericPlanId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
          
          try {
            // 채널의 구독 플랜 목록 가져오기
            const plans = await getSubscriptionPlans(numericChannelId);
            const plan = Array.isArray(plans) ? plans.find(p => p.planId === numericPlanId || p.id === numericPlanId) : null;
            
            if (plan) {
              // 구독 플랜 정보 설정
              setItem({
                id: plan.planId || plan.id,
                title: plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독',
                description: `구독 기간: ${plan.planType === 'MONTHLY' ? '1개월' : '12개월'}`,
                price: plan.price || 0,
                planType: plan.planType,
                channelId: numericChannelId,
              });
            } else {
              throw new Error('구독 플랜을 찾을 수 없습니다.');
            }
          } catch (err) {
            console.error('구독 플랜 정보 로딩 실패:', err);
            // 채널 정보로 fallback
            const channelData = await getChannel(numericChannelId);
            setItem({
              id: numericPlanId,
              title: channelData.title || channelData.name,
              description: channelData.description || '',
              price: 0, // 가격 정보 없음
              channelId: numericChannelId,
            });
          }
        } else {
          // fallback: mockData 사용
          const plan = mockSubscriptionPlans.find(p => p.id === itemId);
          if (plan) {
            setItem(plan);
          }
        }
      } catch (err) {
        console.error('아이템 정보 로딩 실패:', err);
        setError('결제 정보를 불러오는데 실패했습니다.');
      } finally {
        setItemLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [type, itemId, channelId]);

  if (itemLoading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (!item) {
    return <div className="text-center py-12">결제 정보를 찾을 수 없습니다.</div>;
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
      // itemId에서 숫자 부분만 추출 (예: "plan-1" -> 1, "content-2" -> 2)
      // 또는 이미 숫자인 경우 그대로 사용
      let targetId;
      if (typeof itemId === 'string' && itemId.includes('-')) {
        // 문자열에서 숫자 부분 추출 (예: "plan-1" -> 1)
        const match = itemId.match(/\d+/);
        targetId = match ? parseInt(match[0], 10) : null;
      } else {
        targetId = Number(itemId);
      }

      if (!targetId || isNaN(targetId)) {
        throw new Error('유효하지 않은 상품 ID입니다.');
      }

      // 주문 생성 API 호출
      const requestBody = {
        orderType: type.toUpperCase(), // "subscription" -> "SUBSCRIPTION", "content" -> "CONTENT"
        targetId: targetId,
        originalAmount: baseAmount,
        discountAmount: appliedCoupon ? finalAmount : null, // 쿠폰 적용 시 할인된 가격, 미적용 시 null
      };

      // memberId가 없으면 다시 한 번 시도
      let finalMemberId = memberId;
      if (!finalMemberId) {
        try {
          const userInfo = await getMyInfo();
          finalMemberId = userInfo?.id || userInfo?.memberId;
          if (finalMemberId) {
            setMemberId(finalMemberId);
          }
        } catch (err) {
          console.error('사용자 정보 재조회 실패:', err);
        }
      }

      if (!finalMemberId) {
        throw new Error('로그인이 필요합니다. 사용자 정보를 불러올 수 없습니다.');
      }

      console.log('주문 생성 요청:', { requestBody, memberId: finalMemberId }); // 디버깅용

      // apiRequest를 사용하여 인증 정보 자동 포함 (credentials: 'include')
      // User-Id 헤더가 백엔드에서 필요하므로 추가
      const orderData = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'User-Id': finalMemberId.toString(),
        },
      });
      console.log('주문 생성 성공:', orderData);

      // 구독 결제인 경우 channelId와 planId를 localStorage에 저장 (결제 성공 후 구독 생성용)
      if (type === 'subscription' && channelId && itemId) {
        const numericChannelId = typeof channelId === 'string' ? parseInt(channelId, 10) : channelId;
        const numericPlanId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
        const orderKey = `pending_subscription_${orderData.orderCode}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem(orderKey, JSON.stringify({
            channelId: numericChannelId,
            planId: numericPlanId,
            orderCode: orderData.orderCode,
          }));
        }
      }

      // Checkout 페이지로 이동 (Next.js 라우팅 사용)
      const query = new URLSearchParams({
        orderCode: orderData.orderCode,
        orderName: orderData.orderName,
        amount: orderData.amount.toString(),
      });
      router.push(`/payment/checkout?${query.toString()}`);

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
