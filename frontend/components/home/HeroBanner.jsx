import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';

export function HeroBanner({ onNavigate }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 md:p-12">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6" />
          <span className="font-medium">이달의 추천</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          새로운 크리에이터들의<br />놀라운 콘텐츠를 만나보세요
        </h2>
        <p className="text-blue-100 mb-6">
          지금 가장 핫한 채널들을 구독하고 다양한 콘텐츠를 즐겨보세요
        </p>
        <button
          onClick={() => onNavigate('channels')}
          className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
        >
          채널 둘러보기
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
