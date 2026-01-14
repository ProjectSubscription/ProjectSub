'use client';

import { PaymentSuccessPage } from '@/components/pages/PaymentSuccessPage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = parseInt(searchParams.get('amount') || '0', 10);

  const handleNavigate = (page) => {
    const routeMap = {
      'home': '/home',
      'mypage': '/mypage',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <PaymentSuccessPage amount={amount} onNavigate={handleNavigate} />;
}
