import React from 'react';
import { Chrome, MessageCircle } from 'lucide-react';

export function OAuthButtons({ onOAuthLogin }) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => onOAuthLogin('google')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
      >
        <Chrome className="w-5 h-5 text-blue-600" />
        <span>Google로 계속하기</span>
      </button>
      <button
        onClick={() => onOAuthLogin('kakao')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors font-medium"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Kakao로 계속하기</span>
      </button>
      <button
        onClick={() => onOAuthLogin('naver')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
      >
        <span className="text-xl font-bold">N</span>
        <span>Naver로 계속하기</span>
      </button>
    </div>
  );
}
