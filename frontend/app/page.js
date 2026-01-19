'use client';

import { LandingPage } from '@/components/pages/LandingPage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'login': '/login',
      'home': '/home',
      'channels': '/channels',
      'creator-apply': '/creator/apply',
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

  return <LandingPage onNavigate={handleNavigate} />;
}
