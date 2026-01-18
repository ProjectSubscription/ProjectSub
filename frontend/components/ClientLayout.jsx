'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/components/auth/AuthContext';
import { UserProvider, useUser } from '@/components/contexts/UserContext';

// ClientLayout 내부 컴포넌트 (useUser 훅 사용)
function ClientLayoutContent({ children }) {
  const { currentUser, loading, handleLogout } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const getPathFromPage = (page, params) => {
    const routeMap = {
      landing: '/',
      login: '/login',
      home: '/home',
      channels: '/channels',
      'channel-detail': (p) => `/channels/${p?.channelId || ''}`,
      'content-detail': (p) => `/contents/${p?.contentId || ''}`,
      payment: '/payment',
      'payment-success': '/payment/success',
      mypage: '/mypage',
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
      'password-reset': (p) => `/password-reset?token=${p?.token || ''}`,
    };

    const route = routeMap[page];
    if (typeof route === 'function') return route(params);
    return route || '/';
  };

  const handleNavigate = (page, params) => {
    router.push(getPathFromPage(page, params));
  };

  const isPublicPage =
    pathname === '/' ||
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

  return (
    <AuthProvider currentUser={currentUser} loading={loading}>
      {isPublicPage ? (
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
      ) : (
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
      )}
    </AuthProvider>
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