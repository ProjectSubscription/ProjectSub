import React from 'react';

export function PaymentItemInfo({ item, type }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">구매 정보</h2>
      <div>
        <h3 className="font-bold text-gray-900">
          {'name' in item ? item.name : item.title}
        </h3>
      </div>
    </div>
  );
}
