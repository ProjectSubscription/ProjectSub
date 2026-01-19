'use client';

import { CreatorContentNewPage } from '@/components/pages/CreatorContentNewPage';
import { useRouter } from 'next/navigation';

export default function CreatorContentNew() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'creator-dashboard': '/creator/dashboard',
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

  return <CreatorContentNewPage onNavigate={handleNavigate} />;
}
