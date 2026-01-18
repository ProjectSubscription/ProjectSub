'use client';

import { NewslettersPage } from '@/components/pages/NewslettersPage';

export default function Newsletters() {
  try {
    return <NewslettersPage />;
  } catch (error) {
    console.error('NewslettersPage 렌더링 오류:', error);
    return (
      <div className="p-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">페이지 로드 오류</h1>
        <p className="text-gray-600">콘솔을 확인해주세요.</p>
      </div>
    );
  }
}

