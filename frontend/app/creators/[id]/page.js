'use client';

import { CreatorInfoPage } from '@/components/pages/CreatorInfoPage';
import { useParams, useRouter } from 'next/navigation';

export default function CreatorInfo() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id;

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

  return <CreatorInfoPage creatorId={creatorId} onNavigate={handleNavigate} />;
}

