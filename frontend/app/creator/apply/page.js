'use client';

import { useRouter } from 'next/navigation';

export default function CreatorApply() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: API 연동
    router.push('/creator/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">크리에이터 신청</h1>
        <p className="text-gray-600 mb-6">
          나만의 채널을 만들고 콘텐츠로 수익을 창출하세요
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널명
            </label>
            <input
              type="text"
              name="channelName"
              placeholder="채널 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널 설명
            </label>
            <textarea
              name="introduction"
              placeholder="어떤 콘텐츠를 만들 예정인지 설명해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            신청하기
          </button>
        </form>
      </div>
    </div>
  );
}
