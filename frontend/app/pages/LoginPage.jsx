import React from 'react';
import { Chrome, MessageCircle, Mail } from 'lucide-react';
import { PageRoute } from '../types';

export function LoginPage({ onLogin, onNavigate }) {
  const [loginMethod, setLoginMethod] = React.useState('oauth');

  const handleOAuthLogin = (provider) => {
    // Simulate OAuth login
    if (provider === 'google') {
      onLogin('user@example.com', 'password');
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    onLogin(email, password);
  };

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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">로그인</h2>

          {/* Method Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setLoginMethod('oauth')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'oauth'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              소셜 로그인
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              이메일 로그인
            </button>
          </div>

          {/* OAuth Login */}
          {loginMethod === 'oauth' && (
            <div className="space-y-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Chrome className="w-5 h-5 text-blue-600" />
                <span>Google로 계속하기</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('kakao')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Kakao로 계속하기</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('naver')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                <span className="text-xl font-bold">N</span>
                <span>Naver로 계속하기</span>
              </button>
            </div>
          )}

          {/* Email Login */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    defaultValue="user@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  defaultValue="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">로그인 상태 유지</span>
                </label>
                <button type="button" onClick={() => onNavigate('password-reset-request')} 
                  className="text-blue-600 hover:text-blue-700">
                  비밀번호 찾기
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                로그인
              </button>
            </form>
          )}

          {/* Demo Accounts */}
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

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-600 mt-6">
            계정이 없으신가요?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              회원가입
            </a>
          </p>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          로그인하시면 <a href="#" className="underline">이용약관</a> 및{' '}
          <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
