'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders, getMyInfo, getMySubscriptions, getChannel, getSubscriptionPlans, getContent } from '@/app/lib/api';
import { useUser } from '@/components/contexts/UserContext';
import { CheckCircle, Calendar, CreditCard, Hash } from 'lucide-react';

export default function MyPurchasesPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [contentPurchases, setContentPurchases] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 구매 내역 로드
  React.useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true);
        setError(null);

        // 사용자 정보 가져오기
        let memberId;
        if (currentUser) {
          memberId = currentUser.id || currentUser.memberId;
        } else {
          const userInfo = await getMyInfo();
          if (!userInfo || (!userInfo.id && !userInfo.memberId)) {
            throw new Error('로그인이 필요합니다.');
          }
          memberId = userInfo.id || userInfo.memberId;
        }

        if (!memberId) {
          throw new Error('사용자 정보를 불러올 수 없습니다.');
        }
        
        // 주문 목록 가져오기
        const orders = await getMyOrders(memberId);
        
        // 구독 목록 가져오기
        const subscriptionsList = await getMySubscriptions();
        
        // CONTENT 타입이고 PAID 상태인 주문 필터링
        const paidContentOrders = orders.filter(order => 
          order.orderType === 'CONTENT' && order.status === 'PAID' && order.contentId != null
        );
        
        // SUBSCRIPTION 타입이고 PAID 상태인 주문 필터링
        const paidSubscriptionOrders = orders.filter(order => 
          order.orderType === 'SUBSCRIPTION' && order.status === 'PAID'
        );

        // 구독 정보 가져오기 (채널명, 구독 플랜 정보 포함)
        const subscriptionDetails = await Promise.all(
          subscriptionsList.map(async (subscription) => {
            try {
              // 주문에서 해당 구독과 연결된 주문 찾기 (subscriptionId 우선, 없으면 planId로)
              const relatedOrder = paidSubscriptionOrders.find(
                order => order.subscriptionId === subscription.subscriptionId
              ) || paidSubscriptionOrders.find(
                order => order.planId === subscription.planId
              );

              // 채널 정보 가져오기
              const channel = await getChannel(subscription.channelId);
              
              // 구독 플랜 정보 가져오기
              const plans = await getSubscriptionPlans(subscription.channelId);
              const plan = plans.find(
                (p) =>
                  p?.id === subscription.planId ||
                  p?.planId === subscription.planId
              );
              
              return {
                ...subscription,
                channelName: channel?.channelName || channel?.title || '알 수 없음',
                planType: plan?.planType || 'MONTHLY',
                price: plan?.price ?? 0,
                orderCode: relatedOrder?.orderCode || null,
                orderAmount: relatedOrder ? (relatedOrder.originalAmount - (relatedOrder.discountAmount || 0)) : null,
              };
            } catch (err) {
              console.warn(`구독 ${subscription.subscriptionId} 정보 조회 실패:`, err);
              return {
                ...subscription,
                channelName: '알 수 없음',
                planType: 'MONTHLY',
                price: 0,
                orderCode: null,
                orderAmount: null,
              };
            }
          })
        );

        // 단건 구매 정보 가져오기
        const contentPurchaseDetails = await Promise.all(
          paidContentOrders.map(async (order) => {
            try {
              const content = await getContent(order.contentId);
              return {
                orderCode: order.orderCode,
                contentId: order.contentId,
                contentTitle: content?.title || order.orderName || '알 수 없음',
                amount: order.originalAmount - (order.discountAmount || 0),
                originalAmount: order.originalAmount,
                discountAmount: order.discountAmount || 0,
                createdAt: order.createdAt,
              };
            } catch (err) {
              console.warn(`콘텐츠 ${order.contentId} 조회 실패:`, err);
              return {
                orderCode: order.orderCode,
                contentId: order.contentId,
                contentTitle: order.orderName || '알 수 없음',
                amount: order.originalAmount - (order.discountAmount || 0),
                originalAmount: order.originalAmount,
                discountAmount: order.discountAmount || 0,
                createdAt: order.createdAt,
              };
            }
          })
        );
        
        setSubscriptions(subscriptionDetails);
        setContentPurchases(contentPurchaseDetails);
      } catch (err) {
        console.error('구매 내역 로딩 실패:', err);
        setError(err.message || '구매 내역을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getPlanTypeLabel = (planType) => {
    return planType === 'YEARLY' ? '연간 구독' : '월간 구독';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">구매 내역</h1>
          <p className="text-gray-600">구독 및 단건 구매 내역을 확인할 수 있습니다</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const hasSubscriptions = subscriptions.length > 0;
  const hasContentPurchases = contentPurchases.length > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">구매 내역</h1>
        <p className="text-gray-600">구독 및 단건 구매 내역을 확인할 수 있습니다</p>
      </div>

      {/* 구독 내역 */}
      {hasSubscriptions && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">구독 내역</h2>
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.subscriptionId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {subscription.channelName}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {getPlanTypeLabel(subscription.planType)}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : subscription.status === 'EXPIRED'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status === 'ACTIVE' ? '활성' : subscription.status === 'EXPIRED' ? '만료' : '취소됨'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">시작일</div>
                      <div className="font-medium">{formatDate(subscription.startedAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">만료일</div>
                      <div className="font-medium">{formatDate(subscription.expiredAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">금액</div>
                      <div className="font-medium">
                        {subscription.orderAmount ? formatCurrency(subscription.orderAmount) : formatCurrency(subscription.price)}
                      </div>
                    </div>
                  </div>
                  {subscription.orderCode && (
                    <div className="flex items-center text-gray-600">
                      <Hash className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm">주문번호</div>
                        <div className="font-medium font-mono text-xs">{subscription.orderCode}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 단건 구매 내역 */}
      {hasContentPurchases && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">단건 구매 내역</h2>
          <div className="grid gap-4">
            {contentPurchases.map((purchase) => (
              <div
                key={purchase.orderCode}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {purchase.contentTitle}
                    </h3>
                    <button
                      onClick={() => router.push(`/contents/${purchase.contentId}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      콘텐츠 보기 →
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-gray-600">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">결제 금액</div>
                      <div className="font-medium">{formatCurrency(purchase.amount)}</div>
                      {purchase.discountAmount > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(purchase.originalAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Hash className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">주문번호</div>
                      <div className="font-medium font-mono text-xs">{purchase.orderCode}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <div className="text-sm">구매일</div>
                      <div className="font-medium">{formatDate(purchase.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 구매 내역이 없는 경우 */}
      {!hasSubscriptions && !hasContentPurchases && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">구매 내역이 없습니다.</p>
          <p className="text-gray-500 text-sm mt-2">
            구독이나 콘텐츠를 구매하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
