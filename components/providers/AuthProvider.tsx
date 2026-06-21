"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export const useAuth = () => useContext(AuthContext);

function checkRoutePermission(role: string, path: string): boolean {
  if (role === 'super_admin') return true;

  // Permitted pages and prefix paths
  const accountantRoutes = ['/dashboard', '/invoices', '/designer', '/clients', '/reports'];
  const hrRoutes = ['/dashboard', '/employees', '/payroll', '/salary-slips', '/reports'];
  const employeeRoutes = ['/salary-slips', '/profile'];

  if (role === 'accountant') {
    return accountantRoutes.some(r => path === r || path.startsWith(r + '/'));
  }
  if (role === 'hr_manager' || role === 'hr') {
    return hrRoutes.some(r => path === r || path.startsWith(r + '/'));
  }
  if (role === 'employee') {
    return employeeRoutes.some(r => path === r || path.startsWith(r + '/'));
  }

  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          setRole((idTokenResult.claims.role as string) || 'employee');
        } catch (err) {
          console.error("Error fetching token claims:", err);
          setRole('employee');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Enforce role-based routing gates
  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!pathname.startsWith('/login') && !pathname.startsWith('/share')) {
        router.push('/login');
      }
    } else {
      const activeRole = role || 'employee';
      if (pathname.startsWith('/login')) {
        if (activeRole === 'employee') {
          router.push('/salary-slips');
        } else {
          router.push('/dashboard');
        }
      } else {
        const isAllowed = checkRoutePermission(activeRole, pathname);
        if (!isAllowed && !pathname.startsWith('/share')) {
          if (activeRole === 'employee') {
            router.push('/salary-slips');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [user, role, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {/* Always render children so the component tree (and hook counts) stay
          stable between renders. Use opacity instead of visibility so the browser
          still computes real layout dimensions (ResizeObserver reads 0 for
          visibility:hidden elements, causing Recharts -1 errors). */}
      <div
        style={{
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? 'none' : 'auto',
          transition: 'opacity 0.15s ease',
        }}
        aria-hidden={loading}
      >
        {children}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FB]">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="12" fill="#8A4FFF"/>
                <path d="M12 28C12 28 16 12 28 12" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="28" cy="28" r="4" fill="white"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
              <span className="text-3xl font-extrabold tracking-tight text-[#1C1C2E]" style={{ fontFamily: 'var(--font-nunito)' }}>Rolled</span>
            </div>
            {/* Spinner */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 tracking-wide">Authenticating…</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
