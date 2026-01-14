'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Tv, 
  CreditCard, 
  Heart,
  MessageSquare,
  LayoutDashboard,
  Video,
  DollarSign,
  Settings,
  Users,
  FileText,
  TrendingUp,
  X
} from 'lucide-react';

export function Sidebar({ currentUser, currentPage, onNavigate, isOpen = true, onClose }) {
  const pathname = usePathname();

  const handleNavigation = (page) => {
    onNavigate(page);
    if (onClose) {
      onClose();
    }
  };

  // User Navigation
  const userNavItems = [
    { icon: Home, label: '홈', page: 'home', path: '/home' },
    { icon: Tv, label: '채널 둘러보기', page: 'channels', path: '/channels' },
    { icon: CreditCard, label: '내 구독', page: 'my-subscriptions', path: '/my-subscriptions' },
    { icon: Heart, label: '구매한 콘텐츠', page: 'my-purchases', path: '/my-purchases' },
    { icon: MessageSquare, label: '내 리뷰', page: 'my-reviews', path: '/my-reviews' },
  ];

  // Creator Navigation
  const creatorNavItems = [
    { icon: LayoutDashboard, label: '대시보드', page: 'creator-dashboard', path: '/creator/dashboard' },
    { icon: Tv, label: '채널 관리', page: 'creator-channel', path: '/creator/channel' },
    { icon: Video, label: '콘텐츠 관리', page: 'creator-content', path: '/creator/content' },
    { icon: DollarSign, label: '정산 관리', page: 'creator-settlement', path: '/creator/settlement' },
  ];

  // Admin Navigation
  const adminNavItems = [
    { icon: Users, label: '판매자 신청', page: 'admin-applications', path: '/admin/applications' },
    { icon: CreditCard, label: '결제 내역', page: 'admin-payments', path: '/admin/payments' },
    { icon: FileText, label: '정산 관리', page: 'admin-settlements', path: '/admin/settlements' },
  ];

  const navItems = 
    currentUser.role === 'ADMIN' ? adminNavItems :
    currentUser.role === 'CREATOR' ? creatorNavItems :
    userNavItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
          transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-64
        `}
        style={{ top: '64px' }}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          {onClose && (
            <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Separator for User role */}
            {currentUser.role === 'USER' && currentUser.creatorStatus !== 'APPROVED' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleNavigation('creator-apply')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center gap-2 justify-center"
                >
                  <TrendingUp className="w-5 h-5" />
                  크리에이터 되기
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  나만의 채널을 만들고<br />수익을 창출하세요
                </p>
              </div>
            )}

            {/* Creator status indicator */}
            {currentUser.role === 'USER' && currentUser.creatorStatus === 'PENDING' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">신청 검토 중</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    크리에이터 신청이 검토 중입니다
                  </p>
                </div>
              </div>
            )}

            {currentUser.role === 'USER' && currentUser.creatorStatus === 'REJECTED' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">신청 반려됨</p>
                  <p className="text-xs text-red-600 mt-1">
                    다시 신청하시겠습니까?
                  </p>
                  <button
                    onClick={() => handleNavigation('creator-apply')}
                    className="mt-2 text-xs text-red-700 underline"
                  >
                    재신청하기
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">
                {currentUser.role === 'ADMIN' ? '관리자 모드' :
                 currentUser.role === 'CREATOR' ? '크리에이터 모드' :
                 '일반 회원'}
              </p>
              <p>{currentUser.name}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
