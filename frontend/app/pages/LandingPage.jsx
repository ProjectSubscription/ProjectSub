import React from 'react';
import { Play, TrendingUp, Users, DollarSign, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { PageRoute } from '../types';
import { mockChannels, mockContents } from '../mockData';

export function LandingPage({ onNavigate }) {
  const popularChannels = mockChannels.slice(0, 4);
  const freeContents = mockContents.filter(c => c.accessType === 'FREE').slice(0, 3);
  
  // 카테고리 목록 추출
  const categories = [...new Set(mockChannels.map(ch => ch.category))];
  
  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0] || '');
  
  // 카테고리별 콘텐츠 랭킹 생성
  const getCategoryRanking = (category) => {
    // 해당 카테고리의 채널 ID들 찾기
    const categoryChannelIds = mockChannels
      .filter(ch => ch.category === category)
      .map(ch => ch.id);
    
    // 해당 카테고리의 콘텐츠들을 조회수 기준으로 정렬
    const categoryContents = mockContents
      .filter(content => categoryChannelIds.includes(content.channelId))
      .map(content => {
        const channel = mockChannels.find(ch => ch.id === content.channelId);
        return {
          ...content,
          creatorName: channel?.creatorName || '',
          category: channel?.category || ''
        };
      })
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);
    
    return categoryContents;
  };
  
  const rankingContents = getCategoryRanking(selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                당신의 열정을<br />
                수익으로 만드세요
              </h1>
              <p className="text-xl text-blue-100">
                크리에이터와 팬이 만나는 구독 기반 콘텐츠 플랫폼
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  지금 시작하기
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                >
                  무료 콘텐츠 둘러보기
                </button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold">10,000+</p>
                  <p className="text-blue-100 text-sm">활성 크리에이터</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">500,000+</p>
                  <p className="text-blue-100 text-sm">구독자</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">1M+</p>
                  <p className="text-blue-100 text-sm">콘텐츠</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white opacity-10 rounded-2xl transform rotate-6"></div>
                <div className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">무제한 시청</p>
                        <p className="text-sm text-blue-100">모든 콘텐츠 자유롭게</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">크리에이터 수익</p>
                        <p className="text-sm text-blue-100">90% 수익률 보장</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">커뮤니티</p>
                        <p className="text-sm text-blue-100">팬과 소통하기</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 CreatorHub인가요?
            </h2>
            <p className="text-lg text-gray-600">
              크리에이터와 팬 모두를 위한 최적의 플랫폼
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">높은 수익률</h3>
              <p className="text-gray-600">
                업계 최고 수준의 90% 수익률로 크리에이터를 지원합니다. 더 많은 수익을 창출하세요.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">다양한 콘텐츠</h3>
              <p className="text-gray-600">
                무료부터 프리미엄까지, 구독과 단건 구매 모두 지원하는 유연한 판매 방식.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">강력한 커뮤니티</h3>
              <p className="text-gray-600">
                팬과의 직접적인 소통으로 더 깊은 관계를 형성하고 충성도를 높이세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Channels */}
      <section className="py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">인기 채널</h2>
              <p className="text-gray-600">지금 가장 핫한 크리에이터들을 만나보세요</p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              전체보기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => onNavigate('login')}
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

      {/* Free Content Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">무료 콘텐츠 미리보기</h2>
            <p className="text-gray-600">로그인 없이 바로 시청 가능한 콘텐츠</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {freeContents.map((content) => (
              <div
                key={content.id}
                onClick={() => onNavigate('login')}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative aspect-video">
                  <img
                    src={content.thumbnailUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                    무료
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{content.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {content.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{content.viewCount.toLocaleString()} 조회</span>
                    <span>{content.likeCount.toLocaleString()} 좋아요</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Ranking Section */}
      <section className="py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">카테고리별 콘텐츠 랭킹</h2>
            <p className="text-gray-600">인기 콘텐츠를 카테고리별로 확인하세요</p>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Ranking List - 1~5위는 1열, 6~10위는 2열 */}
          <div className="space-y-6">
            {/* 1~5위: 1열 */}
            <div className="space-y-4">
              {rankingContents.slice(0, 5).map((content, index) => (
                <div
                  key={content.id}
                  onClick={() => onNavigate('login')}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex gap-4 p-4">
                    {/* 썸네일 */}
                    <div className="flex-shrink-0">
                      <img
                        src={content.thumbnailUrl}
                        alt={content.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* 순위 */}
                    <div className="flex-shrink-0 flex items-center">
                      <span className="font-bold text-lg text-black">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* 콘텐츠 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{content.creatorName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {content.viewCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {content.likeCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 6~10위: 2열 */}
            <div className="grid md:grid-cols-2 gap-6">
              {rankingContents.slice(5, 10).map((content, index) => (
                <div
                  key={content.id}
                  onClick={() => onNavigate('login')}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex gap-4 p-4">
                    {/* 썸네일 */}
                    <div className="flex-shrink-0">
                      <img
                        src={content.thumbnailUrl}
                        alt={content.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* 순위 */}
                    <div className="flex-shrink-0 flex items-center">
                      <span className="font-bold text-lg text-black">
                        {index + 6}
                      </span>
                    </div>
                    
                    {/* 콘텐츠 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{content.creatorName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {content.viewCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {content.likeCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            지금 바로 크리에이터가 되어보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            무료로 시작하고, 첫 수익까지 단 3일
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              크리에이터 신청하기
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              더 알아보기
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>무료 시작</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>90% 수익률</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>빠른 정산</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
