'use client';

import { SubscriptionPlansManagePage } from '@/components/subscription/SubscriptionPlansManagePage';
import { useRouter } from 'next/navigation';

export default function CreatorSubscriptionPlansRoute() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'creator-dashboard': '/creator/dashboard',
      'creator-channel': '/creator/channel',
      'creator-content': '/creator/content',
      'creator-content-new': '/creator/content/new',
      'creator-settlement': '/creator/settlement',
      'creator-subscription': '/creator/subscription-plans',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <SubscriptionPlansManagePage onNavigate={handleNavigate} />;
}
