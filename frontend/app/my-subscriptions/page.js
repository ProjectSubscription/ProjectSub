'use client';

import { MySubscriptionsPage } from '@/components/subscription/MySubscriptionsPage';
import { useRouter } from 'next/navigation';

export default function MySubscriptions() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'channel-detail': (params) => `/channels/${params?.channelId || ''}`,
      'content-detail': (params) => `/contents/${params?.contentId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <MySubscriptionsPage onNavigate={handleNavigate} />;
}
