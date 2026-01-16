'use client';

import { MyPage } from '@/components/pages/UserPages';
import { useRouter } from 'next/navigation';

export default function MyPageRoute() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'subscriptions-me': '/subscriptions/me',
      'my-purchases': '/my-purchases',
      'my-reviews': '/my-reviews',
      'my-coupons': '/my-coupons',
      'my-applications': '/my-applications',
      'creator-apply': '/creator/apply',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <MyPage userId="user-1" onNavigate={handleNavigate} />;
}
