'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Calendar, ArrowLeft, Clock } from 'lucide-react';
import { getNewsletter } from '@/app/lib/api';

export function NewsletterDetailPage({ newsletterId }) {
  const router = useRouter();
  const [newsletter, setNewsletter] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (newsletterId) {
      loadNewsletter();
    }
  }, [newsletterId]);

  const loadNewsletter = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getNewsletter(newsletterId);
      setNewsletter(data);
    } catch (err) {
      setError(err.message || '뉴스레터를 불러오는 중 오류가 발생했습니다.');
      console.error('뉴스레터 상세 조회 오류:', err);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || '뉴스레터를 찾을 수 없습니다.'}
        </div>
        <button
          onClick={() => router.push('/newsletters')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => router.push('/newsletters')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>목록으로</span>
      </button>

      <article className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">뉴스레터</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {newsletter.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(newsletter.publishedAt)}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: newsletter.content }}
          />
        </div>
      </article>
    </div>
  );
}

