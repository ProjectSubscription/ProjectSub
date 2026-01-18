'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserProvider, useUser } from '@/components/contexts/UserContext';

// ClientLayout 내부 컴포넌트 (useUser 훅 사용)
function ClientLayoutContent({ children }) {
  const { currentUser, loading, handleLogout } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // 페이지 경로 매핑 (기존 문자열 기반 라우팅을 Next.js 경로로 변환)
  const getPathFromPage = (page) => {
    const routeMap = {
      'landing': '/',
      'login': '/login',
      'home': '/home',
      'channels': '/channels',
      'channel-detail': (params) => `/channels/${params?.channelId || ''}`,
      'content-detail': (params) => `/contents/${params?.contentId || ''}`,
      'payment': '/payment',
      'payment-success': '/payment/success',
      'mypage': '/mypage',
      'my-subscriptions': '/my-subscriptions',
      'my-purchases': '/my-purchases',
      'my-reviews': '/my-reviews',
      'my-coupons': '/my-coupons',
      'creator-apply': '/creator/apply',
      'creator-dashboard': '/creator/dashboard',
      'creator-channel': '/creator/channel',
      'creator-content': '/creator/content',
      'creator-content-new': '/creator/content/new',
      'creator-settlement': '/creator/settlement',
      'admin-applications': '/admin/applications',
      'admin-payments': '/admin/payments',
      'admin-settlements': '/admin/settlements',
      'admin-newsletters': '/admin/newsletters',
      'newsletters': '/newsletters',
      'newsletter-detail': (params) => `/newsletters/${params?.id || ''}`,
      'admin-coupons': '/admin/coupons',
      'password-reset-request': '/password-reset-request',
      'password-reset': (params) => `/password-reset?token=${params?.token || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') {
      return route();
    }
    return route || '/';
  };

  const handleNavigate = (page, params) => {
    const path = getPathFromPage(page);
    router.push(path);
  };

  // Public pages (no header/sidebar/footer)
  const isPublicPage = pathname === '/' || 
                       pathname === '/login' || 
                       pathname === '/register' ||
                       pathname === '/password-reset-request' ||
                       pathname.startsWith('/password-reset');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header
          currentUser={currentUser}
          currentPage={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Authenticated pages
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentUser={currentUser}
        currentPage={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ClientLayout 최상위 컴포넌트 (UserProvider로 감싸기)
export function ClientLayout({ children }) {
  return (
    <UserProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </UserProvider>
  );
}
