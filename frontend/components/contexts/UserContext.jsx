'use client';

import React from 'react';
import { getMyInfo, logout } from '@/app/lib/api';

// UserContext 생성
const UserContext = React.createContext({
  currentUser: null,
  loading: true,
  refreshUser: async () => {},
  handleLogout: async () => {},
});

/**
 * UserContext Provider
 * 전역에서 currentUser 상태를 관리합니다.
 */
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // 사용자 정보 로드 함수
  const loadUser = React.useCallback(async () => {
    try {
      const user = await getMyInfo();
      setCurrentUser(user);
      return user;
    } catch (error) {
      // 인증되지 않은 사용자 또는 서버 오류
      console.log('사용자 정보 로드 실패:', error.message);
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드 (마운트 시 한 번만)
  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 사용자 정보 새로고침 함수
  const refreshUser = React.useCallback(async () => {
    setLoading(true);
    return await loadUser();
  }, [loadUser]);

  // 로그아웃 처리
  const handleLogout = React.useCallback(async () => {
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
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      loading,
      refreshUser,
      handleLogout,
    }),
    [currentUser, loading, refreshUser, handleLogout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * useUser Hook
 * UserContext의 값을 쉽게 사용할 수 있는 커스텀 훅입니다.
 */
export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}