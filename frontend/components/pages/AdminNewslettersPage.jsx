'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Archive, 
  Calendar,
  Clock,
  FileText,
  Eye
} from 'lucide-react';
import { 
  getAllNewsletters, 
  getNewslettersByStatus, 
  publishNewsletter, 
  archiveNewsletter, 
  deleteNewsletter 
} from '@/app/lib/api';

export function AdminNewslettersPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    loadNewsletters();
  }, [filter, page]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (filter === 'all') {
        response = await getAllNewsletters(page, 10);
      } else {
        response = await getNewslettersByStatus(filter, page, 10);
      }
      
      if (response && response.content) {
        if (page === 0) {
          setNewsletters(response.content);
        } else {
          setNewsletters(prev => [...prev, ...response.content]);
        }
        setHasMore(!response.last);
      } else {
        if (page === 0) {
          setNewsletters([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || '뉴스레터를 불러오는 중 오류가 발생했습니다.');
      console.error('뉴스레터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setPage(0);
    setNewsletters([]);
  }, [filter]);

  const handlePublish = async (id) => {
    if (!confirm('이 뉴스레터를 발행하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(id);
      await publishNewsletter(id);
      await loadNewsletters();
      alert('발행되었습니다.');
    } catch (err) {
      alert(err.message || '발행 처리 중 오류가 발생했습니다.');
      console.error('발행 처리 오류:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('이 뉴스레터를 보관하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(id);
      await archiveNewsletter(id);
      await loadNewsletters();
      alert('보관되었습니다.');
    } catch (err) {
      alert(err.message || '보관 처리 중 오류가 발생했습니다.');
      console.error('보관 처리 오류:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 뉴스레터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setProcessing(id);
      await deleteNewsletter(id);
      await loadNewsletters();
      alert('삭제되었습니다.');
    } catch (err) {
      alert(err.message || '삭제 처리 중 오류가 발생했습니다.');
      console.error('삭제 처리 오류:', err);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '미발행';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="w-3 h-3" />
            초안
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Send className="w-3 h-3" />
            발행됨
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Archive className="w-3 h-3" />
            보관됨
          </span>
        );
      default:
        return null;
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const tabs = [
    { id: 'all', label: '전체', count: null },
    { id: 'DRAFT', label: '초안', count: null },
    { id: 'PUBLISHED', label: '발행됨', count: null },
    { id: 'ARCHIVED', label: '보관됨', count: null },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">뉴스레터 관리</h1>
          </div>
          <p className="text-gray-600">뉴스레터를 작성하고 관리하세요</p>
        </div>
        <button
          onClick={() => router.push('/admin/newsletters/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 뉴스레터 작성
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 탭 */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${filter === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 목록 */}
      {loading && newsletters.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">뉴스레터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <div
              key={newsletter.newsletterId}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {newsletter.title}
                    </h3>
                    {getStatusBadge(newsletter.status)}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {newsletter.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(newsletter.publishedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {newsletter.status === 'PUBLISHED' && (
                    <button
                      onClick={() => router.push(`/newsletters/${newsletter.newsletterId}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="보기"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  {newsletter.status !== 'PUBLISHED' && (
                    <button
                      onClick={() => router.push(`/admin/newsletters/${newsletter.newsletterId}/edit`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {newsletter.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(newsletter.newsletterId)}
                      disabled={processing === newsletter.newsletterId}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="발행"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                  {newsletter.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleArchive(newsletter.newsletterId)}
                      disabled={processing === newsletter.newsletterId}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="보관"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(newsletter.newsletterId)}
                    disabled={processing === newsletter.newsletterId}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
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

