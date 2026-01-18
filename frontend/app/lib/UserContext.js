/**
 * 사용자 정보 Context
 * ClientLayout에서 관리하는 사용자 정보를 전역으로 제공
 */

'use client';

import React from 'react';

const UserContext = React.createContext({
  currentUser: null,
  loading: false,
  refreshUser: async () => {},
});

export function UserProvider({ children, currentUser, loading, refreshUser }) {
  return (
    <UserContext.Provider value={{ currentUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
