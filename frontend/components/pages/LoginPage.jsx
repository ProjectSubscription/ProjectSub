import React from 'react';
import { LoginMethodToggle } from '@/components/login/LoginMethodToggle';
import { OAuthButtons } from '@/components/login/OAuthButtons';
import { EmailLoginForm } from '@/components/login/EmailLoginForm';

export function LoginPage({ onLogin, onNavigate }) {
  const [loginMethod, setLoginMethod] = React.useState('oauth');

  const handleOAuthLogin = (provider) => {
    // OAuth 로그인은 onNavigate를 통해 처리 (login/page.js에서 실제 OAuth 리다이렉트 수행)
    onNavigate(`oauth-${provider}`);
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
          <LoginMethodToggle method={loginMethod} onMethodChange={setLoginMethod} />

          {/* OAuth Login */}
          {loginMethod === 'oauth' && <OAuthButtons onOAuthLogin={handleOAuthLogin} />}

          {/* Email Login */}
          {loginMethod === 'email' && (
            <EmailLoginForm onSubmit={onLogin} onNavigate={onNavigate} />
          )}

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-600 mt-6">
            계정이 없으신가요?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              회원가입
            </button>
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
