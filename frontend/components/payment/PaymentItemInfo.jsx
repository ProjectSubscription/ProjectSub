import React from 'react';

export function PaymentItemInfo({ item, type }) {
  return (
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
  );
}
