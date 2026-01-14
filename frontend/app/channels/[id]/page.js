'use client';

import { ChannelDetailPage } from '@/components/pages/ChannelDetailPage';
import { useRouter, useParams } from 'next/navigation';

export default function ChannelDetail() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id;

  const handleNavigate = (page, navParams) => {
    const routeMap = {
      'content-detail': (params) => `/contents/${params?.contentId || ''}`,
      'payment': (params) => `/payment?type=subscription&planId=${params?.planId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(navParams));
    } else if (route) {
      router.push(route);
    }
  };

  return <ChannelDetailPage channelId={channelId} onNavigate={handleNavigate} />;
}
