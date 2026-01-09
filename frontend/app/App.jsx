'use client';

import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ChannelDetailPage } from './pages/ChannelDetailPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { AdminApplicationsPage } from './pages/AdminApplicationsPage';
import { MySubscriptionsPage, MyPage } from './pages/UserPages';
import { PageRoute } from './types';
import { mockUsers } from './mockData';

export default function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [navigationState, setNavigationState] = React.useState({
    page: 'landing'
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogin = (email, password) => {
    // Simple login simulation
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setNavigationState({ page: 'home' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNavigationState({ page: 'landing' });
  };

  const handleNavigate = (page, params) => {
    setNavigationState({ page, params });
    setSidebarOpen(false); // Close sidebar on navigation (mobile)
    window.scrollTo(0, 0);
  };

  // Render page content
  const renderPage = () => {
    const { page, params } = navigationState;

    switch (page) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'channels':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'channel-detail':
        return (
          <ChannelDetailPage
            channelId={params?.channelId || 'channel-1'}
            onNavigate={handleNavigate}
          />
        );
      
      case 'content-detail':
        return (
          <ContentDetailPage
            contentId={params?.contentId || 'content-1'}
            onNavigate={handleNavigate}
          />
        );
      
      case 'payment':
        return (
          <PaymentPage
            type={params?.type || 'subscription'}
            itemId={params?.planId || params?.contentId || 'plan-1'}
            onNavigate={handleNavigate}
          />
        );
      
      case 'payment-success':
        return (
          <PaymentSuccessPage
            amount={params?.amount || 0}
            onNavigate={handleNavigate}
          />
        );
      
      case 'mypage':
        return <MyPage userId={currentUser?.id || 'user-1'} onNavigate={handleNavigate} />;
      
      case 'my-subscriptions':
        return (
          <MySubscriptionsPage
            userId={currentUser?.id || 'user-1'}
            onNavigate={handleNavigate}
          />
        );
      
      case 'my-purchases':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">구매한 콘텐츠</h1>
            <p className="text-gray-600">구매한 콘텐츠 목록이 여기에 표시됩니다.</p>
          </div>
        );
      
      case 'my-reviews':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">내 리뷰</h1>
            <p className="text-gray-600">작성한 리뷰 목록이 여기에 표시됩니다.</p>
          </div>
        );
      
      case 'my-coupons':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">보유 쿠폰</h1>
            <p className="text-gray-600">사용 가능한 쿠폰 목록이 여기에 표시됩니다.</p>
          </div>
        );
      
      case 'creator-apply':
        return (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">크리에이터 신청</h1>
              <p className="text-gray-600 mb-6">
                나만의 채널을 만들고 콘텐츠로 수익을 창출하세요
              </p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    채널명
                  </label>
                  <input
                    type="text"
                    placeholder="채널 이름을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    채널 설명
                  </label>
                  <textarea
                    placeholder="어떤 콘텐츠를 만들 예정인지 설명해주세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={5}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  신청하기
                </button>
              </form>
            </div>
          </div>
        );
      
      case 'creator-dashboard':
        return (
          <CreatorDashboard
            creatorId={currentUser?.id || 'creator-1'}
            onNavigate={handleNavigate}
          />
        );
      
      case 'creator-channel':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">채널 관리</h1>
            <p className="text-gray-600">채널 정보 수정 페이지입니다.</p>
          </div>
        );
      
      case 'creator-content':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">콘텐츠 관리</h1>
            <p className="text-gray-600">콘텐츠 목록 및 관리 페이지입니다.</p>
          </div>
        );
      
      case 'creator-content-new':
        return (
          <div className="max-w-3xl mx-auto py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">새 콘텐츠 업로드</h1>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    placeholder="콘텐츠 제목"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    placeholder="콘텐츠 설명"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    접근 유형
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>무료</option>
                    <option>구독 필요</option>
                    <option>단건 구매</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  업로드
                </button>
              </form>
            </div>
          </div>
        );
      
      case 'creator-settlement':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">정산 관리</h1>
            <p className="text-gray-600">정산 내역 페이지입니다.</p>
          </div>
        );
      
      case 'admin-applications':
        return <AdminApplicationsPage />;
      
      case 'admin-payments':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 내역 관리</h1>
            <p className="text-gray-600">전체 결제 내역 페이지입니다.</p>
          </div>
        );
      
      case 'admin-settlements':
        return (
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">정산 관리</h1>
            <p className="text-gray-600">전체 정산 관리 페이지입니다.</p>
          </div>
        );
      
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Public pages (no header/sidebar/footer)
  const isPublicPage = navigationState.page === 'landing' || navigationState.page === 'login';

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          currentUser={currentUser}
          currentPage={navigationState.page}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        {renderPage()}
        <Footer />
      </div>
    );
  }

  // Authenticated pages (with sidebar)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentUser={currentUser}
        currentPage={navigationState.page}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        {currentUser && (
          <Sidebar
            currentUser={currentUser}
            currentPage={navigationState.page}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
