'use client';

import { PasswordResetRequestPage } from '@/components/pages/PasswordResetRequestPage';
import { useRouter } from 'next/navigation';

export default function PasswordResetRequest() {
  const router = useRouter();

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

  return <PasswordResetRequestPage onNavigate={handleNavigate} />;
}
