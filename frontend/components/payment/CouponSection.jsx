import React from 'react';
import { Tag, CheckCircle } from 'lucide-react';

export function CouponSection({ couponCode, onCouponCodeChange, appliedCoupon, onApplyCoupon, onRemoveCoupon, availableCoupons }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        쿠폰 / 할인코드
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
          placeholder="쿠폰 코드를 입력하세요"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onApplyCoupon}
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
            onClick={onRemoveCoupon}
            className="text-green-700 hover:text-green-800 text-sm underline"
          >
            취소
          </button>
        </div>
      )}
      {availableCoupons && availableCoupons.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">사용 가능한 쿠폰:</p>
          <div className="space-y-1">
            {availableCoupons.map(c => {
              const discountType = c.discountType === 'RATE' || c.discountType === 'PERCENT' ? 'RATE' : 'AMOUNT';
              const discountText = discountType === 'RATE' 
                ? `${c.discountValue}% 할인` 
                : `${c.discountValue?.toLocaleString() || c.discountValue}원 할인`;
              return (
                <button
                  key={c.id}
                  onClick={() => onCouponCodeChange(c.code)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline block w-full text-left"
                >
                  {c.code} - {discountText}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {availableCoupons && availableCoupons.length === 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">사용 가능한 쿠폰이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
