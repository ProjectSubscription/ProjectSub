import React from 'react';

export function DemoAccounts({ onLogin }) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-3 text-center">빠른 데모 체험</p>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onLogin('user@example.com', 'password')}
          className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          일반 회원
        </button>
        <button
          onClick={() => onLogin('creator@example.com', 'password')}
          className="px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
        >
          크리에이터
        </button>
        <button
          onClick={() => onLogin('admin@example.com', 'password')}
          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          관리자
        </button>
      </div>
    </div>
  );
}
