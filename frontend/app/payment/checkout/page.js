'use client';

import { CheckoutPage } from './Checkout';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderCode = searchParams.get('orderCode');
  const orderName = searchParams.get('orderName');
  const amount = searchParams.get('amount');

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
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return (
    <CheckoutPage
      orderCode={orderCode}
      orderName={orderName}
      amount={amount ? parseInt(amount, 10) : undefined}
      onNavigate={handleNavigate}
    />
  );
}
