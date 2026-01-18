'use client';

import { CreateNewsletterPage } from '@/components/pages/CreateNewsletterPage';

export default function CreateNewsletter() {
  try {
    return <CreateNewsletterPage />;
  } catch (error) {
    console.error('CreateNewsletterPage 렌더링 오류:', error);
    return (
      <div className="p-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">페이지 로드 오류</h1>
        <p className="text-gray-600">콘솔을 확인해주세요.</p>
      </div>
    );
  }
}

