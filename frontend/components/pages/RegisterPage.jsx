import React from 'react';
import { RegisterForm } from '@/components/register/RegisterForm';

export function RegisterPage({ onRegister, onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CreatorHub
            </h1>
          </button>
          <p className="text-gray-600 mt-2">크리에이터와 팬을 위한 플랫폼</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">회원가입</h2>

          <RegisterForm onSubmit={onRegister} onNavigate={onNavigate} />

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인
            </button>
          </p>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          회원가입하시면 <a href="#" className="underline">이용약관</a> 및{' '}
          <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
