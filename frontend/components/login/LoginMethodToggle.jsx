import React from 'react';

export function LoginMethodToggle({ method, onMethodChange }) {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-6">
      <button
        onClick={() => onMethodChange('oauth')}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
          method === 'oauth'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        소셜 로그인
      </button>
      <button
        onClick={() => onMethodChange('email')}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
          method === 'email'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        이메일 로그인
      </button>
    </div>
  );
}
