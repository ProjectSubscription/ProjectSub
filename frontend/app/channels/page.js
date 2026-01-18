'use client';

import { HomePage } from '@/components/pages/HomePage';
import { useRouter } from 'next/navigation';

export default function ChannelsPage() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'channels': '/channels',
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

  return <HomePage onNavigate={handleNavigate} />;
}
