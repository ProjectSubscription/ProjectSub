'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Calendar, ArrowRight, Clock } from 'lucide-react';
import { getNewsletters } from '@/app/lib/api';

export function NewslettersPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    loadNewsletters();
  }, [page]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNewsletters(page, 10);
      
      if (response && response.content) {
        if (page === 0) {
          setNewsletters(response.content);
        } else {
          setNewsletters(prev => [...prev, ...response.content]);
        }
        setHasMore(!response.last);
      } else {
        setNewsletters([]);
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || '뉴스레터를 불러오는 중 오류가 발생했습니다.');
      console.error('뉴스레터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (content) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // HTML 태그 제거
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">뉴스레터</h1>
        </div>
        <p className="text-gray-600">최신 소식과 업데이트를 확인하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading && newsletters.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">아직 발행된 뉴스레터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <div
              key={newsletter.newsletterId}
              onClick={() => router.push(`/newsletters/${newsletter.newsletterId}`)}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {newsletter.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {getPreview(newsletter.content)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(newsletter.publishedAt)}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

