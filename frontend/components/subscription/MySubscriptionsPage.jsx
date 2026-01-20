import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { 
  getMySubscriptions, 
  cancelSubscription, 
  getChannel,
  getSubscriptionChannelContents
} from '@/app/lib/api';
import { useUser } from '@/components/contexts/UserContext';

export function MySubscriptionsPage({ onNavigate }) {
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [cancellingId, setCancellingId] = React.useState(null);
  const [channelMap, setChannelMap] = React.useState({}); // channelId -> channel info
  const [channelContents, setChannelContents] = React.useState({}); // channelId -> contents array
  const [expandedChannels, setExpandedChannels] = React.useState(new Set()); // expanded channel IDs
  const { currentUser } = useUser();

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 구독 목록 로드
        const response = await getMySubscriptions();
        console.log('구독 목록 응답:', response);
        const subs = response.content || response || [];
        console.log('구독 목록 (parsed):', subs);
        setSubscriptions(subs);

        // 각 구독의 채널 정보 가져오기
        if (subs.length > 0) {
          const channelIds = [...new Set(subs.map(sub => sub.channelId).filter(Boolean))];
          if (channelIds.length > 0) {
            const channelPromises = channelIds.map(async (channelId) => {
              try {
                const channel = await getChannel(channelId);
                return { channelId, channel };
              } catch (err) {
                console.warn(`채널 ${channelId} 정보 조회 실패:`, err);
                return { channelId, channel: null };
              }
            });

            const channelResults = await Promise.all(channelPromises);
            const newChannelMap = {};
            channelResults.forEach(({ channelId, channel }) => {
              if (channel) {
                newChannelMap[channelId] = channel;
              }
            });
            setChannelMap(newChannelMap);
          }
        }
      } catch (err) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);


  // 채널의 컨텐츠 로드
  const loadChannelContents = async (channelId) => {
    try {
      const response = await getSubscriptionChannelContents(channelId);
      const contents = response.content || response || [];
      setChannelContents(prev => ({
        ...prev,
        [channelId]: contents
      }));
    } catch (err) {
      console.error(`채널 ${channelId} 컨텐츠 조회 오류:`, err);
      setChannelContents(prev => ({
        ...prev,
        [channelId]: []
      }));
    }
  };

  // 채널 컨텐츠 토글
  const toggleChannelContents = async (channelId) => {
    const newExpanded = new Set(expandedChannels);
    if (newExpanded.has(channelId)) {
      newExpanded.delete(channelId);
    } else {
      newExpanded.add(channelId);
      // 컨텐츠가 아직 로드되지 않았다면 로드
      if (!channelContents[channelId]) {
        await loadChannelContents(channelId);
      }
    }
    setExpandedChannels(newExpanded);
  };

  // 구독 취소 핸들러
  const handleCancelSubscription = async (subscriptionId, channelName) => {
    // 확인 메시지
    const confirmed = window.confirm(
      `정말로 "${channelName || '이 채널'}" 구독을 취소하시겠습니까?\n구독 취소 후에는 즉시 접근이 제한됩니다.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(subscriptionId);
      await cancelSubscription(subscriptionId);
      
      // 구독 목록 다시 로드
      const response = await getMySubscriptions();
      const subs = response.content || response || [];
      setSubscriptions(subs);
      
      alert('구독이 취소되었습니다.');
    } catch (err) {
      console.error('구독 취소 오류:', err);
      alert(err.message || '구독 취소 중 오류가 발생했습니다.');
    } finally {
      setCancellingId(null);
    }
  };


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
            {userSubs.filter(s => {
              if (s.status !== 'ACTIVE') return false;
              const endDate = s.expiredAt || s.endDate;
              if (!endDate) return false;
              const now = new Date();
              const expiry = new Date(endDate);
              const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
              return diffDays <= 3 && diffDays >= 0;
            }).length}
          </p>
        </div>
      </div>

      {/* Subscription History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">구독 내역</h2>
        {(() => {
          // 구독 정렬 함수
          const getSortPriority = (sub) => {
            if (sub.status === 'ACTIVE') {
              const endDate = sub.expiredAt || sub.endDate;
              if (endDate) {
                const now = new Date();
                const expiry = new Date(endDate);
                const diffTime = expiry - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                // 만료까지 3일 이내인 활성 구독은 우선순위 0
                if (diffDays >= 0 && diffDays <= 3) {
                  return 0;
                }
              }
              // 일반 활성 구독은 우선순위 1
              return 1;
            } else if (sub.status === 'EXPIRED') {
              return 2;
            } else if (sub.status === 'CANCELED') {
              return 3;
            }
            return 4;
          };

          const filteredSubs = userSubs.filter(s => s.status === 'ACTIVE' || s.status === 'EXPIRED' || s.status === 'CANCELED');
          const sortedSubs = [...filteredSubs].sort((a, b) => {
            const priorityA = getSortPriority(a);
            const priorityB = getSortPriority(b);
            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }
            // 같은 우선순위 내에서는 startedAt 기준 내림차순 (최신순)
            const dateA = new Date(a.startedAt || a.startDate || 0);
            const dateB = new Date(b.startedAt || b.startDate || 0);
            return dateB - dateA;
          });

          return sortedSubs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">구독 내역이 없습니다</h3>
              <p className="text-gray-600">구독 중인 채널이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSubs.map(sub => {
            const channel = sub.channel || channelMap[sub.channelId] || {};
            const plan = sub.plan || {};
            const isExpired = sub.status === 'EXPIRED';
            const isCancelled = sub.status === 'CANCELED';
            const endDate = sub.expiredAt || sub.endDate;
            const isInactive = isExpired || isCancelled;
            
            // 만료까지 남은 일수 계산
            let remainingDays = null;
            if (!isInactive && endDate) {
              const now = new Date();
              const expiry = new Date(endDate);
              const diffTime = expiry - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 3) {
                remainingDays = diffDays;
              }
            }

            return (
              <div key={sub.subscriptionId || sub.id} className={`bg-white rounded-xl p-6 shadow-sm ${isInactive ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {channel.thumbnailUrl && (
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title || channel.name || '채널'}
                        className={`w-24 h-24 rounded-lg object-cover ${isInactive ? 'grayscale' : ''}`}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {channel.channelName || channel.title || channel.name || `채널 ${sub.channelId}`}
                      </h3>
                      {(channel.channelDescription || channel.description) && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {channel.channelDescription || channel.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {(sub.startedAt || sub.startDate) && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>시작: {new Date(sub.startedAt || sub.startDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                        {endDate && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>만료: {new Date(endDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-3">
                      {isCancelled ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          구독취소
                        </span>
                      ) : isExpired ? (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          만료
                        </span>
                      ) : (
                        <>
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            활성
                          </span>
                          {remainingDays !== null && (
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              D-{remainingDays}
                            </span>
                          )}
                        </>
                      )}
                    </div>
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
                      {isInactive ? '다시 구독하기' : '채널 보기'}
                    </button>
                  )}
                  {!isInactive && (
                    <button
                      onClick={() => handleCancelSubscription(
                        sub.subscriptionId || sub.id,
                        channel.title || channel.name || '채널'
                      )}
                      disabled={cancellingId === (sub.subscriptionId || sub.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === (sub.subscriptionId || sub.id) ? '취소 중...' : '구독 취소'}
                    </button>
                  )}
                </div>
                
                {/* 컨텐츠 목록 토글 버튼 (활성 구독만) */}
                {!isInactive && channel.channelId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleChannelContents(channel.channelId || channel.id)}
                      className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="font-medium">구독한 컨텐츠 보기</span>
                      {expandedChannels.has(channel.channelId || channel.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    
                    {/* 컨텐츠 목록 */}
                    {expandedChannels.has(channel.channelId || channel.id) && (
                      <div className="mt-4">
                        {channelContents[channel.channelId || channel.id] ? (
                          channelContents[channel.channelId || channel.id].length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {channelContents[channel.channelId || channel.id].map((content) => (
                                <div
                                  key={content.contentId || content.id}
                                  onClick={() => onNavigate('content-detail', { contentId: content.contentId || content.id })}
                                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  {content.thumbnailUrl && (
                                    <div className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden">
                                      <img
                                        src={content.thumbnailUrl}
                                        alt={content.title || content.contentTitle}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  )}
                                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {content.title || content.contentTitle}
                                  </h4>
                                  {content.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                      {content.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {content.viewCount !== undefined && (
                                      <span>조회 {content.viewCount.toLocaleString()}</span>
                                    )}
                                    {content.likeCount !== undefined && (
                                      <span>좋아요 {content.likeCount.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>이 채널에는 아직 컨텐츠가 없습니다.</p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>로딩 중...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
          );
        })()}
      </div>

    </div>
  );
}
