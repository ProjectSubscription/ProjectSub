import React from 'react';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { PageRoute } from '../types';

export function PaymentSuccessPage({ amount, onNavigate }) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white rounded-2xl p-12 shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">결제가 완료되었습니다!</h1>
        <p className="text-lg text-gray-600 mb-2">
          결제 금액: <span className="font-bold text-blue-600">{amount.toLocaleString()}원</span>
        </p>
        <p className="text-gray-500 mb-8">
          결제 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onNavigate('home', {})}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로
          </button>
          <button
            onClick={() => onNavigate('mypage', {})}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            결제 내역
          </button>
        </div>
      </div>
    </div>
  );
}
