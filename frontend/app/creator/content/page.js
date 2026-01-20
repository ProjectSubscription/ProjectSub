'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Calendar, Video, FileText } from 'lucide-react';
import { getMyChannel, getContents, deleteContent } from '@/app/lib/api';

export default function CreatorContent() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [channel, setChannel] = React.useState(null);
  const [contents, setContents] = React.useState([]);

  // 채널 정보 및 콘텐츠 목록 가져오기
  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 채널 정보 가져오기
        const channelData = await getMyChannel();
        setChannel(channelData);

        // 채널의 콘텐츠 목록 가져오기
        if (channelData?.channelId || channelData?.id) {
          const channelId = channelData.channelId || channelData.id;
          const response = await getContents({ channelId, size: 100 });
          const contentsList = response?.content || [];
          setContents(contentsList);
        }
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError('콘텐츠 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNewContent = () => {
    router.push('/creator/content/new');
  };

  const handleEditContent = (contentId) => {
    router.push(`/creator/content/${contentId}/edit`);
  };

  const handleDeleteContent = async (contentId, title) => {
    if (!confirm(`"${title}" 콘텐츠를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteContent(contentId);
      // 목록에서 제거 (contentId 또는 id 필드 확인)
      setContents(contents.filter(c => (c.contentId || c.id) !== contentId));
      alert('콘텐츠가 삭제되었습니다.');
    } catch (err) {
      console.error('콘텐츠 삭제 실패:', err);
      alert('콘텐츠 삭제에 실패했습니다.');
    }
  };

  const handleViewContent = (contentId) => {
    if (!contentId) {
      console.error('콘텐츠 ID가 없습니다.');
      return;
    }
    console.log('콘텐츠 상세 페이지로 이동:', contentId);
    router.push(`/contents/${contentId}`);
  };

  const getAccessTypeLabel = (accessType) => {
    const labels = {
      'FREE': '무료',
      'PARTIAL': '부분 유료',
      'SUBSCRIBER_ONLY': '구독자 전용',
      'SINGLE_PURCHASE': '단건 구매'
    };
    return labels[accessType] || accessType;
  };

  const getStatusLabel = (content) => {
    if (content.isDeleted) return '삭제됨';
    if (!content.publishedAt) return '임시저장';
    if (content.publishedAt && new Date(content.publishedAt) > new Date()) return '예약 발행';
    return '발행됨';
  };

  const getStatusColor = (content) => {
    if (content.isDeleted) return 'bg-red-100 text-red-700';
    if (!content.publishedAt) return 'bg-gray-100 text-gray-700';
    if (content.publishedAt && new Date(content.publishedAt) > new Date()) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">콘텐츠 관리</h1>
          <p className="text-gray-600">
            {channel?.title || '내 채널'}의 콘텐츠를 관리하세요
          </p>
        </div>
        <button
          onClick={handleNewContent}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 콘텐츠 등록
        </button>
      </div>

      {/* 콘텐츠 목록 */}
      {contents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">등록된 콘텐츠가 없습니다.</p>
          <button
            onClick={handleNewContent}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            첫 콘텐츠 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    콘텐츠
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    접근 타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수 / 좋아요
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => {
                  // contentId 또는 id 필드 사용
                  const contentId = content.contentId || content.id;
                  return (
                  <tr key={contentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {content.thumbnailUrl ? (
                          <img
                            src={content.thumbnailUrl}
                            alt={content.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            {content.contentType === 'VIDEO' ? (
                              <Video className="w-6 h-6 text-gray-400" />
                            ) : (
                              <FileText className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {content.title}
                          </h4>
                          {content.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {content.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {content.contentType === 'VIDEO' ? '비디오' : '텍스트'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getAccessTypeLabel(content.accessType)}
                      </span>
                      {content.accessType === 'SINGLE_PURCHASE' && content.price && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {content.price.toLocaleString()}원
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content)}`}>
                        {getStatusLabel(content)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{content.viewCount?.toLocaleString() || 0} 조회</div>
                        <div className="text-gray-500">{content.likeCount?.toLocaleString() || 0} 좋아요</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {content.createdAt 
                          ? new Date(content.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </div>
                      {content.publishedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          발행: {new Date(content.publishedAt).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewContent(contentId)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!content.isDeleted && (
                          <>
                            <button
                              onClick={() => handleEditContent(contentId)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContent(contentId, content.title)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
