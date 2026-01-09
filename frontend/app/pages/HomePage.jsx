import React from 'react';
import { TrendingUp, Clock, Star, Users, Play, Heart, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';
import { mockChannels, mockContents } from '../mockData';

export function HomePage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = [
    { id: 'all', name: '전체' },
    { id: '예술', name: '예술' },
    { id: '교육', name: '교육' },
    { id: '음악', name: '음악' },
    { id: '건강', name: '건강' },
    { id: '요리', name: '요리' },
    { id: '비즈니스', name: '비즈니스' }
  ];

  const trendingChannels = mockChannels.slice(0, 6);
  const newContents = mockContents.slice(0, 4);
  const filteredChannels = selectedCategory === 'all' 
    ? mockChannels 
    : mockChannels.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6" />
            <span className="font-medium">이달의 추천</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            새로운 크리에이터들의<br />놀라운 콘텐츠를 만나보세요
          </h2>
          <p className="text-blue-100 mb-6">
            지금 가장 핫한 채널들을 구독하고 다양한 콘텐츠를 즐겨보세요
          </p>
          <button
            onClick={() => onNavigate('channels')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            채널 둘러보기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Trending Channels */}
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
          {trendingChannels.map((channel, index) => (
            <div
              key={channel.id}
              onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {index < 3 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    TOP {index + 1}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
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
                    <span className="text-gray-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              최신 콘텐츠
            </h3>
            <p className="text-gray-600 mt-1">방금 올라온 신선한 콘텐츠</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newContents.map((content) => (
            <div
              key={content.id}
              onClick={() => onNavigate('content-detail', { contentId: content.id })}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  {content.accessType === 'FREE' && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      무료
                    </span>
                  )}
                  {content.accessType === 'SUBSCRIPTION' && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      구독 필요
                    </span>
                  )}
                  {content.accessType === 'PAID' && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {content.price?.toLocaleString()}원
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {content.title}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{content.viewCount.toLocaleString()} 조회</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{content.likeCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">카테고리별 채널</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.slice(0, 6).map((channel) => (
            <div
              key={channel.id}
              onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                <img
                  src={channel.thumbnailUrl}
                  alt={channel.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
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
      </section>
    </div>
  );
}
