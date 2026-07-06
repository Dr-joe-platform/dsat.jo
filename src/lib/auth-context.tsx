'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { useRouter } from 'next/navigation';
import { linkStudentToTeacherByCode } from './db';

// ─── Types ──────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  parentPhone?: string;
  teacherCode?: string;
  photoURL?: string;
  createdAt?: unknown;
  subject?: 'english' | 'math' | 'both'; // Used by students
  planId?: string; // Subscription plan ID
  planName?: string; // Subscription plan name
  teacherSubject?: 'English' | 'Math' | 'Both';
  allowedTests?: string[];
  lastActiveDate?: string;
  teacherCodes?: string[]; // Array of teacher codes for students
}

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    extra?: Partial<AppUser>
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ── Listen to Firebase auth state ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = snap.data() as Omit<AppUser, 'uid'>;
            setAppUser({ uid: user.uid, ...data } as AppUser);
            // Update last active
            const now = new Date().toISOString();
            if (data.lastActiveDate !== now.split('T')[0]) {
              await setDoc(doc(db, 'users', user.uid), { lastActiveDate: now.split('T')[0] }, { merge: true });
            }
          } else {
            // User exists in Auth but not in Firestore — set minimal profile
            setAppUser({
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? '',
              role: 'student',
              status: 'approved',
            });
          }
        } catch (err) {
          console.error("onAuthStateChanged ERROR:", err);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const data = snap.exists() ? (snap.data() as Omit<AppUser, 'uid'>) : null;

      if (!data) throw new Error('User profile not found. Contact support.');
      if (data.status === 'rejected') throw new Error('Your account has been rejected. Contact your teacher.');
      // Pending users can log in to Trial Mode

      setAppUser({ uid: cred.user.uid, ...data } as AppUser);
      
      // Route based on role
      if (data.role === 'admin' || data.role === 'super_admin') {
        router.push('/admin');
      } else if (data.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(
        msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')
          ? 'Incorrect email or password.'
          : msg
      );
      setLoading(false);
    }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    extra: Partial<AppUser> = {}
  ) => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      const isTeacher = role === 'teacher';

      if (isTeacher) {
        extra.teacherCode = 'TCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      const userData: Omit<AppUser, 'uid'> = {
        email,
        displayName,
        role,
        // Teachers/Admins are pending approval; self-registered students also pending
        status: 'pending',
        createdAt: serverTimestamp(),
        ...extra,
      };

      await setDoc(doc(db, 'users', cred.user.uid), userData);

      // If student provided a teacher code, link them
      if (role === 'student' && extra.teacherCode) {
        await linkStudentToTeacherByCode(cred.user.uid, extra.subject || 'Both', extra.teacherCode);
      }

      setAppUser({ uid: cred.user.uid, ...userData } as AppUser);
      setLoading(false);
      router.push('/dashboard?status=pending');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed.';
      setError(
        msg.includes('email-already-in-use')
          ? 'This email is already registered.'
          : msg
      );
      setLoading(false);
    }
  };

  // ── Google Auth ────────────────────────────────────────────────────────────
  const loginWithGoogle = async (role: UserRole = 'student') => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!snap.exists()) {
        const userData: Omit<AppUser, 'uid'> = {
          email: cred.user.email ?? '',
          displayName: cred.user.displayName ?? 'User',
          role,
          status: 'pending',
          createdAt: serverTimestamp(),
          photoURL: cred.user.photoURL ?? '',
        };
        await setDoc(doc(db, 'users', cred.user.uid), userData);
        setAppUser({ uid: cred.user.uid, ...userData } as AppUser);
        router.push('/dashboard?status=pending');
      } else {
        const data = snap.data() as Omit<AppUser, 'uid'>;
        if (data.status === 'rejected') throw new Error('Your account has been rejected.');
        // Pending users can log in to Trial Mode
        
        setAppUser({ uid: cred.user.uid, ...data } as AppUser);
        
        if (data.role === 'admin' || data.role === 'super_admin') router.push('/admin');
        else if (data.role === 'teacher') router.push('/teacher');
        else router.push('/dashboard');
      }
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setAppUser(null);
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    firebaseUser,
    appUser,
    loading,
    error,
    login,
    logout,
    signup,
    resetPassword,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
