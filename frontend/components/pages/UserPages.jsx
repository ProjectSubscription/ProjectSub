import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, X } from 'lucide-react';
import { PageRoute } from '@/app/types';
import { mockUserSubscriptions, mockChannels, mockSubscriptionPlans } from '@/app/mockData';

export function MySubscriptionsPage({ userId, onNavigate }) {
  const userSubs = mockUserSubscriptions.filter(s => s.userId === userId);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 구독</h1>
        <p className="text-gray-600">구독 중인 채널을 관리하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">활성 구독</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {userSubs.filter(s => s.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">총 구독 수</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userSubs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">만료 예정</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {userSubs.filter(s => s.status === 'ACTIVE' && 
              new Date(s.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length}
          </p>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">활성 구독</h2>
        <div className="space-y-4">
          {userSubs.filter(s => s.status === 'ACTIVE').map(sub => {
            const channel = mockChannels.find(c => c.id === sub.channelId);
            const plan = mockSubscriptionPlans.find(p => p.id === sub.planId);
            if (!channel || !plan) return null;

            return (
              <div key={sub.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <img
                      src={channel.thumbnailUrl}
                      alt={channel.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{channel.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{channel.creatorName}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>시작: {sub.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>만료: {sub.endDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
                      활성
                    </span>
                    <p className="text-sm text-gray-600 mb-1">{plan.name}</p>
                    <p className="font-bold text-gray-900">{plan.price.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    채널 보기
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    구독 취소
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expired Subscriptions */}
      {userSubs.filter(s => s.status === 'EXPIRED').length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">만료된 구독</h2>
          <div className="space-y-4">
            {userSubs.filter(s => s.status === 'EXPIRED').map(sub => {
              const channel = mockChannels.find(c => c.id === sub.channelId);
              const plan = mockSubscriptionPlans.find(p => p.id === sub.planId);
              if (!channel || !plan) return null;

              return (
                <div key={sub.id} className="bg-white rounded-xl p-6 shadow-sm opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        className="w-24 h-24 rounded-lg object-cover grayscale"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{channel.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{channel.creatorName}</p>
                        <div className="text-sm text-gray-500">
                          만료일: {sub.endDate}
                        </div>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      만료됨
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => onNavigate('channel-detail', { channelId: channel.id })}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      다시 구독하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple MyPage component
export function MyPage({ userId, onNavigate }) {
  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('my-subscriptions', {})}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">내 구독</h3>
          <p className="text-gray-600">구독 중인 채널 관리</p>
        </button>
        <button
          onClick={() => onNavigate('my-purchases', {})}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">구매한 콘텐츠</h3>
          <p className="text-gray-600">단건 구매 콘텐츠 보기</p>
        </button>
      </div>
    </div>
  );
}
