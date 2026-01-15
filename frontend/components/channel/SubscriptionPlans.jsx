import React from 'react';

export function SubscriptionPlans({ plans, onSubscribe }) {
  if (plans.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">구독 상품</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{plan.name}</h4>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              {plan.duration === 'YEARLY' && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  17% 할인
                </span>
              )}
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {plan.price.toLocaleString()}원
                <span className="text-lg text-gray-500 font-normal">
                  /{plan.duration === 'MONTHLY' ? '월' : '년'}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSubscribe(plan.id)}
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
