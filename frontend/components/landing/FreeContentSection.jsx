'use client';

import React from 'react';
import { Play } from 'lucide-react';

export function FreeContentSection({ contents, onNavigate, isAuthenticated = false }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">무료 콘텐츠 미리보기</h2>
          <p className="text-gray-600">로그인 없이 바로 시청 가능한 콘텐츠</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {contents.map((content) => (
            <div
              key={content.id}
              onClick={() =>
                onNavigate('content-detail', { contentId: content.id })
              }
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="relative aspect-video">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  무료
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{content.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {content.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{content.viewCount.toLocaleString()} 조회</span>
                  <span>{content.likeCount.toLocaleString()} 좋아요</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
