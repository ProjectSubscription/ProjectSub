'use client';

import { FailPage } from './Fail';
import { useRouter } from 'next/navigation';

export default function PaymentFail() {
  const router = useRouter();

  const handleNavigate = (page) => {
    const routeMap = {
      'home': '/',
    };

    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
  };

  return <FailPage onNavigate={handleNavigate} />;
}
