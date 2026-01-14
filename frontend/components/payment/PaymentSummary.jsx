import React from 'react';
import { AlertCircle } from 'lucide-react';

export function PaymentSummary({ baseAmount, discount, finalAmount, onPayment, processing = false }) {
  return (
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
        onClick={onPayment}
        disabled={processing}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? '처리 중...' : '결제하기'}
      </button>
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>결제 시 이용약관 및 환불 정책에 동의하게 됩니다.</p>
        </div>
      </div>
    </div>
  );
}
