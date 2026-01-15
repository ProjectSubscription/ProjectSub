import React from 'react';
import { CreditCard } from 'lucide-react';

export function PaymentMethod({ paymentMethod, onPaymentMethodChange }) {
  return (
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
            onChange={() => onPaymentMethodChange('card')}
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
            onChange={() => onPaymentMethodChange('bank')}
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
            onChange={() => onPaymentMethodChange('kakao')}
            className="mr-3"
          />
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <span className="font-medium text-gray-900">카카오페이</span>
          </div>
        </label>
      </div>
    </div>
  );
}
