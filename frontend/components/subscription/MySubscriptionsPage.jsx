import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, Plus, Edit, X, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { 
  getMySubscriptions, 
  cancelSubscription, 
  getChannel,
  getMyCreatorInfo,
  getChannels,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  apiGet,
  getSubscriptionChannelContents
} from '@/app/lib/api';
import { useUser } from '@/app/lib/UserContext';

export function MySubscriptionsPage({ onNavigate }) {
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [cancellingId, setCancellingId] = React.useState(null);
  const [channelMap, setChannelMap] = React.useState({}); // channelId -> channel info
  const [channelContents, setChannelContents] = React.useState({}); // channelId -> contents array
  const [expandedChannels, setExpandedChannels] = React.useState(new Set()); // expanded channel IDs
  const { currentUser } = useUser();
  
  // 크리에이터 관련 state
  const [isCreator, setIsCreator] = React.useState(false);
  const [myChannels, setMyChannels] = React.useState([]);
  const [channelPlans, setChannelPlans] = React.useState({}); // channelId -> plans array
  const [creatingPlan, setCreatingPlan] = React.useState(null); // { channelId }
  const [editingPlan, setEditingPlan] = React.useState(null); // { channelId, planId }
  const [planFormData, setPlanFormData] = React.useState({ planType: 'MONTHLY', price: '' });

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 구독 목록 로드 (currentUser가 없어도 API 인증으로 처리)
        const response = await getMySubscriptions();
        console.log('구독 목록 응답:', response);
        const subs = response.content || response || [];
        console.log('구독 목록 (parsed):', subs);
        setSubscriptions(subs);
        
        // 사용자 정보는 Context에서 가져옴 (크리에이터 역할 확인용)
        const userInfo = currentUser;
        
        // 역할 확인 (정규화된 roles 배열에서 확인)
        const hasCreatorRole = userInfo?.roles?.some(r => 
          r === 'CREATOR' || r === 'ROLE_CREATOR'
        ) || userInfo?.role === 'CREATOR';
        setIsCreator(hasCreatorRole);

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

        // 크리에이터인 경우 자신의 채널과 구독 상품 조회
        if (hasCreatorRole) {
          try {
            const creatorInfo = await getMyCreatorInfo();
            const creatorId = creatorInfo.creatorId || creatorInfo.id;
            
            // 크리에이터의 채널 조회 (GET /api/channels/my?creatorId=... 또는 전체 채널에서 필터링)
            // 일단 getChannels로 전체 채널을 가져온 후 필터링하거나, 
            // /api/channels/my API를 사용 (단일 채널 반환)
            try {
              // 단일 채널 API 시도
              const myChannel = await apiGet(`/api/channels/my?creatorId=${creatorId}`);
              if (myChannel) {
                setMyChannels([myChannel]);
                await loadChannelPlans(myChannel.channelId || myChannel.id);
              }
            } catch (err) {
              console.warn('단일 채널 조회 실패, 전체 채널에서 필터링 시도:', err);
              // 전체 채널에서 필터링 시도 (creatorId가 response에 포함되어 있는 경우)
              const allChannels = await getChannels();
              const channels = allChannels.content || allChannels || [];
              // creatorId로 필터링 (응답에 creatorId가 포함되어 있다고 가정)
              // 실제로는 백엔드 API 응답 구조에 따라 달라질 수 있음
              const filteredChannels = channels.filter(ch => 
                ch.creatorId === creatorId || ch.creator?.id === creatorId
              );
              setMyChannels(filteredChannels);
              
              // 각 채널의 구독 상품 로드
              for (const channel of filteredChannels) {
                await loadChannelPlans(channel.channelId || channel.id);
              }
            }
          } catch (err) {
            console.error('크리에이터 채널 조회 오류:', err);
          }
        }
      } catch (err) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    // currentUser가 없어도 데이터 로드 시도 (API 인증으로 처리)
    loadData();
  }, [currentUser]);

  // 채널의 구독 상품 로드
  const loadChannelPlans = async (channelId) => {
    try {
      const plans = await getSubscriptionPlans(channelId);
      setChannelPlans(prev => ({
        ...prev,
        [channelId]: plans || []
      }));
    } catch (err) {
      console.error(`채널 ${channelId} 구독 상품 조회 오류:`, err);
      setChannelPlans(prev => ({
        ...prev,
        [channelId]: []
      }));
    }
  };

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

  // 구독 상품 등록 핸들러
  const handleCreatePlan = async (channelId) => {
    if (!planFormData.planType || !planFormData.price) {
      alert('상품 타입과 가격을 입력해주세요.');
      return;
    }

    try {
      await createSubscriptionPlan(channelId, {
        planType: planFormData.planType,
        price: parseInt(planFormData.price)
      });
      
      // 구독 상품 목록 다시 로드
      await loadChannelPlans(channelId);
      
      // 폼 초기화
      setCreatingPlan(null);
      setPlanFormData({ planType: 'MONTHLY', price: '' });
      
      alert('구독 상품이 등록되었습니다.');
    } catch (err) {
      console.error('구독 상품 등록 오류:', err);
      alert(err.message || '구독 상품 등록 중 오류가 발생했습니다.');
    }
  };

  // 구독 상품 수정 핸들러
  const handleUpdatePlan = async (channelId, planId) => {
    if (planFormData.price === '') {
      alert('가격을 입력해주세요.');
      return;
    }

    try {
      await updateSubscriptionPlan(channelId, planId, {
        price: planFormData.price ? parseInt(planFormData.price) : null,
        isActive: planFormData.isActive !== undefined ? planFormData.isActive : null
      });
      
      // 구독 상품 목록 다시 로드
      await loadChannelPlans(channelId);
      
      // 폼 초기화
      setEditingPlan(null);
      setPlanFormData({ planType: 'MONTHLY', price: '' });
      
      alert('구독 상품이 수정되었습니다.');
    } catch (err) {
      console.error('구독 상품 수정 오류:', err);
      alert(err.message || '구독 상품 수정 중 오류가 발생했습니다.');
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

      {/* 크리에이터용 구독 상품 관리 섹션 */}
      {isCreator && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">구독 상품 관리</h2>
          {myChannels.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">채널이 없습니다</h3>
              <p className="text-gray-600">먼저 채널을 생성해주세요</p>
            </div>
          ) : (
            <div className="space-y-6">
              {myChannels.map(channel => {
                const channelId = channel.channelId || channel.id;
                const plans = channelPlans[channelId] || [];
                const isCreating = creatingPlan === channelId;
                const channelTitle = channel.title || channel.channelName || channel.name || `채널 ${channelId}`;

                return (
                  <div key={channelId} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{channelTitle}</h3>
                      {!isCreating && (
                        <button
                          onClick={() => {
                            setCreatingPlan(channelId);
                            setEditingPlan(null);
                            setPlanFormData({ planType: 'MONTHLY', price: '' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          상품 등록
                        </button>
                      )}
                    </div>

                    {/* 상품 등록 폼 */}
                    {isCreating && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3">새 구독 상품 등록</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">상품 타입</label>
                            <select
                              value={planFormData.planType}
                              onChange={(e) => setPlanFormData({ ...planFormData, planType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="MONTHLY">월간</option>
                              <option value="YEARLY">연간</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                            <input
                              type="number"
                              value={planFormData.price}
                              onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                              placeholder="예: 10000"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button
                              onClick={() => handleCreatePlan(channelId)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              등록
                            </button>
                            <button
                              onClick={() => {
                                setCreatingPlan(null);
                                setPlanFormData({ planType: 'MONTHLY', price: '' });
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 구독 상품 목록 */}
                    {plans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        등록된 구독 상품이 없습니다
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {plans.map(plan => {
                          const planId = plan.planId || plan.id;
                          const isEditing = editingPlan?.channelId === channelId && editingPlan?.planId === planId;
                          const planTypeText = plan.planType === 'MONTHLY' ? '월간' : plan.planType === 'YEARLY' ? '연간' : plan.planType;

                          return (
                            <div key={planId} className="p-4 border border-gray-200 rounded-lg">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-900">상품 수정</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">상품 타입</label>
                                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                                        {planTypeText}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                                      <input
                                        type="number"
                                        value={planFormData.price}
                                        onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                                        placeholder={plan.price?.toString() || ''}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                                      <select
                                        value={planFormData.isActive !== undefined ? planFormData.isActive : plan.isActive !== undefined ? plan.isActive : true}
                                        onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.value === 'true' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="true">활성</option>
                                        <option value="false">비활성</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdatePlan(channelId, planId)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                    >
                                      저장
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingPlan(null);
                                        setPlanFormData({ planType: 'MONTHLY', price: '' });
                                      }}
                                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-gray-900">{planTypeText}</span>
                                      {plan.isActive === false && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">비활성</span>
                                      )}
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 mt-1">
                                      {plan.price?.toLocaleString() || '0'}원
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingPlan({ channelId, planId });
                                      setCreatingPlan(null);
                                      setPlanFormData({ 
                                        planType: plan.planType || 'MONTHLY', 
                                        price: plan.price?.toString() || '',
                                        isActive: plan.isActive !== undefined ? plan.isActive : true
                                      });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    수정
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
