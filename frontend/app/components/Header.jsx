import React from 'react';
import { 
  User, 
  Search, 
  Bell, 
  ChevronDown,
  Menu,
  Home,
  Tv,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard,
  Video,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';
import { PageRoute } from '../types';

export function Header({ currentUser, currentPage, onNavigate, onLogout, onToggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('channels');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Menu */}
          <div className="flex items-center gap-4">
            {currentUser && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onNavigate(currentUser ? 'home' : 'landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CreatorHub
              </span>
            </button>
          </div>

          {/* Search Bar */}
          {currentUser && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="채널이나 콘텐츠를 검색하세요..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                          <p className="text-xs text-gray-500">{currentUser.email}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {currentUser.role === 'ADMIN' ? '관리자' : 
                             currentUser.role === 'CREATOR' ? '크리에이터' : '일반 회원'}
                          </p>
                        </div>

                        {currentUser.role === 'USER' && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('mypage');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <User className="w-4 h-4" />
                              마이페이지
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('my-subscriptions');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <CreditCard className="w-4 h-4" />
                              내 구독
                            </button>
                            {currentUser.creatorStatus !== 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setShowUserMenu(false);
                                  onNavigate('creator-apply');
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-blue-600"
                              >
                                <Tv className="w-4 h-4" />
                                판매자 신청
                              </button>
                            )}
                          </>
                        )}

                        {currentUser.role === 'CREATOR' && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-dashboard');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              대시보드
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-content');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Video className="w-4 h-4" />
                              콘텐츠 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-settlement');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <DollarSign className="w-4 h-4" />
                              정산 관리
                            </button>
                          </>
                        )}

                        {currentUser.role === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-applications');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Users className="w-4 h-4" />
                              판매자 신청 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-settlements');
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <FileText className="w-4 h-4" />
                              정산 관리
                            </button>
                          </>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout();
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
                          >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {currentUser && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}
