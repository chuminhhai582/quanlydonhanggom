'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/lib/types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  adminName: string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
  adminName: '',
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    // Check localStorage for existing auth
    const viewerValidUntil = localStorage.getItem('viewer_pin_valid_until');
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    
    if (adminLoggedIn) {
      setRoleState('admin');
      setAdminName(localStorage.getItem('admin_name') || 'Admin');
    } else if (viewerValidUntil) {
      const validUntil = new Date(viewerValidUntil);
      if (validUntil > new Date()) {
        setRoleState('viewer');
      } else {
        localStorage.removeItem('viewer_pin_valid_until');
        localStorage.removeItem('viewer_token');
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      setAdminName(localStorage.getItem('admin_name') || 'Admin');
    }
  };

  const logout = () => {
    if (role === 'admin') {
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_name');
    } else {
      localStorage.removeItem('viewer_pin_valid_until');
      localStorage.removeItem('viewer_token');
    }
    setRoleState(null);
    setAdminName('');
    window.location.href = '/nhap-ma';
  };

  return (
    <AuthContext.Provider value={{ role, setRole, adminName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRole(): UserRole {
  const { role } = useAuth();
  return role;
}
