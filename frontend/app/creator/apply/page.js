'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCreatorApplication } from '@/app/lib/api';

const CHANNEL_CATEGORIES = [
  { value: 'ECONOMY_BUSINESS', label: '경제/비즈니스' },
  { value: 'FINANCE', label: '재테크' },
  { value: 'REAL_ESTATE', label: '부동산' },
  { value: 'BOOK_PUBLISHING', label: '책/작가/출판사' },
  { value: 'HOBBY_PRACTICAL', label: '취미/실용' },
  { value: 'EDUCATION', label: '교육/학습' },
  { value: 'SELF_DEVELOPMENT', label: '자기개발/취업' },
  { value: 'CULTURE_ART', label: '문화/예술' },
  { value: 'TREND_LIFE', label: '트렌드/라이프' },
];

export default function CreatorApply() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!selectedCategory) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (!channelName.trim()) {
      setError('채널명을 입력해주세요.');
      return;
    }
    if (!channelDescription.trim()) {
      setError('채널 설명을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        channelName: channelName.trim(),
        channelDescription: channelDescription.trim(),
        channelCategory: selectedCategory,
      };

      await createCreatorApplication(data);
      router.push('/creator/dashboard');
    } catch (err) {
      setError(err.message || '신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('크리에이터 신청 오류:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">크리에이터 신청</h1>
        <p className="text-gray-600 mb-6">
          나만의 채널을 만들고 콘텐츠로 수익을 창출하세요
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널 카테고리 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CHANNEL_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="채널 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채널 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="channelDescription"
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              placeholder="어떤 콘텐츠를 만들 예정인지 설명해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '신청 중...' : '신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
