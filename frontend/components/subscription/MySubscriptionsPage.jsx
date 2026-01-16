import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
import { getMySubscriptions } from '@/app/lib/api';

export function MySubscriptionsPage({ onNavigate }) {
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadSubscriptions() {
      try {
        setLoading(true);
        const response = await getMySubscriptions();
        // 백엔드에서 Page 객체를 반환할 수 있으므로 content 배열을 추출
        const subs = response.content || response || [];
        setSubscriptions(subs);
      } catch (err) {
        setError(err.message || '구독 목록을 불러오는 중 오류가 발생했습니다.');
        console.error('구독 목록 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscriptions();
  }, []);

  const userSubs = subscriptions;

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 구독</h1>
          <p className="text-gray-600">구독 중인 채널을 관리하세요</p>
        </div>
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 구독</h1>
          <p className="text-gray-600">구독 중인 채널을 관리하세요</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

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
            {userSubs.filter(s => s.status === 'ACTIVE' && s.endDate &&
              new Date(s.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length}
          </p>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">활성 구독</h2>
        {userSubs.filter(s => s.status === 'ACTIVE').length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">활성 구독이 없습니다</h3>
            <p className="text-gray-600">구독 중인 채널이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSubs.filter(s => s.status === 'ACTIVE').map(sub => {
            const channel = sub.channel || {};
            const plan = sub.plan || {};

            return (
              <div key={sub.subscriptionId || sub.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {channel.thumbnailUrl && (
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title || channel.name || '채널'}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{channel.title || channel.name || '채널'}</h3>
                      {channel.creatorName && (
                        <p className="text-sm text-gray-600 mb-3">{channel.creatorName}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {sub.startDate && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>시작: {new Date(sub.startDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                        {sub.endDate && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>만료: {new Date(sub.endDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
                      활성
                    </span>
                    {plan.planType && (
                      <p className="text-sm text-gray-600 mb-1">{plan.planType}</p>
                    )}
                    {plan.price && (
                      <p className="font-bold text-gray-900">{plan.price.toLocaleString()}원</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                  {channel.channelId && (
                    <button
                      onClick={() => onNavigate('channel-detail', { channelId: channel.channelId || channel.id })}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      채널 보기
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    구독 취소
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Expired Subscriptions */}
      {userSubs.filter(s => s.status === 'EXPIRED').length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">만료된 구독</h2>
          <div className="space-y-4">
            {userSubs.filter(s => s.status === 'EXPIRED' || s.status === 'CANCELLED').map(sub => {
              const channel = sub.channel || {};

              return (
                <div key={sub.subscriptionId || sub.id} className="bg-white rounded-xl p-6 shadow-sm opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {channel.thumbnailUrl && (
                        <img
                          src={channel.thumbnailUrl}
                          alt={channel.title || channel.name || '채널'}
                          className="w-24 h-24 rounded-lg object-cover grayscale"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{channel.title || channel.name || '채널'}</h3>
                        {channel.creatorName && (
                          <p className="text-sm text-gray-600 mb-3">{channel.creatorName}</p>
                        )}
                        {sub.endDate && (
                          <div className="text-sm text-gray-500">
                            만료일: {new Date(sub.endDate).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      만료됨
                    </span>
                  </div>
                  {channel.channelId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => onNavigate('channel-detail', { channelId: channel.channelId || channel.id })}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        다시 구독하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
