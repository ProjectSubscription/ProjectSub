import React from 'react';
import { PaymentItemInfo } from '@/components/payment/PaymentItemInfo';
import { CouponSection } from '@/components/payment/CouponSection';
import { PaymentMethod } from '@/components/payment/PaymentMethod';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { mockSubscriptionPlans } from '@/app/mockData';
import { getContent, getChannel, getMyInfo, getSubscriptionPlans, apiRequest, getAvailableCoupons, validateCoupon, getChannelCoupons, getContentCoupons, getMyCoupons } from '@/app/lib/api';
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
  const [availableCoupons, setAvailableCoupons] = React.useState([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);

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

  // 사용 가능한 쿠폰 목록 가져오기 (member_coupons에서 ISSUED 상태인 쿠폰만)
  React.useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        setCouponsLoading(true);
        // 사용자가 발급받은 쿠폰 목록 가져오기 (ISSUED 상태인 것만 백엔드에서 반환)
        const myCoupons = await getMyCoupons();
        
        // usedAt이 null인 쿠폰만 필터링 (아직 사용하지 않은 쿠폰)
        // 백엔드에서 ISSUED 상태만 반환하지만, 프론트엔드에서도 한 번 더 필터링
        const unusedCoupons = Array.isArray(myCoupons) 
          ? myCoupons.filter(coupon => !coupon.usedAt) // usedAt이 null이면 사용 가능
          : [];
        
        // 결제 타입에 따라 쿠폰 필터링
        const filteredCoupons = unusedCoupons.filter(coupon => {
          // targets가 없거나 비어있으면 전체 대상 쿠폰 (항상 포함)
          if (!coupon.targets || coupon.targets.length === 0) {
            return true;
          }
          
          // 모든 target의 targetId가 null이면 전체 대상 쿠폰 (항상 포함)
          const isUniversalCoupon = coupon.targets.every(target => target.targetId === null);
          if (isUniversalCoupon) {
            return true;
          }
          
          // 결제 타입에 따라 필터링
          if (type === 'content') {
            // 콘텐츠 결제: CONTENT 타입 쿠폰만 포함
            return coupon.targets.some(target => target.targetType === 'CONTENT');
          } else if (type === 'subscription') {
            // 구독 결제: SUBSCRIPTION 타입 쿠폰만 포함
            return coupon.targets.some(target => target.targetType === 'SUBSCRIPTION');
          }
          
          // 타입이 명확하지 않은 경우 모든 쿠폰 포함
          return true;
        });
        
        console.log('사용 가능한 쿠폰 목록 (필터링 후):', filteredCoupons); // 디버깅용
        setAvailableCoupons(filteredCoupons);
      } catch (err) {
        console.error('쿠폰 목록 로딩 실패:', err);
        // 로그인하지 않은 경우에도 에러를 표시하지 않고 빈 배열로 설정
        setAvailableCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchAvailableCoupons();
  }, [type]);

  // 백엔드에서 아이템 정보 가져오기
  React.useEffect(() => {
    const fetchItem = async () => {
      try {
        setItemLoading(true);
        if (type === 'content' && itemId) {
          // 콘텐츠 정보 가져오기
          const id = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
          const contentData = await getContent(id);
          console.log('콘텐츠 데이터:', contentData); // 디버깅용
          
          // 채널 정보 가져오기
          let channelName = '';
          const contentChannelId = contentData.channelId;
          console.log('콘텐츠의 채널 ID:', contentChannelId); // 디버깅용
          
          if (contentChannelId) {
            try {
              const channelData = await getChannel(contentChannelId);
              console.log('채널 데이터:', channelData); // 디버깅용
              channelName = channelData.channelName || channelData.title || channelData.name || '';
              console.log('채널 이름:', channelName); // 디버깅용
            } catch (err) {
              console.warn('채널 정보 조회 실패:', err);
            }
          } else {
            console.warn('콘텐츠 데이터에 channelId가 없습니다.');
          }
          
          // PaymentItemInfo에 맞는 형식으로 변환
          setItem({
            id: contentData.id || contentData.contentId || id,
            title: contentData.title,
            description: contentData.description || contentData.body,
            price: contentData.price || 0,
            thumbnailUrl: contentData.mediaUrl || contentData.thumbnailUrl,
            accessType: contentData.accessType,
            channelName: channelName,
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
              // 채널 정보 가져오기
              let channelName = '';
              try {
                const channelData = await getChannel(numericChannelId);
                console.log('채널 데이터 (구독):', channelData); // 디버깅용
                channelName = channelData.channelName || channelData.title || channelData.name || '';
                console.log('채널 이름 (구독):', channelName); // 디버깅용
              } catch (err) {
                console.warn('채널 정보 조회 실패:', err);
              }
              
              // 구독 플랜 정보 설정
              setItem({
                id: plan.planId || plan.id,
                title: plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독',
                description: `구독 기간: ${plan.planType === 'MONTHLY' ? '1개월' : '12개월'}`,
                price: plan.price || 0,
                planType: plan.planType,
                channelId: numericChannelId,
                channelName: channelName,
              });
            } else {
              throw new Error('구독 플랜을 찾을 수 없습니다.');
            }
          } catch (err) {
            console.error('구독 플랜 정보 로딩 실패:', err);
            // 채널 정보로 fallback
            const channelData = await getChannel(numericChannelId);
            const fallbackChannelName = channelData.channelName || channelData.title || channelData.name || '';
            setItem({
              id: numericPlanId,
              title: channelData.channelName || channelData.title || channelData.name,
              description: channelData.channelDescription || channelData.description || '',
              price: 0, // 가격 정보 없음
              channelId: numericChannelId,
              channelName: fallbackChannelName,
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
    ? (appliedCoupon.discountType === 'PERCENT' || appliedCoupon.discountType === 'RATE')
      ? Math.floor(baseAmount * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue
    : 0;
  const finalAmount = Math.max(0, baseAmount - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요.');
      return;
    }

    try {
      // 사용 가능한 쿠폰 목록에서 코드로 찾기
      const coupon = availableCoupons.find(c => 
        c.code && c.code.toUpperCase() === couponCode.toUpperCase()
      );

      if (!coupon) {
        alert('유효하지 않은 쿠폰입니다.');
        return;
      }

      // 쿠폰의 targets를 확인하여 특정 채널/콘텐츠에 제한이 있는지 확인
      // targets가 없거나 모든 target의 targetId가 null이면 전체 대상 쿠폰
      const isUniversalCoupon = !coupon.targets || coupon.targets.length === 0 || 
        coupon.targets.every(target => target.targetId === null);

      // 전체 대상 쿠폰(channelId가 null인 쿠폰)은 검증 없이 바로 적용
      if (isUniversalCoupon) {
        setAppliedCoupon({
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType === 'RATE' ? 'PERCENT' : 'FIXED',
          discountValue: coupon.discountValue,
        });
        return;
      }

      // 특정 대상 쿠폰은 백엔드 검증 API 호출
      const targetId = type === 'content' ? item?.id : (type === 'subscription' ? channelId : null);
      const paymentType = type === 'content' ? 'CONTENT' : (type === 'subscription' ? 'SUBSCRIPTION' : null);
      
      try {
        const validationResult = await validateCoupon(coupon.id, paymentType, targetId);
        
        // 검증 성공 시 쿠폰 적용
        if (validationResult && validationResult.result === 'VALID') {
          setAppliedCoupon({
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType === 'RATE' ? 'PERCENT' : 'FIXED',
            discountValue: coupon.discountValue,
          });
        } else {
          alert(validationResult?.errorCode || '쿠폰을 사용할 수 없습니다.');
        }
      } catch (validateErr) {
        console.error('쿠폰 검증 실패:', validateErr);
        alert(validateErr.message || '쿠폰 검증 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('쿠폰 적용 중 오류:', err);
      alert('쿠폰 적용 중 오류가 발생했습니다.');
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
      // discountAmount에는 쿠폰이 적용된 경우에만 할인 적용 후 최종 가격(finalAmount)을 전달
      // 쿠폰이 없으면 null로 전달 (할인 없음)
      const requestBody = {
        orderType: type.toUpperCase(), // "subscription" -> "SUBSCRIPTION", "content" -> "CONTENT"
        targetId: targetId,
        originalAmount: baseAmount,
        discountAmount: appliedCoupon ? finalAmount : null, // 쿠폰이 있을 때만 할인 적용 후 최종 가격
        couponId: appliedCoupon ? appliedCoupon.id : null, // 쿠폰 ID 추가
      };
      
      console.log('주문 생성 요청 데이터:', {
        originalAmount: baseAmount,
        discount: discount,
        discountAmount: finalAmount,
        finalAmount: finalAmount,
        couponId: appliedCoupon?.id
      }); // 디버깅용

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
