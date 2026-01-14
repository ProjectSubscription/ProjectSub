'use client';

import { MySubscriptionsPage } from '@/components/pages/UserPages';
import { useRouter } from 'next/navigation';

export default function MySubscriptions() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'channel-detail': (params) => `/channels/${params?.channelId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <MySubscriptionsPage userId="user-1" onNavigate={handleNavigate} />;
}
