'use client';

import { LoginPage } from '@/components/pages/LoginPage';
import { useRouter } from 'next/navigation';
import { oauthLogin, login } from '../lib/api';
import { useUser } from '@/components/contexts/UserContext';

export default function Login() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const handleLogin = async (email, password) => {
    try {
      // 일반 로그인 API 호출
      const result = await login(email, password);
      
      // 로그인 성공 확인
      if (result && result.success) {
        // 사용자 정보 즉시 새로고침하여 헤더에 반영
        await refreshUser();
        // 로그인 성공 시 홈으로 이동
        router.push('/home');
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      // 에러 발생 시 로그인 페이지에 머물기 (이동하지 않음)
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
      'register': '/register',
    };
    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
}
