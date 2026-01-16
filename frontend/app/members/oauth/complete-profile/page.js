'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OAuthCompleteProfileModal } from '@/components/oauth/OAuthCompleteProfileModal';

export default function OAuthCompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsOpen(true);
    } else {
      // 토큰이 없으면 홈으로 리다이렉트
      router.push('/');
    }
  }, [searchParams, router]);

  const handleComplete = () => {
    setIsOpen(false);
    // 프로필 완성 후 홈으로 이동
    router.push('/home');
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  if (!token) {
    return null;
  }

  return (
    <OAuthCompleteProfileModal
      token={token}
      isOpen={isOpen}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
}
