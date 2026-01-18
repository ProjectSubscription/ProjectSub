'use client';

import React from 'react';
import { 
  User, 
  Search, 
  Bell, 
  ChevronDown,
  Tv,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Video,
  DollarSign,
  Users,
  FileText,
  Tag
} from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { getUnreadNotificationCount, subscribeNotifications } from '@/app/lib/api';

export function Header({ currentUser, currentPage, onNavigate, onLogout }) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notificationUpdateTrigger, setNotificationUpdateTrigger] = React.useState(0);

  // 역할 체크 헬퍼 함수
  const hasRole = (roles, role) => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.includes(role) || roles.includes(`ROLE_${role}`);
  };

  // 역할 표시용 (우선순위: ADMIN > CREATOR > USER)
  const getDisplayRole = (roles) => {
    if (!roles || !Array.isArray(roles)) return '일반 회원';
    if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) return '관리자';
    if (roles.includes('ROLE_CREATOR') || roles.includes('CREATOR')) return '크리에이터';
    return '일반 회원';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('channels');
    }
  };

  // 안읽은 알림 개수 로드
  React.useEffect(() => {
    if (currentUser) {
      loadUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [currentUser]);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('안읽은 알림 개수 조회 오류:', err);
    }
  };

  // SSE 실시간 알림 연결
  React.useEffect(() => {
    if (!currentUser) {
      return;
    }

    let eventSource = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3초

    const connectSSE = () => {
      try {
        console.log('SSE 연결 시도 중...');
        eventSource = subscribeNotifications();

        eventSource.onopen = () => {
          console.log('✅ SSE 연결 성공');
          reconnectAttempts = 0;
        };

        // 백엔드에서 "notification" 이벤트 이름으로 보내므로 addEventListener 사용
        eventSource.addEventListener('notification', (event) => {
          try {
            // CONNECTED 문자열인 경우
            if (event.data === 'CONNECTED') {
              console.log('SSE 연결 확인됨');
              return;
            }
            
            // JSON 데이터인 경우 (실제 알림)
            const data = JSON.parse(event.data);
            console.log('새 알림 수신 (notification 이벤트):', data);
            
            // 안읽은 알림 개수 업데이트
            loadUnreadCount();
            
            // NotificationDropdown 갱신 트리거
            setNotificationUpdateTrigger(prev => prev + 1);
            
            // 브라우저 알림 표시 (선택사항)
            if (Notification.permission === 'granted') {
              new Notification(data.title || '새 알림', {
                body: data.message || '',
                icon: '/favicon.ico',
              });
            }
          } catch (err) {
            // JSON 파싱 실패 시 무시 (CONNECTED 같은 문자열일 수 있음)
            console.log('SSE notification 이벤트 데이터:', event.data);
          }
        });

        // 이름 없는 이벤트 처리 (sendUnread에서 보낸 안읽은 알림들)
        eventSource.onmessage = (event) => {
          try {
            // CONNECTED 문자열인 경우
            if (event.data === 'CONNECTED') {
              console.log('SSE 연결 확인됨');
              return;
            }
            
            // JSON 데이터인 경우 (안읽은 알림)
            const data = JSON.parse(event.data);
            console.log('안읽은 알림 수신 (onmessage):', data);
            
            // 안읽은 알림 개수 업데이트
            loadUnreadCount();
            
            // NotificationDropdown 갱신 트리거
            setNotificationUpdateTrigger(prev => prev + 1);
          } catch (err) {
            // JSON 파싱 실패 시 무시 (CONNECTED 같은 문자열일 수 있음)
            console.log('SSE 메시지:', event.data);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ SSE 연결 오류:', error);
          console.error('SSE 연결 상태:', eventSource.readyState);
          // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
          if (eventSource.readyState === EventSource.CLOSED) {
            console.error('SSE 연결이 닫혔습니다.');
          }
          eventSource.close();

          // 재연결 시도
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimeout = setTimeout(() => {
              console.log(`SSE 재연결 시도 ${reconnectAttempts}/${maxReconnectAttempts}`);
              connectSSE();
            }, reconnectDelay * reconnectAttempts);
          } else {
            console.error('SSE 재연결 실패: 최대 시도 횟수 초과');
            // 폴백: 주기적으로 갱신
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
          }
        };
      } catch (err) {
        console.error('SSE 연결 생성 오류:', err);
      }
    };

    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connectSSE();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Menu */}
          <div className="flex items-center gap-4">
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
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotificationDropdown(!showNotificationDropdown);
                      setShowUserMenu(false);
                      if (!showNotificationDropdown) {
                        loadUnreadCount();
                      }
                    }}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotificationDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotificationDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 z-50">
                        <NotificationDropdown
                          isOpen={showNotificationDropdown}
                          onClose={() => {
                            setShowNotificationDropdown(false);
                            loadUnreadCount();
                          }}
                          onNotificationUpdate={notificationUpdateTrigger}
                          onNotificationChange={loadUnreadCount}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {currentUser.nickname || currentUser.name}
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
                          <p className="text-sm font-medium text-gray-900">{currentUser.nickname || currentUser.name}</p>
                          <p className="text-xs text-gray-500">{currentUser.email}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {getDisplayRole(currentUser.roles)}
                          </p>
                        </div>

                        {/* 일반 유저 메뉴 (모든 사용자가 볼 수 있음, ADMIN은 제외) */}
                        {!hasRole(currentUser.roles, 'ROLE_ADMIN') && (
                          <>
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                              사용자
                            </div>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('mypage');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <User className="w-4 h-4" />
                              마이페이지
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('my-subscriptions');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <CreditCard className="w-4 h-4" />
                              내 구독
                            </button>
                            {/* 크리에이터가 아니고, 크리에이터 신청 상태가 APPROVED가 아니면 신청 버튼 표시 */}
                            {!hasRole(currentUser.roles, 'ROLE_CREATOR') && currentUser.creatorStatus !== 'APPROVED' && (
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

                        {/* 크리에이터 메뉴 (ROLE_CREATOR가 있으면 표시) */}
                        {hasRole(currentUser.roles, 'ROLE_CREATOR') && (
                          <>
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                              크리에이터
                            </div>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-dashboard');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              대시보드
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-channel');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Tv className="w-4 h-4" />
                              채널 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-content');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Video className="w-4 h-4" />
                              콘텐츠 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('my-subscriptions');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <CreditCard className="w-4 h-4" />
                              구독 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('creator-settlement');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <DollarSign className="w-4 h-4" />
                              정산 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-payments');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <FileText className="w-4 h-4" />
                              결제내역
                            </button>
                          </>
                        )}

                        {/* 관리자 메뉴 (ROLE_ADMIN이 있으면 표시) */}
                        {hasRole(currentUser.roles, 'ROLE_ADMIN') && (
                          <>
                            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                              관리자
                            </div>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-applications');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Users className="w-4 h-4" />
                              판매자 신청 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-settlements');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <FileText className="w-4 h-4" />
                              정산 관리
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-payments');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <CreditCard className="w-4 h-4" />
                              결제 내역
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                onNavigate('admin-coupons');
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Tag className="w-4 h-4" />
                              쿠폰 관리
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
