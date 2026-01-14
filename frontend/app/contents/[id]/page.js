'use client';

import { ContentDetailPage } from '@/components/pages/ContentDetailPage';
import { useRouter, useParams } from 'next/navigation';

export default function ContentDetail() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id;

  const handleNavigate = (page, navParams) => {
    const routeMap = {
      'channel-detail': (params) => `/channels/${params?.channelId || ''}`,
      'payment': (params) => `/payment?type=content&contentId=${params?.contentId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(navParams));
    } else if (route) {
      router.push(route);
    }
  };

  return <ContentDetailPage contentId={contentId} onNavigate={handleNavigate} />;
}
