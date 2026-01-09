import React from 'react';
import { CreditCard, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { PageRoute } from '../types';
import { mockSubscriptionPlans, mockContents, mockCoupons } from '../mockData';

export function PaymentPage({ type, itemId, onNavigate }) {
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('card');

  const item = type === 'subscription'
    ? mockSubscriptionPlans.find(p => p.id === itemId)
    : mockContents.find(c => c.id === itemId);

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

  const handlePayment = () => {
    // Simulate payment
    setTimeout(() => {
      onNavigate('payment-success', { amount: finalAmount });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">결제하기</h1>
        <p className="text-gray-600">안전한 결제 환경을 제공합니다</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">구매 정보</h2>
            <div className="flex gap-4">
              {'thumbnailUrl' in item && (
                <img
                  src={item.thumbnailUrl}
                  alt={'name' in item ? item.name : item.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  {'name' in item ? item.name : item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {'description' in item && item.description}
                </p>
                <p className="text-sm text-gray-500">
                  {type === 'subscription' ? '구독 상품' : '단건 구매'}
                </p>
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              쿠폰 / 할인코드
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="쿠폰 코드를 입력하세요"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                적용
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{appliedCoupon.code} 적용됨</span>
                </div>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                  className="text-green-700 hover:text-green-800 text-sm underline"
                >
                  취소
                </button>
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">사용 가능한 쿠폰:</p>
              <div className="space-y-1">
                {mockCoupons.filter(c => !c.isUsed).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCouponCode(c.code)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline block"
                  >
                    {c.code} - {c.discountType === 'PERCENT' ? `${c.discountValue}% 할인` : `${c.discountValue.toLocaleString()}원 할인`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              결제 수단
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">신용/체크카드</span>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏦</span>
                  <span className="font-medium text-gray-900">계좌이체</span>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'kakao'}
                  onChange={() => setPaymentMethod('kakao')}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <span className="font-medium text-gray-900">카카오페이</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">결제 금액</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{baseAmount.toLocaleString()}원</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>할인</span>
                  <span>-{discount.toLocaleString()}원</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-bold text-gray-900">최종 결제 금액</span>
                <span className="font-bold text-xl text-blue-600">
                  {finalAmount.toLocaleString()}원
                </span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors mb-3"
            >
              결제하기
            </button>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>결제 시 이용약관 및 환불 정책에 동의하게 됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
