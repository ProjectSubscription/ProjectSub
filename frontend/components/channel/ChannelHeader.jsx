import React from 'react';
import { Users, Star, Bell, BellOff } from 'lucide-react';

export function ChannelHeader({ channel, isSubscribed, onSubscribeToggle, onCreatorClick }) {
  const avatarUrl = channel?.thumbnailUrl ?? channel?.profileImageUrl ?? channel?.profileImage ?? '';
  const avatarInitial = channel?.name?.trim()?.slice(0, 1) ?? '?';

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-48 md:h-64 bg-gray-50" />
      <div className="relative px-6 pb-6 -mt-16">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={channel.name}
              className="w-32 h-32 rounded-xl border-4 border-white shadow-xl object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl border-4 border-white shadow-xl bg-gray-100 text-gray-500 flex items-center justify-center text-4xl font-bold">
              {avatarInitial}
            </div>
          )}
          <div className="flex-1 text-gray-500">
            <h1 className="text-3xl font-bold mb-2 text-gray-500">{channel.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {channel.creatorName ? (
                <button
                  type="button"
                  onClick={onCreatorClick}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
                  aria-label={`크리에이터 ${channel.creatorName} 페이지로 이동`}
                >
                  <span className="underline decoration-gray-300 underline-offset-4">
                    {channel.creatorName}
                  </span>
                </button>
              ) : (
                <span>{channel.creatorName}</span>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{channel.subscriberCount.toLocaleString()} 구독자</span>
              </div>
              <span>{channel.category}</span>
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
                ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
