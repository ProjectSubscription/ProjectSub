'use client';

import { SubscriptionPlanManagement } from '@/components/pages/SubscriptionPlanManagement';
import { useRouter } from 'next/navigation';

export default function CreatorSubscriptionRoute() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'creator-dashboard': '/creator/dashboard',
      'creator-channel': '/creator/channel',
      'creator-content': '/creator/content',
      'creator-content-new': '/creator/content/new',
      'creator-settlement': '/creator/settlement',
      'creator-subscription': '/creator/subscription',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <SubscriptionPlanManagement onNavigate={handleNavigate} />;
}