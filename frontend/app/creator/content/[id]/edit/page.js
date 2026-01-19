'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreatorContentEditPage } from '@/components/pages/CreatorContentEditPage';

export default function CreatorContentEdit() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id;

  const handleNavigate = (page, navParams) => {
    if (page === 'creator-content') {
      router.push('/creator/content');
    } else if (page === 'creator-dashboard') {
      router.push('/creator/dashboard');
    } else {
      router.push('/creator/dashboard');
    }
  };

  return <CreatorContentEditPage contentId={contentId} onNavigate={handleNavigate} />;
}
