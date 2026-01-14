import React from 'react';

export function ChannelTabs({ activeTab, onTabChange, contentCount }) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8">
        <button
          onClick={() => onTabChange('content')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'content'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          콘텐츠 ({contentCount})
        </button>
        <button
          onClick={() => onTabChange('about')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'about'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          소개
        </button>
      </div>
    </div>
  );
}
