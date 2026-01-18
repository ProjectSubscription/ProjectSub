'use client';

import React from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Loader2, Plus, X, Calendar, DollarSign, Edit2, Power } from 'lucide-react';
import { getChannels, createSubscriptionPlan, getSubscriptionPlans, getAllSubscriptionPlans, getMyCreatorInfo, updateSubscriptionPlan } from '@/app/lib/api';

export function SubscriptionPlanManagement({ onNavigate }) {
  const [channels, setChannels] = React.useState([]);
  const [channelPlans, setChannelPlans] = React.useState({}); // { channelId: [plans] }
  const [loading, setLoading] = React.useState(true);
  const [loadingPlans, setLoadingPlans] = React.useState({}); // { channelId: true/false }
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // 등록 모달 상태
  const [showModal, setShowModal] = React.useState(false);
  const [selectedChannelId, setSelectedChannelId] = React.useState(null);
  const [planType, setPlanType] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // 수정 모달 상태
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [editPrice, setEditPrice] = React.useState('');
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editing, setEditing] = React.useState(false);

  // 크리에이터가 소유한 채널 목록 로드
  React.useEffect(() => {
    async function loadChannels() {
      try {
        setLoading(true);
        setError('');
        
        // 현재 로그인한 크리에이터 정보 가져오기
        const creatorInfo = await getMyCreatorInfo();
        const creatorId = creatorInfo?.id;
        
        if (!creatorId) {
          setError('크리에이터 정보를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }
        
        // 모든 채널 목록 가져오기 (Page 객체일 수 있음)
        const data = await getChannels();
        
        // Page 객체인 경우 content 배열 사용, 아니면 배열 그대로 사용
        let allChannels = [];
        if (data && typeof data === 'object') {
          if (Array.isArray(data.content)) {
            allChannels = data.content;
          } else if (Array.isArray(data)) {
            allChannels = data;
          }
        }
        
        // 현재 크리에이터가 소유한 채널만 필터링 (creatorId로 필터링)
        const channelsList = allChannels.filter(channel => {
          // 백엔드 응답에 creatorId가 있는 경우
          if (channel.creatorId) {
            return channel.creatorId === creatorId;
          }
          // 또는 creator 객체의 id로 확인
          if (channel.creator?.id) {
            return channel.creator.id === creatorId;
          }
          return false;
        }).map(channel => ({
          ...channel,
          id: channel.id || channel.channelId // id 필드 통일
        }));
        
        setChannels(channelsList);

        // 각 채널별로 구독 상품 조회 (크리에이터용 - 모든 상품 조회)
        const plansMap = {};
        const loadingMap = {};
        for (const channel of channelsList) {
          loadingMap[channel.id] = true;
          try {
            // 크리에이터는 모든 상품(활성/비활성)을 조회
            const plans = await getAllSubscriptionPlans(channel.id);
            plansMap[channel.id] = Array.isArray(plans) ? plans : [];
          } catch (err) {
            console.error(`채널 ${channel.id} 구독 상품 조회 오류:`, err);
            plansMap[channel.id] = [];
          } finally {
            loadingMap[channel.id] = false;
          }
        }
        setChannelPlans(plansMap);
        setLoadingPlans(loadingMap);
      } catch (err) {
        setError(err.message || '채널 목록을 불러오는 중 오류가 발생했습니다.');
        console.error('채널 목록 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChannels();
  }, []);

  // 선택된 채널의 기존 구독 상품 확인
  const selectedChannelPlans = selectedChannelId ? (channelPlans[selectedChannelId] || []) : [];
  const selectedChannelActivePlans = selectedChannelPlans.filter(plan => plan.isActive);
  const existingPlanTypes = selectedChannelActivePlans.map(plan => plan.planType);

  // 선택 가능한 planType 필터링 (이미 등록된 타입 제외)
  const availablePlanTypes = React.useMemo(() => {
    const allTypes = [
      { value: 'MONTHLY', label: '월간 구독' },
      { value: 'YEARLY', label: '연간 구독' }
    ];
    return allTypes.filter(type => !existingPlanTypes.includes(type.value));
  }, [existingPlanTypes]);

  // 등록 모달 열기
  const handleOpenModal = (channelId) => {
    setSelectedChannelId(channelId);
    setPlanType('');
    setPrice('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // 등록 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChannelId(null);
    setPlanType('');
    setPrice('');
    setError('');
    setSuccess('');
  };

  // 수정 모달 열기
  const handleOpenEditModal = (channelId, plan) => {
    setSelectedChannelId(channelId);
    setSelectedPlan(plan);
    setEditPrice(plan.price.toString());
    setEditIsActive(plan.isActive !== false); // 기본값 true
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPlan(null);
    setEditPrice('');
    setEditIsActive(true);
    setError('');
    setSuccess('');
  };

  // 구독 상품 수정
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    
    if (!selectedChannelId || !selectedPlan) {
      setError('상품 정보를 불러올 수 없습니다.');
      return;
    }

    const priceNum = parseInt(editPrice);
    if (!editPrice || isNaN(priceNum) || priceNum <= 0) {
      setError('가격은 양수여야 합니다.');
      return;
    }

    try {
      setEditing(true);
      setError('');
      setSuccess('');

      await updateSubscriptionPlan(selectedChannelId, selectedPlan.planId || selectedPlan.id, {
        price: priceNum,
        isActive: editIsActive
      });

      setSuccess('구독 상품이 성공적으로 수정되었습니다.');
      
      // 해당 채널의 구독 상품 목록 새로고침
      const plans = await getAllSubscriptionPlans(selectedChannelId);
      setChannelPlans(prev => ({
        ...prev,
        [selectedChannelId]: Array.isArray(plans) ? plans : []
      }));

      // 2초 후 모달 닫기
      setTimeout(() => {
        handleCloseEditModal();
      }, 2000);
    } catch (err) {
      setError(err.message || '구독 상품 수정 중 오류가 발생했습니다.');
      console.error('구독 상품 수정 오류:', err);
    } finally {
      setEditing(false);
    }
  };

  // 구독 상품 등록
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChannelId) {
      setError('채널을 선택해주세요.');
      return;
    }

    if (!planType) {
      setError('구독 타입을 선택해주세요.');
      return;
    }

    // 이미 등록된 타입인지 확인 (추가 검증)
    if (existingPlanTypes.includes(planType)) {
      setError(`${planType === 'MONTHLY' ? '월간' : '연간'} 구독 상품이 이미 등록되어 있습니다.`);
      return;
    }

    const priceNum = parseInt(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setError('가격은 양수여야 합니다.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await createSubscriptionPlan(selectedChannelId, {
        planType,
        price: priceNum
      });

      setSuccess('구독 상품이 성공적으로 등록되었습니다.');
      
      // 해당 채널의 구독 상품 목록 새로고침
      const plans = await getAllSubscriptionPlans(selectedChannelId);
      setChannelPlans(prev => ({
        ...prev,
        [selectedChannelId]: Array.isArray(plans) ? plans : []
      }));

      // 2초 후 모달 닫기
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err) {
      setError(err.message || '구독 상품 등록 중 오류가 발생했습니다.');
      console.error('구독 상품 등록 오류:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChannel = channels.find(ch => ch.id === selectedChannelId);

  return (
    <div className="space-y-8 pb-12">
      {/* 헤더 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">구독 관리</h1>
        </div>
        <p className="text-gray-600">채널별 구독 상품을 조회하고 관리할 수 있습니다.</p>
      </div>

      {/* 에러 메시지 */}
      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 성공 메시지 */}
      {success && !showModal && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">채널 목록을 불러오는 중...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">등록된 채널이 없습니다.</p>
          <p className="text-sm text-gray-500">먼저 채널을 생성해주세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {channels.map((channel) => {
            const plans = channelPlans[channel.id] || [];
            const activePlans = plans.filter(plan => plan.isActive !== false);
            const inactivePlans = plans.filter(plan => plan.isActive === false);
            const loadingChannelPlans = loadingPlans[channel.id];

            return (
              <div key={channel.id} className="bg-white rounded-xl p-6 shadow-sm">
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
                  <button
                    onClick={() => handleOpenModal(channel.id)}
                    disabled={activePlans.length >= 2}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                      ${activePlans.length >= 2
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    <Plus className="w-5 h-5" />
                    등록
                  </button>
                </div>

                {/* 구독 상품 목록 */}
                {loadingChannelPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : activePlans.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">등록된 구독 상품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 활성화된 상품 */}
                    {activePlans.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activePlans.map((plan) => (
                          <div
                            key={plan.id || plan.planId}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-900">
                                  {plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded">
                                  활성
                                </span>
                                <button
                                  onClick={() => handleOpenEditModal(channel.id, plan)}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="수정"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-2xl font-bold text-gray-900">
                                {plan.price.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 비활성화된 상품 */}
                    {inactivePlans.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">비활성화된 상품</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inactivePlans.map((plan) => (
                            <div
                              key={plan.id || plan.planId}
                              className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-gray-400" />
                                  <span className="font-semibold text-gray-600">
                                    {plan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded">
                                    비활성
                                  </span>
                                  <button
                                    onClick={() => handleOpenEditModal(channel.id, plan)}
                                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="수정"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-2xl font-bold text-gray-600">
                                  {plan.price.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activePlans.length === 0 && inactivePlans.length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">등록된 구독 상품이 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 경고 메시지 (모든 타입 등록됨) */}
                {activePlans.length >= 2 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      이 채널에는 월간 및 연간 구독 상품이 모두 등록되어 있습니다.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 등록 모달 */}
      {showModal && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">구독 상품 등록</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedChannel.title}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 모달 본문 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 성공 메시지 */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* 기존 구독 상품 정보 */}
              {selectedChannelActivePlans.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">등록된 구독 상품</p>
                  <div className="space-y-2">
                    {selectedChannelActivePlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {plan.planType === 'MONTHLY' ? '월간' : '연간'} 구독
                        </span>
                        <span className="font-medium text-gray-900">
                          {plan.price.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 구독 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구독 타입 <span className="text-red-500">*</span>
                </label>
                {availablePlanTypes.length === 0 ? (
                  <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      이 채널에는 이미 월간/연간 구독 상품이 모두 등록되어 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {availablePlanTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setPlanType(type.value)}
                        className={`
                          px-4 py-3 border-2 rounded-lg text-center font-medium transition-colors
                          ${planType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 가격 입력 */}
              {planType && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    step="1"
                    placeholder="예: 10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {planType === 'MONTHLY' 
                      ? '월간 구독 가격을 입력하세요.' 
                      : '연간 구독 가격을 입력하세요.'}
                  </p>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting || !planType || !price || availablePlanTypes.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      등록
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && selectedPlan && selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">구독 상품 수정</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedChannel.title} - {selectedPlan.planType === 'MONTHLY' ? '월간 구독' : '연간 구독'}
                </p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 모달 본문 */}
            <form onSubmit={handleUpdatePlan} className="p-6 space-y-6">
              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 성공 메시지 */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* 가격 수정 */}
              <div>
                <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="editPrice"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  min="1"
                  step="1"
                  placeholder="예: 10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  현재 가격: {selectedPlan.price.toLocaleString()}원
                </p>
              </div>

              {/* 활성화/비활성화 토글 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 상태
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEditIsActive(true)}
                    className={`
                      flex-1 px-4 py-3 border-2 rounded-lg text-center font-medium transition-colors
                      ${editIsActive
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      활성화
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(false)}
                    className={`
                      flex-1 px-4 py-3 border-2 rounded-lg text-center font-medium transition-colors
                      ${!editIsActive
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Power className="w-5 h-5" />
                      비활성화
                    </div>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  비활성화 시 새로운 구독 신청이 불가능하며, 기존 구독자는 계속 이용할 수 있습니다.
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editing || !editPrice}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {editing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-5 h-5" />
                      수정
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}