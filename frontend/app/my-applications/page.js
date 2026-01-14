'use client';

import { MyCreatorApplicationsPage } from '@/components/pages/UserPages';
import { useRouter } from 'next/navigation';

export default function MyApplications() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'creator-apply': '/creator/apply',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <MyCreatorApplicationsPage userId="user-1" onNavigate={handleNavigate} />;
}

