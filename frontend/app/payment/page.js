'use client';

import { PaymentPage } from '@/components/pages/PaymentPage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'subscription';
  const planId = searchParams.get('planId');
  const channelId = searchParams.get('channelId');
  const contentId = searchParams.get('contentId');
  const itemId = planId || contentId;

  const handleNavigate = (page, params) => {
    const routeMap = {
      'payment-success': (params) => `/payment/success?amount=${params?.amount || 0}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <PaymentPage 
    type={type} 
    itemId={itemId} 
    channelId={channelId}
    onNavigate={handleNavigate} 
  />;
}
