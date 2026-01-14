'use client';

import { useRouter } from 'next/navigation';

export default function CreatorContentNew() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: API 연동
    router.push('/creator/content');
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">새 콘텐츠 업로드</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              name="title"
              placeholder="콘텐츠 제목"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              name="description"
              placeholder="콘텐츠 설명"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              접근 유형
            </label>
            <select 
              name="accessType"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FREE">무료</option>
              <option value="SUBSCRIPTION">구독 필요</option>
              <option value="PAID">단건 구매</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            업로드
          </button>
        </form>
      </div>
    </div>
  );
}
