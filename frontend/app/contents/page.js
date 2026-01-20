'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ContentGrid } from '@/components/channel/ContentGrid';
import { getContents } from '@/app/lib/api';

export default function ContentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessType = searchParams.get('accessType') || null;
  
  const [contents, setContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);

  // 콘텐츠 목록 로드
  React.useEffect(() => {
    async function loadContents() {
      try {
        setLoading(true);
        setError(null);

        // "유료" 필터인 경우 여러 accessType을 모두 가져와서 합치기
        if (accessType === 'PAID') {
          // SUBSCRIBER_ONLY, SINGLE_PURCHASE, PARTIAL 모두 가져오기
          // 각각 최대 100개씩 가져와서 합치기 (실제로는 더 많은 데이터가 있을 수 있으므로 개선 필요)
          const [subscriberResponse, purchaseResponse, partialResponse] = await Promise.all([
            getContents({ page: 0, size: 1000, accessType: 'SUBSCRIBER_ONLY' }).catch(() => ({ content: [], totalElements: 0 })),
            getContents({ page: 0, size: 1000, accessType: 'SINGLE_PURCHASE' }).catch(() => ({ content: [], totalElements: 0 })),
            getContents({ page: 0, size: 1000, accessType: 'PARTIAL' }).catch(() => ({ content: [], totalElements: 0 }))
          ]);

          // 모든 콘텐츠 합치기
          const allContents = [
            ...(subscriberResponse.content || subscriberResponse || []),
            ...(purchaseResponse.content || purchaseResponse || []),
            ...(partialResponse.content || partialResponse || [])
          ];

          // 최신순으로 정렬 (createdAt 기준)
          allContents.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          });

          // 페이징 처리 (클라이언트 사이드)
          const pageSize = 20;
          const startIndex = page * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedContents = allContents.slice(startIndex, endIndex);
          
          setContents(paginatedContents);
          setTotalPages(Math.ceil(allContents.length / pageSize));
          setTotalElements(allContents.length);
        } else {
          // FREE 또는 전체인 경우 기존 로직 사용
          const params = {
            page: page,
            size: 20
          };

          if (accessType) {
            params.accessType = accessType;
          }

          const response = await getContents(params);
          
          // Page 객체 처리
          const contentsList = response.content || response || [];
          setContents(contentsList);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err) {
        console.error('콘텐츠 목록 로딩 실패:', err);
        setError(err.message || '콘텐츠 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadContents();
  }, [accessType, page]);

  const handleNavigate = (page, params) => {
    if (page === 'content-detail') {
      router.push(`/contents/${params?.contentId || ''}`);
    } else if (page === 'channel-detail') {
      router.push(`/channels/${params?.channelId || ''}`);
    } else {
      router.push('/');
    }
  };


  const getPageTitle = () => {
    if (accessType === 'FREE') {
      return '무료 콘텐츠';
    } else if (accessType === 'PAID') {
      return '유료 콘텐츠';
    }
    return '전체 콘텐츠';
  };

  if (loading && contents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
        <p className="text-gray-600 mt-2">
          {accessType === 'FREE' 
            ? '로그인 없이 자유롭게 시청할 수 있는 무료 콘텐츠입니다'
            : accessType === 'PAID'
            ? '구독 또는 구매가 필요한 유료 콘텐츠입니다'
            : '다양한 콘텐츠를 둘러보세요'}
        </p>
        {totalElements > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            총 {totalElements.toLocaleString()}개의 콘텐츠
          </p>
        )}
      </div>

      {/* 필터 탭 - 무료 콘텐츠 페이지에서는 숨김 */}
      {accessType !== 'FREE' && (
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              router.push('/contents');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              !accessType
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => {
              router.push('/contents?accessType=FREE');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              accessType === 'FREE'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            무료
          </button>
          <button
            onClick={() => {
              router.push('/contents?accessType=PAID');
              setPage(0);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              accessType === 'PAID'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            유료
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 콘텐츠 목록 */}
      {contents.length > 0 ? (
        <>
          <ContentGrid 
            contents={contents.map(content => {
              const contentId = content.id || content.contentId || content.id;
              return {
                id: contentId,
                title: content.title || '',
                description: content.body || content.description || '',
                thumbnailUrl: content.mediaUrl || content.thumbnailUrl || '/placeholder-content.jpg',
                accessType: content.accessType || 'FREE',
                viewCount: content.viewCount || 0,
                likeCount: content.likeCount || 0,
              };
            })}
            isSubscribed={false}
            onNavigate={handleNavigate}
          />

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-4 py-2 text-gray-700">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {accessType === 'FREE' 
                ? '표시할 무료 콘텐츠가 없습니다.'
                : accessType === 'PAID'
                ? '표시할 유료 콘텐츠가 없습니다.'
                : '표시할 콘텐츠가 없습니다.'}
            </p>
          </div>
        )
      )}
    </div>
  );
}
