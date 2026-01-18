import React from 'react';
import { Tv, Users, Search, Filter } from 'lucide-react';
import { getChannels, getChannelCategories } from '@/app/lib/api';

export function ChannelListPage({ onNavigate }) {
  const [channels, setChannels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [categories, setCategories] = React.useState([{ id: 'all', name: '전체' }]);

  // 채널 목록 로드
  React.useEffect(() => {
    async function loadChannels() {
      try {
        setLoading(true);
        const params = {
          page: page,
          size: 20
        };
        
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const response = await getChannels(params);
        
        // Page 객체 처리
        const channelsList = response.content || response || [];
        setChannels(channelsList);
        setTotalPages(response.totalPages || 0);
      } catch (err) {
        console.error('채널 목록 로딩 실패:', err);
        setError(err.message || '채널 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, [selectedCategory, page]);

  React.useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const data = await getChannelCategories();
        if (!cancelled) {
          setCategories([{ id: 'all', name: '전체' }, ...(data || [])]);
        }
      } catch {
        if (!cancelled) {
          setCategories([{ id: 'all', name: '전체' }]);
        }
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // 검색 필터링
  const filteredChannels = channels.filter(channel => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      channel.title?.toLowerCase().includes(query) ||
      channel.description?.toLowerCase().includes(query) ||
      channel.channelName?.toLowerCase().includes(query)
    );
  });

  const getCategoryName = (category) => {
    const categoryObj = categories.find(c => c.id === category);
    return categoryObj ? categoryObj.name : category;
  };

  if (loading && channels.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div className="text-center py-12">
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
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">채널 둘러보기</h1>
        <p className="text-gray-600">다양한 크리에이터의 채널을 탐색하세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색바 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="채널명 또는 설명으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 채널 목록 */}
      {filteredChannels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">채널이 없습니다</h3>
          <p className="text-gray-600">
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 채널이 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => {
              const channelId = channel.channelId || channel.id;

              return (
                <div
                  key={channelId}
                  onClick={() => onNavigate('channel-detail', { channelId })}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* 썸네일 */}
                  <div className="w-full h-48 rounded-lg mb-4 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {channel.thumbnailUrl ? (
                      <img
                        src={channel.thumbnailUrl}
                        alt={channel.title || channel.channelName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                        {(channel.title || channel.channelName || '?').slice(0, 1)}
                      </div>
                    )}
                  </div>

                  {/* 채널 정보 */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                        {channel.title || channel.channelName || '채널명 없음'}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {channel.description || channel.channelDescription || '설명 없음'}
                      </p>
                    </div>

                    {/* 크리에이터 정보 */}
                    {channel.creatorNickname && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium text-gray-700">크리에이터:</span>
                        <span>{channel.creatorNickname}</span>
                      </div>
                    )}

                    {/* 통계 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{channel.subscriberCount?.toLocaleString() || 0}명 구독</span>
                      </div>
                      {channel.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {getCategoryName(channel.category)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
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
      )}
    </div>
  );
}
