'use client';

import { RegisterPage } from '@/components/pages/RegisterPage';
import { useRouter } from 'next/navigation';
import { registerMember } from '../lib/api';

export default function Register() {
  const router = useRouter();

  const handleRegister = async (data) => {
    try {
      await registerMember(data);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      // 페이지를 완전히 새로고침하여 모든 상태 초기화
      window.location.href = '/login';
    } catch (error) {
      console.error('Register error:', error);
      alert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleNavigate = (page) => {
    const routeMap = {
      'landing': '/',
      'login': '/login',
    };
    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />;
}
