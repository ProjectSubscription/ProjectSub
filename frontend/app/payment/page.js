'use client';

import { PaymentPage } from '@/components/pages/PaymentPage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'subscription';
  const planId = searchParams.get('planId');
  const contentId = searchParams.get('contentId');
  const itemId = planId || contentId || 'plan-1';

  const handleNavigate = (page, params) => {
    const routeMap = {
      'payment-success': (params) => `/payment/success?amount=${params?.amount || 0}`,
      'checkout': (params) => {
        const query = new URLSearchParams();
        if (params?.orderCode) query.set('orderCode', params.orderCode);
        if (params?.orderName) query.set('orderName', params.orderName);
        if (params?.amount) query.set('amount', params.amount.toString());
        return `/payment/checkout?${query.toString()}`;
      },
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <PaymentPage type={type} itemId={itemId} onNavigate={handleNavigate} />;
}
