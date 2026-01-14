'use client';

import { LoginPage } from '@/components/pages/LoginPage';
import { useRouter } from 'next/navigation';
import { oauthLogin } from '../lib/api';

export default function Login() {
  const router = useRouter();

  const handleLogin = async (email, password) => {
    // OAuth 로그인은 리다이렉트로 처리
    // 일반 로그인은 백엔드 API 연동 필요
    try {
      // TODO: 일반 로그인 API 연동
      router.push('/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleNavigate = (page) => {
    if (page === 'oauth-google') {
      oauthLogin('google');
      return;
    }
    if (page === 'oauth-kakao') {
      oauthLogin('kakao');
      return;
    }
    if (page === 'oauth-naver') {
      oauthLogin('naver');
      return;
    }
    
    const routeMap = {
      'landing': '/',
      'password-reset-request': '/password-reset-request',
    };
    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
}
