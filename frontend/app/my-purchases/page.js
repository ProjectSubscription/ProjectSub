'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { getMyOrders, getMyInfo, getContent } from '@/app/lib/api';
import { useUser } from '@/components/contexts/UserContext';
import { CheckCircle } from 'lucide-react';

export default function MyPurchasesPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const [purchasedContents, setPurchasedContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 구매한 콘텐츠 로드
  React.useEffect(() => {
    async function loadPurchasedContents() {
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
        console.log('전체 주문 목록:', orders);
        console.log('주문 개수:', orders?.length || 0);
        console.log('현재 사용자 memberId:', memberId);
        
        if (!orders || orders.length === 0) {
          console.log('주문이 없습니다.');
          setPurchasedContents([]);
          return;
        }
        
        // 각 주문의 타입과 상태 확인
        orders.forEach(order => {
          console.log('주문 상세:', {
            id: order.id,
            orderCode: order.orderCode,
            orderType: order.orderType,
            status: order.status,
            contentId: order.contentId,
            orderName: order.orderName
          });
        });
        
        // CONTENT 타입이고 PAID 상태인 주문만 필터링
        const contentOrders = orders.filter(order => {
          const isContent = order.orderType === 'CONTENT';
          const isPaid = order.status === 'PAID';
          const hasContentId = order.contentId != null;
          
          if (!isContent || !isPaid || !hasContentId) {
            console.log('주문 필터링 제외:', {
              orderCode: order.orderCode,
              orderType: order.orderType,
              status: order.status,
              contentId: order.contentId,
              reason: !isContent ? 'CONTENT 타입 아님' : !isPaid ? 'PAID 상태 아님' : 'contentId 없음'
            });
          }
          
          return isContent && isPaid && hasContentId;
        });
        
        console.log('필터링된 콘텐츠 주문:', contentOrders);
        console.log('필터링된 주문 개수:', contentOrders.length);

        // 각 주문의 콘텐츠 정보 가져오기
        const contentsPromises = contentOrders.map(async (order) => {
          try {
            const content = await getContent(order.contentId);
            return content;
          } catch (err) {
            console.warn(`콘텐츠 ${order.contentId} 조회 실패:`, err);
            return null;
          }
        });

        const contents = await Promise.all(contentsPromises);
        const validContents = contents.filter(content => content !== null);
        
        setPurchasedContents(validContents);
      } catch (err) {
        console.error('구매한 콘텐츠 로딩 실패:', err);
        setError(err.message || '구매한 콘텐츠를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadPurchasedContents();
  }, [currentUser]);

  const handleNavigate = (page, params) => {
    if (page === 'content-detail') {
      router.push(`/contents/${params?.contentId || ''}`);
    } else if (page === 'channel-detail') {
      router.push(`/channels/${params?.channelId || ''}`);
    } else {
      router.push('/');
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">구매한 콘텐츠</h1>
          <p className="text-gray-600">단건 구매한 콘텐츠 목록입니다</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">구매한 콘텐츠</h1>
        <p className="text-gray-600">단건 구매한 콘텐츠 목록입니다</p>
        {purchasedContents.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            총 {purchasedContents.length}개의 구매한 콘텐츠
          </p>
        )}
      </div>

      {/* 구매한 콘텐츠 목록 */}
      {purchasedContents.length > 0 ? (
        <>
          <ContentGrid 
            contents={purchasedContents.map(content => {
              const contentId = content.id || content.contentId;
              return {
                id: contentId,
                title: content.title || '',
                description: content.body || content.description || '',
                thumbnailUrl: content.mediaUrl || content.thumbnailUrl || '/placeholder-content.jpg',
                accessType: content.accessType || 'SINGLE_PURCHASE',
                viewCount: content.viewCount || 0,
                likeCount: content.likeCount || 0,
              };
            })}
            isSubscribed={false}
            onNavigate={handleNavigate}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">구매한 콘텐츠가 없습니다.</p>
          <p className="text-gray-500 text-sm mt-2">
            콘텐츠를 구매하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
