import React from 'react';

export function PaymentItemInfo({ item, type }) {
  if (!item) {
    return null;
  }

  const channelName = item.channelName || '';
  const itemTitle = 'name' in item ? item.name : item.title || '';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">구매 정보</h2>
      <div className="space-y-2">
        {channelName && (
          <div>
            <span className="text-sm text-gray-600">채널: </span>
            <span className="text-sm font-medium text-gray-900">{channelName}</span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900">
            {type === 'content' ? '콘텐츠: ' : ''}
            {itemTitle}
          </h3>
        </div>
      </div>
    </div>
  );
}
