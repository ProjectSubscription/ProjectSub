'use client';

import { CreatorDashboard } from '@/components/pages/CreatorDashboard';
import { useRouter } from 'next/navigation';

export default function CreatorDashboardRoute() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'creator-content': '/creator/content',
      'creator-content-new': '/creator/content/new',
      'creator-channel': '/creator/channel',
      'creator-settlement': '/creator/settlement',
      'content-detail': (params) => `/contents/${params?.contentId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  return <CreatorDashboard creatorId="creator-1" onNavigate={handleNavigate} />;
}
