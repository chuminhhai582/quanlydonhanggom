'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  adminName: string;
  adminAvatar: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
  adminName: '',
  adminAvatar: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [adminName, setAdminName] = useState('');
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check Supabase session (Google login)
    const checkSupabaseSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const user = session.user;
          setRoleState('admin');
          setAdminName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin');
          setAdminAvatar(user.user_metadata?.avatar_url || null);
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_name', user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin');
          return; // Đã đăng nhập qua Supabase
        }
      } catch {
        // Supabase chưa cấu hình → check localStorage
      }

      // 2. Fallback: check localStorage (mock auth)
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const viewerValidUntil = localStorage.getItem('viewer_pin_valid_until');

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
    };

    checkSupabaseSession();

    // Listen for auth state changes (Google login redirect)
    try {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setRoleState('admin');
          setAdminName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin');
          setAdminAvatar(session.user.user_metadata?.avatar_url || null);
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_name', session.user.user_metadata?.full_name || 'Admin');
        } else if (event === 'SIGNED_OUT') {
          setRoleState(null);
          setAdminName('');
          setAdminAvatar(null);
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_name');
        }
      });

      return () => subscription.unsubscribe();
    } catch {
      // Supabase chưa cấu hình → bỏ qua listener
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'admin') {
      setAdminName(localStorage.getItem('admin_name') || 'Admin');
    }
  };

  const logout = async () => {
    // Logout Supabase session
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase chưa cấu hình → bỏ qua
    }

    // Clear localStorage
    if (role === 'admin') {
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_name');
      localStorage.removeItem('admin_email');
    } else {
      localStorage.removeItem('viewer_pin_valid_until');
      localStorage.removeItem('viewer_token');
    }
    setRoleState(null);
    setAdminName('');
    setAdminAvatar(null);
    window.location.href = '/nhap-ma';
  };

  return (
    <AuthContext.Provider value={{ role, setRole, adminName, adminAvatar, logout }}>
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
