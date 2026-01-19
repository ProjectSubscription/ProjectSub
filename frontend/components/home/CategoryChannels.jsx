import React from 'react';
import { Users } from 'lucide-react';

export function CategoryChannels({ categories, selectedCategory, onCategoryChange, channels, onNavigate }) {
  return (
    <section>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">카테고리별 채널</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      {channels.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-600 border border-gray-100">
          이 카테고리에는 아직 채널이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.slice(0, 6).map((channel) => (
            <div
              key={channel.id}
              onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                {channel.thumbnailUrl ? (
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                    {channel.name?.slice(0, 1) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-1 truncate">
                    {channel.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">{channel.creatorName}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{channel.subscriberCount.toLocaleString()}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {channel.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
