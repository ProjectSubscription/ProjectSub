import React from 'react';
import { Users, Star, Bell, BellOff } from 'lucide-react';

export function ChannelHeader({ channel, isSubscribed, onSubscribeToggle }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
      <div className="relative h-48 md:h-64">
        <img
          src={channel.thumbnailUrl}
          alt={channel.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="relative px-6 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <img
            src={channel.thumbnailUrl}
            alt={channel.name}
            className="w-32 h-32 rounded-xl border-4 border-white shadow-xl object-cover"
          />
          <div className="flex-1 text-white">
            <h1 className="text-3xl font-bold mb-2">{channel.name}</h1>
            <p className="text-blue-100 mb-2">{channel.creatorName}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{channel.subscriberCount.toLocaleString()} 구독자</span>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full">{channel.category}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span>4.8 (523 리뷰)</span>
              </div>
            </div>
          </div>
          <button
            onClick={onSubscribeToggle}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              isSubscribed
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-white text-blue-600 hover:bg-gray-100'
            }`}
          >
            {isSubscribed ? (
              <>
                <BellOff className="w-5 h-5" />
                <span>구독 중</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>구독하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
