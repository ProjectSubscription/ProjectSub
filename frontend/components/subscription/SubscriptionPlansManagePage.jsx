'use client';

import React from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Loader2, Plus, Calendar, Edit2 } from 'lucide-react';
import { getMyChannel, createSubscriptionPlan, getAllSubscriptionPlans, getMyCreatorInfo, updateSubscriptionPlan } from '@/app/lib/api';
import { useUser } from '@/components/contexts/UserContext';

export function SubscriptionPlansManagePage({ onNavigate }) {
  // UserContext에서 currentUser 가져오기 (Header와 동일한 상태)
  const { currentUser, loading: userLoading } = useUser();
  
  const [channel, setChannel] = React.useState(null);
  const [channelPlans, setChannelPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingPlans, setLoadingPlans] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // 인라인 폼 상태
  const [creatingPlan, setCreatingPlan] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState(null); // { planId }
  const [planFormData, setPlanFormData] = React.useState({ planType: 'MONTHLY', price: '', isActive: true });

  // 크리에이터의 채널 및 구독 상품 로드
  React.useEffect(() => {
    // 사용자 정보가 아직 로딩 중이면 대기
    if (userLoading) {
      return;
    }

    async function loadChannelAndPlans() {
      try {
        setLoading(true);
        setError('');
        
        // currentUser가 없으면 로그인하지 않은 상태
        if (!currentUser) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }
        
        // 크리에이터 권한 확인
        const hasCreatorRole = currentUser?.roles?.some(r => 
          r === 'CREATOR' || r === 'ROLE_CREATOR'
        ) || currentUser?.role === 'CREATOR';
        
        if (!hasCreatorRole) {
          setError('크리에이터 권한이 필요합니다.');
          setLoading(false);
          return;
        }
        
        // 크리에이터의 채널 조회 (백엔드에서 소유권 검증 수행)
        try {
          const channelData = await getMyChannel();
          
          if (!channelData || !channelData.channelId) {
            setError('등록된 채널이 없습니다. 먼저 채널을 생성해주세요.');
            setLoading(false);
            return;
          }
          
          // 채널 정보 설정
          const channelId = channelData.channelId || channelData.id;
          console.log('채널 데이터:', channelData); // 디버깅용
          console.log('추출된 채널 ID:', channelId); // 디버깅용
          
          if (!channelId) {
            setError('채널 ID를 찾을 수 없습니다.');
            setLoading(false);
            return;
          }
          
          setChannel({
            id: channelId,
            title: channelData.title || channelData.channelName || '',
            description: channelData.description || channelData.channelDescription || '',
            category: channelData.category || ''
          });

          // 구독 상품 조회 (백엔드에서 소유권 검증 수행)
          setLoadingPlans(true);
          try {
            const plans = await getAllSubscriptionPlans(channelId);
            setChannelPlans(Array.isArray(plans) ? plans : []);
          } catch (err) {
            console.error('구독 상품 조회 오류:', err);
            // 백엔드에서 소유권 검증 실패 시 에러 메시지 표시
            if (err.message && (err.message.includes('소유자') || err.message.includes('OWNER') || err.message.includes('403'))) {
              setError('이 채널에 대한 접근 권한이 없습니다.');
            } else {
              setError('구독 상품을 불러오는 중 오류가 발생했습니다.');
            }
            setChannelPlans([]);
          } finally {
            setLoadingPlans(false);
          }
        } catch (err) {
          console.error('채널 조회 오류:', err);
          // 백엔드에서 소유권 검증 실패 시 에러 메시지 표시
          if (err.message && (err.message.includes('소유자') || err.message.includes('OWNER') || err.message.includes('403'))) {
            setError('채널에 대한 접근 권한이 없습니다.');
          } else if (err.message && (err.message.includes('404') || err.message.includes('찾을 수 없'))) {
            setError('등록된 채널이 없습니다. 먼저 채널을 생성해주세요.');
          } else {
            setError(err.message || '채널 정보를 불러오는 중 오류가 발생했습니다.');
          }
        }
      } catch (err) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChannelAndPlans();
  }, [currentUser, userLoading]);

  // 구독 상품 등록
  const handleCreatePlan = async () => {
    if (!channel) {
      setError('채널 정보를 찾을 수 없습니다.');
      return;
    }

    if (!planFormData.planType || !planFormData.price) {
      setError('상품 타입과 가격을 입력해주세요.');
      return;
    }

    const priceNum = parseInt(planFormData.price);
    if (!planFormData.price || isNaN(priceNum) || priceNum <= 0) {
      setError('가격은 양수여야 합니다.');
      return;
    }

    // 활성화된 상품 중 이미 등록된 타입인지 확인
    const activePlans = channelPlans.filter(plan => plan.isActive !== false);
    const existingPlanTypes = activePlans.map(plan => plan.planType);
    if (existingPlanTypes.includes(planFormData.planType)) {
      setError(`${planFormData.planType === 'MONTHLY' ? '월간' : '연간'} 구독 상품이 이미 등록되어 있습니다.`);
      return;
    }

    // 채널당 최대 2개(월간, 연간)만 생성 가능
    if (activePlans.length >= 2) {
      setError('채널당 월간 및 연간 구독 상품은 각각 하나씩만 등록할 수 있습니다.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      // 채널 ID 확인
      if (!channel || !channel.id) {
        setError('채널 정보가 올바르지 않습니다. 페이지를 새로고침해주세요.');
        return;
      }

      console.log('구독 상품 등록 시도:', {
        channelId: channel.id,
        planType: planFormData.planType,
        price: priceNum
      }); // 디버깅용

      // 백엔드에서 소유권 검증 수행
      await createSubscriptionPlan(channel.id, {
        planType: planFormData.planType,
        price: priceNum
      });

      setSuccess('구독 상품이 성공적으로 등록되었습니다.');
      
      // 구독 상품 목록 새로고침
      const plans = await getAllSubscriptionPlans(channel.id);
      setChannelPlans(Array.isArray(plans) ? plans : []);

      // 폼 초기화
      setCreatingPlan(false);
      setPlanFormData({ planType: 'MONTHLY', price: '', isActive: true });

      // 2초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('구독 상품 등록 오류:', err);
      
      // 에러 메시지 추출
      const errorMessage = err?.message || err?.toString() || '알 수 없는 오류';
      console.error('구독 상품 등록 에러 상세:', {
        message: errorMessage,
        status: err?.status,
        data: err?.data,
        channelId: channel?.id
      }); // 디버깅용
      
      // 백엔드에서 소유권 검증 실패 시 에러 메시지 표시
      if (errorMessage.includes('소유자') || errorMessage.includes('채널 소유자') || errorMessage.includes('OWNER') || errorMessage.includes('403') || errorMessage.includes('권한')) {
        setError('이 채널의 소유자가 아닙니다. 본인이 생성한 채널만 구독 상품을 등록할 수 있습니다.');
      } else if (errorMessage.includes('중복') || errorMessage.includes('duplicate') || errorMessage.includes('이미')) {
        setError(`${planFormData.planType === 'MONTHLY' ? '월간' : '연간'} 구독 상품이 이미 등록되어 있습니다.`);
      } else if (errorMessage.includes('401') || errorMessage.includes('인증')) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (errorMessage.includes('400') || errorMessage.includes('잘못된')) {
        setError('입력한 정보가 올바르지 않습니다. 다시 확인해주세요.');
      } else {
        setError(errorMessage || '구독 상품 등록 중 오류가 발생했습니다.');
      }
    }
  };

  // 구독 상품 수정
  const handleUpdatePlan = async (planId) => {
    if (!channel) {
      setError('채널 정보를 찾을 수 없습니다.');
      return;
    }

    if (planFormData.price === '') {
      setError('가격을 입력해주세요.');
      return;
    }

    const priceNum = parseInt(planFormData.price);
    if (!planFormData.price || isNaN(priceNum) || priceNum <= 0) {
      setError('가격은 양수여야 합니다.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      // 백엔드에서 소유권 검증 수행
      await updateSubscriptionPlan(channel.id, planId, {
        price: priceNum,
        isActive: planFormData.isActive !== undefined ? planFormData.isActive : null
      });

      setSuccess('구독 상품이 성공적으로 수정되었습니다.');
      
      // 구독 상품 목록 새로고침
      const plans = await getAllSubscriptionPlans(channel.id);
      setChannelPlans(Array.isArray(plans) ? plans : []);

      // 폼 초기화
      setEditingPlan(null);
      setPlanFormData({ planType: 'MONTHLY', price: '', isActive: true });

      // 2초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('구독 상품 수정 오류:', err);
      
      // 에러 메시지 추출
      const errorMessage = err?.message || err?.toString() || '알 수 없는 오류';
      
      // 백엔드에서 소유권 검증 실패 시 에러 메시지 표시
      if (errorMessage.includes('소유자') || errorMessage.includes('OWNER') || errorMessage.includes('403') || errorMessage.includes('권한')) {
        setError('이 채널에 대한 접근 권한이 없습니다.');
      } else if (errorMessage.includes('401') || errorMessage.includes('인증')) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (errorMessage.includes('400') || errorMessage.includes('잘못된')) {
        setError('입력한 정보가 올바르지 않습니다. 다시 확인해주세요.');
      } else {
        setError(errorMessage || '구독 상품 수정 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 헤더 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">구독 상품 관리</h1>
        </div>
        <p className="text-gray-600">채널의 구독 상품을 조회하고 관리할 수 있습니다. (월간/연간 각 1개씩 등록 가능)</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">채널 정보를 불러오는 중...</p>
        </div>
      ) : !channel ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">등록된 채널이 없습니다.</p>
          <p className="text-sm text-gray-500">먼저 채널을 생성해주세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* 채널 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{channel.title}</h2>
              {channel.category && (
                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mb-2">
                  {channel.category}
                </span>
              )}
              {channel.description && (
                <p className="text-sm text-gray-600 mt-2">{channel.description}</p>
              )}
            </div>
            {!creatingPlan && channelPlans.filter(plan => plan.isActive !== false).length < 2 && (
              <button
                onClick={() => {
                  setCreatingPlan(true);
                  setEditingPlan(null);
                  const activePlans = channelPlans.filter(plan => plan.isActive !== false);
                  const existingPlanTypes = activePlans.map(plan => plan.planType);
                  // 등록되지 않은 타입을 기본값으로 설정
                  const defaultType = existingPlanTypes.includes('MONTHLY') ? 'YEARLY' : 'MONTHLY';
                  setPlanFormData({ planType: defaultType, price: '', isActive: true });
                  setError('');
                  setSuccess('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                등록
              </button>
            )}
          </div>

          {/* 상품 등록 폼 */}
          {creatingPlan && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">새 구독 상품 등록</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 타입</label>
                  <select
                    value={planFormData.planType}
                    onChange={(e) => setPlanFormData({ ...planFormData, planType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {!channelPlans.filter(plan => plan.isActive !== false && plan.planType === 'MONTHLY').length && (
                      <option value="MONTHLY">월간</option>
                    )}
                    {!channelPlans.filter(plan => plan.isActive !== false && plan.planType === 'YEARLY').length && (
                      <option value="YEARLY">연간</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                  <input
                    type="number"
                    value={planFormData.price}
                    onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                    placeholder="예: 10000"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleCreatePlan}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    등록
                  </button>
                  <button
                    onClick={() => {
                      setCreatingPlan(false);
                      setPlanFormData({ planType: 'MONTHLY', price: '', isActive: true });
                      setError('');
                      setSuccess('');
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
          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : channelPlans.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">등록된 구독 상품이 없습니다.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">구독 상품</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {channelPlans.map((plan) => {
                  const planId = plan.planId || plan.id;
                  const isEditing = editingPlan === planId;
                  const isActive = plan.isActive !== false;

                  return (
                    <div
                      key={planId}
                      className={`border rounded-lg p-4 transition-colors ${
                        isActive
                          ? 'border-gray-200 hover:border-blue-300'
                          : 'border-gray-200 bg-gray-50 opacity-75'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <h5 className="font-semibold text-gray-900">상품 수정</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                              <input
                                type="number"
                                value={planFormData.price}
                                onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                                placeholder={plan.price?.toString() || ''}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                              <select
                                value={planFormData.isActive !== undefined ? planFormData.isActive : plan.isActive !== undefined ? plan.isActive : true}
                                onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-gray-900 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="true">활성</option>
                                <option value="false">비활성</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdatePlan(planId)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingPlan(null);
                                setPlanFormData({ planType: 'MONTHLY', price: '', isActive: true });
                                setError('');
                                setSuccess('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  isActive
                                    ? 'text-green-700 bg-green-50'
                                    : 'text-gray-700 bg-gray-900'
                                }`}
                              >
                                {isActive ? '활성' : '비활성'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPlan(planId);
                                  setCreatingPlan(false);
                                  setPlanFormData({
                                    planType: plan.planType || 'MONTHLY',
                                    price: plan.price?.toString() || '',
                                    isActive: plan.isActive !== undefined ? plan.isActive : true,
                                  });
                                  setError('');
                                  setSuccess('');
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="수정"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 w-1/3">
                            <span
                              className={`text-2xl font-bold block ${
                                isActive ? 'text-gray-900' : 'text-gray-600'
                              }`}
                            >
                              {plan.price.toLocaleString()}원
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 경고 메시지 (모든 타입 등록됨) */}
          {channelPlans.filter(plan => plan.isActive !== false).length >= 2 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                이 채널에는 월간 및 연간 구독 상품이 모두 등록되어 있습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
