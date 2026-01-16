'use client';

import { MySubscriptionsPage } from '@/components/pages/UserPages';
import { useRouter } from 'next/navigation';

export default function MySubscriptions() {
  const router = useRouter();

  const handleNavigate = (page, params) => {
    const routeMap = {
      'channel-detail': (params) => `/channels/${params?.channelId || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      router.push(route(params));
    } else if (route) {
      router.push(route);
    }
  };

  // TODO: 인증 구현 후 실제 사용자 ID로 변경
  // 현재는 테스트용으로 memberId=1 사용
  // 실제로는 세션에서 사용자 정보를 가져와야 함
  return <MySubscriptionsPage userId={1} onNavigate={handleNavigate} />;
}
