'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export function CTASection({ onNavigate, isAuthenticated = false }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          지금 바로 크리에이터가 되어보세요
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          무료로 시작하고, 첫 수익까지 단 3일
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'creator-apply' : 'login')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            크리에이터 신청하기
          </button>
          <button
            onClick={() => onNavigate(isAuthenticated ? 'channels' : 'login')}
            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
          >
            더 알아보기
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>무료 시작</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>90% 수익률</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>빠른 정산</span>
          </div>
        </div>
      </div>
    </section>
  );
}
