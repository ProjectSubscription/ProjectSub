'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionsMeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-subscriptions');
  }, [router]);

  return null;
}
