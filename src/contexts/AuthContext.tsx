import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../lib/supabase';
import { mockCurrentUser, mockCurrentTeacher } from '../lib/mockData';

type User = {
  id: string;
  email: string;
};

type Session = {
  user: User;
};

type AuthError = {
  message: string;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: 'student' | 'teacher';
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, role: 'student' | 'teacher') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const refreshProfile = async () => {
    setProfile(mockCurrentUser);
  };

  useEffect(() => {
    const initAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUser: User = {
        id: mockCurrentUser.id,
        email: mockCurrentUser.email,
      };

      const mockSession: Session = {
        user: mockUser,
      };

      setUser(mockUser);
      setProfile(mockCurrentUser);
      setSession(mockSession);
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userRole: 'student' | 'teacher') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseProfile = userRole === 'teacher' ? mockCurrentTeacher : mockCurrentUser;
    const mockUser: User = {
      id: baseProfile.id,
      email: email,
    };

    const mockSession: Session = {
      user: mockUser,
    };

    setUser(mockUser);
    setProfile({ ...baseProfile, email, full_name: fullName });
    setSession(mockSession);
    setRole(userRole);

    return { error: null };
  };

  const signIn = async (email: string, password: string, userRole: 'student' | 'teacher') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseProfile = userRole === 'teacher' ? mockCurrentTeacher : mockCurrentUser;
    const mockUser: User = {
      id: baseProfile.id,
      email: email,
    };

    const mockSession: Session = {
      user: mockUser,
    };

    setUser(mockUser);
    setProfile(baseProfile);
    setSession(mockSession);
    setRole(userRole);

    return { error: null };
  };

  const signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setProfile(null);
    setSession(null);
    setRole('student');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    role,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
