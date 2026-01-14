'use client';

import { PasswordResetPage } from '@/components/pages/PasswordResetPage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PasswordReset() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleNavigate = (page) => {
    const routeMap = {
      'login': '/login',
      'landing': '/',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <PasswordResetPage token={token} onNavigate={handleNavigate} />;
}
