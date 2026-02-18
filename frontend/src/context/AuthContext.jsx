import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const storageKeys = ['token', 'role', 'username', 'email', 'kycCompleted'];

  const persistUser = (userData) => {
    localStorage.setItem('token', userData.token || '');
    localStorage.setItem('role', userData.role || '');
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('kycCompleted', String(Boolean(userData.kycCompleted)));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const kycCompleted = localStorage.getItem('kycCompleted') === 'true';

    if (token) {
      setUser({ token, role, username, email, kycCompleted });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    persistUser(userData);
    setUser(userData);
  };

  const updateUser = (partialUserData) => {
    setUser((prev) => {
      const next = { ...prev, ...partialUserData };
      persistUser(next);
      return next;
    });
  };

  const logout = () => {
    storageKeys.forEach((key) => localStorage.removeItem(key));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
