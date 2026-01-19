import React from 'react';
import { TrendingUp, Users, Star, ArrowRight } from 'lucide-react';

export function TrendingChannels({ channels, onNavigate }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            인기 급상승 채널
          </h3>
          <p className="text-gray-600 mt-1">지금 가장 많은 사랑을 받고 있는 채널</p>
        </div>
        <button
          onClick={() => onNavigate('channels')}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          전체보기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel, index) => {
          const formattedRating = Number.isFinite(channel.averageRating)
            ? channel.averageRating.toFixed(1)
            : '0.0';

          return (
            <div
              key={channel.id}
              onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                {channel.thumbnailUrl ? (
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                    {channel.name?.slice(0, 1) || '?'}
                  </div>
                )}
                {index < 3 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    TOP {index + 1}
                  </div>
                )}
                <div className="absolute top-3 right-3 text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {channel.category}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {channel.name}
                </h4>
                <p className="text-sm text-gray-500 mb-3">{channel.creatorName}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{channel.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{channel.subscriberCount.toLocaleString()} 구독자</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-gray-700">{formattedRating}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
