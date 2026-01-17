'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Save, X, Clock } from 'lucide-react';
import { getNewsletterForAdmin, updateNewsletter } from '@/app/lib/api';

export function EditNewsletterPage({ newsletterId }) {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
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
      console.log('뉴스레터 조회 시작:', newsletterId);
      
      const data = await getNewsletterForAdmin(newsletterId);
      console.log('뉴스레터 조회 결과:', data);
      
      if (!data) {
        setError('뉴스레터를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 발행된 뉴스레터는 수정 불가
      if (data.status === 'PUBLISHED') {
        setError('발행된 뉴스레터는 수정할 수 없습니다.');
        setLoading(false);
        return;
      }
      
      setTitle(data.title || '');
      setContent(data.content || '');
      setLoading(false);
    } catch (err) {
      console.error('뉴스레터 조회 오류:', err);
      setError(err.message || '뉴스레터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await updateNewsletter(newsletterId, title.trim(), content.trim());
      alert('뉴스레터가 수정되었습니다.');
      router.push('/admin/newsletters');
    } catch (err) {
      setError(err.message || '뉴스레터 수정 중 오류가 발생했습니다.');
      console.error('뉴스레터 수정 오류:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/newsletters');
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

  if (error && (!title || !content)) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">뉴스레터 수정</h1>
        </div>
        <p className="text-gray-600">뉴스레터 내용을 수정하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <div className="space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="뉴스레터 제목을 입력하세요"
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="뉴스레터 내용을 입력하세요&#10;&#10;HTML 태그를 사용할 수 있습니다."
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              HTML 태그를 사용하여 내용을 포맷팅할 수 있습니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

