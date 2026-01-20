'use client';

import { SuccessPage } from './Success';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'home': '/',
      'payment-fail': (params) => {
        const query = new URLSearchParams();
        if (params?.code) query.set('code', params.code);
        if (params?.message) query.set('message', params.message);
        if (params?.error) query.set('error', params.error);
        return `/payment/fail?${query.toString()}`;
      },
      'payment-success': (params) => {
        const query = new URLSearchParams();
        if (params?.amount) query.set('amount', params.amount);
        return `/payment/success?${query.toString()}`;
      },
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <SuccessPage onNavigate={handleNavigate} />;
}
