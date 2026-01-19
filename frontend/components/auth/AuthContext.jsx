'use client';

import React from 'react';

const AuthContext = React.createContext({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
});

export function AuthProvider({ currentUser, loading, setCurrentUser, children }) {
  const value = React.useMemo(
    () => ({ currentUser, loading, setCurrentUser }),
    [currentUser, loading, setCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

