'use client';

import React from 'react';
import { Video, Mail, Calendar, MessageSquare, X, Check, Trash2, Clock, Bell } from 'lucide-react';
import { getNotifications, readNotification, deleteNotification } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

export function NotificationDropdown({ onClose, onNotificationUpdate, onNotificationChange, isOpen }) {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // 드롭다운이 열릴 때마다 최신 데이터 로드
  React.useEffect(() => {
    if (isOpen) {
      console.log('드롭다운 열림 - 최신 데이터 로드');
      // 드롭다운이 열릴 때마다 항상 최신 데이터 로드
      loadNotifications();
    }
  }, [isOpen]);

  // 알림 업데이트 시 목록 새로고침
  React.useEffect(() => {
    if (onNotificationUpdate !== undefined && onNotificationUpdate > 0) {
      loadNotifications();
    }
  }, [onNotificationUpdate]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('알림 목록 로드 시작');
      const data = await getNotifications();
      console.log('알림 목록 로드 완료:', data);
      // 백엔드에서 read로 오는 것을 isRead로 변환
      const normalizedData = (data || []).map(notification => ({
        ...notification,
        isRead: notification.read !== undefined ? notification.read : notification.isRead
      }));
      setNotifications(normalizedData);
    } catch (err) {
      setError(err.message || '알림을 불러오는 중 오류가 발생했습니다.');
      console.error('알림 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (notificationId, e) => {
    e.stopPropagation();
    
    // 로컬 상태 즉시 업데이트 (UI 반응성)
    setNotifications(prev =>
      prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
    );
    
    try {
      // API 호출
      await readNotification(notificationId);
      console.log('읽음 처리 API 호출 성공:', notificationId);
      
      // Header의 안읽은 알림 개수 업데이트
      if (onNotificationChange) {
        onNotificationChange();
      }
      
      // 서버에서 최신 데이터 즉시 다시 로드하여 동기화
      await loadNotifications();
    } catch (err) {
      console.error('알림 읽음 처리 오류:', err);
      // 에러 발생 시 서버에서 다시 로드하여 정확한 상태 확인
      await loadNotifications();
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      // Header의 안읽은 알림 개수 업데이트
      if (onNotificationChange) {
        onNotificationChange();
      }
    } catch (err) {
      console.error('알림 삭제 오류:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      // 로컬 상태 즉시 업데이트 (UI 반응성)
      setNotifications(prev =>
        prev.map(n => n.notificationId === notification.notificationId ? { ...n, isRead: true } : n)
      );
      
      try {
        // API 호출
        await readNotification(notification.notificationId);
        console.log('읽음 처리 API 호출 성공:', notification.notificationId);
        
        // Header의 안읽은 알림 개수 업데이트
        if (onNotificationChange) {
          onNotificationChange();
        }
        
        // 서버에서 최신 데이터 즉시 다시 로드하여 동기화
        await loadNotifications();
      } catch (err) {
        console.error('알림 읽음 처리 오류:', err);
        // 에러 발생 시 서버에서 다시 로드하여 정확한 상태 확인
        await loadNotifications();
      }
    }

    // 타입별 페이지 이동
    if (notification.type === 'NEW_CONTENT' && notification.targetId) {
      router.push(`/contents/${notification.targetId}`);
      onClose();
    } else if (notification.type === 'COMMENT' && notification.targetId) {
      router.push(`/contents/${notification.targetId}`);
      onClose();
    } else if (notification.type === 'EVENT' && notification.targetId) {
      // 이벤트 페이지로 이동 (나중에 구현)
      onClose();
    } else if (notification.type === 'NEWS_LETTER' && notification.targetId) {
      // 뉴스레터 페이지로 이동 (나중에 구현)
      onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_CONTENT':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'NEWS_LETTER':
        return <Mail className="w-5 h-5 text-purple-600" />;
      case 'EVENT':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'COMMENT':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'NEW_CONTENT':
        return '새로운 콘텐츠';
      case 'NEWS_LETTER':
        return '뉴스레터';
      case 'EVENT':
        return '이벤트';
      case 'COMMENT':
        return '댓글';
      default:
        return '알림';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">알림</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded m-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleRead(notification.notificationId, e)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="읽음 처리"
                          >
                            <Check className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.notificationId, e)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

