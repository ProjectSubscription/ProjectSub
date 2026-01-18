'use client';

import React from 'react';
import { Users, Star, ArrowRight } from 'lucide-react';

export function PopularChannelsSection({ channels, onNavigate, isAuthenticated = false }) {
  return (
    <section className="py-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">인기 채널</h2>
            <p className="text-gray-600">지금 가장 핫한 크리에이터들을 만나보세요</p>
          </div>
          <button
            onClick={() => onNavigate(isAuthenticated ? 'channels' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            전체보기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => onNavigate(isAuthenticated ? 'channels' : 'login')}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {channel.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {channel.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{channel.creatorName}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{channel.subscriberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-gray-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
