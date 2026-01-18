import React from 'react';
import { Calendar } from 'lucide-react';

export function SubscriptionPlans({ plans, onSubscribe }) {
  if (!plans || plans.length === 0) return null;

  // PlanType을 한글로 변환
  const getPlanTypeName = (planType) => {
    return planType === 'MONTHLY' ? '월간 구독' : '연간 구독';
  };

  // 예상 만료 날짜 계산 (구독 시작일 기준)
  const calculateExpiryDate = (planType) => {
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    
    if (planType === 'MONTHLY') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (planType === 'YEARLY') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    
    return expiryDate;
  };

  // 연간 구독의 할인율 계산 (월간 구독 * 12 대비)
  const calculateYearlyDiscountPercent = (yearlyPlan) => {
    const monthlyPlan = plans.find(p => p.planType === 'MONTHLY');
    if (!monthlyPlan) return null;
    
    const monthlyPricePerYear = monthlyPlan.price * 12;
    const discountAmount = monthlyPricePerYear - yearlyPlan.price;
    
    if (discountAmount <= 0) return null;
    
    const discountPercent = (discountAmount / monthlyPricePerYear) * 100;
    return Math.round(discountPercent);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">구독 상품</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.planId} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{getPlanTypeName(plan.planType)}</h4>
                <p className="text-sm text-gray-600">
                  {plan.planType === 'MONTHLY' ? '모든 강의 무제한 시청' : '모든 강의 무제한 시청 + 특별 보너스'}
                </p>
              </div>
              {plan.planType === 'YEARLY' && (() => {
                const discountPercent = calculateYearlyDiscountPercent(plan);
                return discountPercent ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                    {discountPercent}% 할인
                  </span>
                ) : null;
              })()}
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {plan.price.toLocaleString()}원
                <span className="text-lg text-gray-500 font-normal">
                  /{plan.planType === 'MONTHLY' ? '월' : '년'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  만료일: {calculateExpiryDate(plan.planType).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSubscribe(plan.planId)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              구독하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
