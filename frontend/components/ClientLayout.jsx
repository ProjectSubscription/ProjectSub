'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { getMyInfo, logout } from '@/app/lib/api';
import { AuthProvider } from '@/components/auth/AuthContext';

export function ClientLayout({ children }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // 사용자 정보 로드 (경로 변경 시에도 다시 로드)
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await getMyInfo();
        setCurrentUser(user);
      } catch (error) {
        // 인증되지 않은 사용자 또는 서버 오류
        // TODO: 인증 구현 후 실제 사용자 정보 로드
        // 현재는 테스트용으로 null 처리
        console.log('사용자 정보 로드 실패 (인증 미구현):', error.message);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [pathname]); // pathname 변경 시 사용자 정보 다시 로드

  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작...');
      
      // 로그아웃 API 호출
      await logout();
      console.log('✅ 로그아웃 API 호출 성공 - 백엔드 세션 무효화 완료');
      
      // 사용자 정보 즉시 초기화
      setCurrentUser(null);
      console.log('✅ 사용자 정보 상태 초기화 완료');
      
      // 세션이 제대로 삭제되었는지 확인
      try {
        const userCheck = await getMyInfo();
        console.warn('⚠️ 경고: 로그아웃 후에도 사용자 정보가 남아있음:', userCheck);
        // 세션이 남아있다면 강제로 초기화
        setCurrentUser(null);
      } catch (error) {
        // 예상된 에러: 인증되지 않은 사용자 (정상)
        console.log('✅ 세션 삭제 확인됨: 인증되지 않은 사용자 (정상)');
      }
      
      // 페이지 완전히 새로고침하여 UI 업데이트 및 세션 쿠키 확인
      console.log('✅ 페이지 새로고침하여 UI 업데이트...');
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

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
    setSidebarOpen(false);
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
      <AuthProvider currentUser={currentUser} loading={loading} setCurrentUser={setCurrentUser}>
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
      </AuthProvider>
    );
  }

  // Authenticated pages (with sidebar)
  return (
    <AuthProvider currentUser={currentUser} loading={loading} setCurrentUser={setCurrentUser}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          currentUser={currentUser}
          currentPage={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex flex-1">
          {currentUser && (
            <Sidebar
              currentUser={currentUser}
              currentPage={pathname}
              onNavigate={handleNavigate}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          <main className="flex-1 overflow-x-hidden">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
