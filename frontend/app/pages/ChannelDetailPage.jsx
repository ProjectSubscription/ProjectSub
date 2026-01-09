import React from 'react';
import { 
  Users, 
  Bell, 
  BellOff, 
  Play, 
  Lock, 
  Star, 
  Heart,
  Share2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { PageRoute } from '../types';
import { mockChannels, mockContents, mockSubscriptionPlans, mockReviews } from '../mockData';

export function ChannelDetailPage({ channelId, onNavigate }) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const channel = mockChannels.find(c => c.id === channelId);
  const channelContents = mockContents.filter(c => c.channelId === channelId);
  const plans = mockSubscriptionPlans.filter(p => p.channelId === channelId);

  if (!channel) {
    return <div className="text-center py-12">채널을 찾을 수 없습니다.</div>;
  }

  const handleSubscribe = (planId) => {
    onNavigate('payment', { type: 'subscription', planId });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Channel Header */}
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
              onClick={() => setIsSubscribed(!isSubscribed)}
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

      {/* Subscription Plans */}
      {!isSubscribed && plans.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">구독 상품</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{plan.name}</h4>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  {plan.duration === 'YEARLY' && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      17% 할인
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price.toLocaleString()}원
                    <span className="text-lg text-gray-500 font-normal">
                      /{plan.duration === 'MONTHLY' ? '월' : '년'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  구독하기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            콘텐츠 ({channelContents.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
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

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channelContents.map((content) => {
            const canAccess = content.accessType === 'FREE' || isSubscribed;
            
            return (
              <div
                key={content.id}
                onClick={() => canAccess && onNavigate('content-detail', { contentId: content.id })}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                  canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                }`}
              >
                <div className="relative aspect-video">
                  <img
                    src={content.thumbnailUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          {content.accessType === 'SUBSCRIPTION' ? '구독 필요' : '구매 필요'}
                        </p>
                      </div>
                    </div>
                  )}
                  {canAccess && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-blue-600 ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {content.accessType === 'FREE' && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        무료
                      </span>
                    )}
                    {content.accessType === 'SUBSCRIPTION' && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        구독자 전용
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
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {content.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {content.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{content.viewCount.toLocaleString()} 조회</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{content.likeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">채널 소개</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {channel.description}
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">구독자 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {channel.subscriberCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">총 콘텐츠</p>
                <p className="text-2xl font-bold text-gray-900">
                  {channelContents.length}개
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  4.8
                  <Star className="w-5 h-5 fill-current text-yellow-500" />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">최근 리뷰</h3>
            <div className="space-y-4">
              {mockReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {review.userName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-current text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
