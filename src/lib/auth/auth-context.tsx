"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type CurrentUser } from "./api-client";

/**
 * TeamMatch 인증 컨텍스트
 *
 * 자체 JWT 기반 인증 상태 관리
 * - Admin: 환경변수 이메일/비밀번호
 * - Instructor: 이메일 + 4자리 PIN
 * - Student: 9자리 학번 + 4자리 PIN
 */

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: CurrentUser;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: CurrentUser;
};

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser>(initialUser);
  const [status, setStatus] = useState<AuthStatus>(
    initialUser ? "authenticated" : "loading"
  );

  const refresh = useCallback(async () => {
    setStatus("loading");
    const result = await authApi.getCurrentUser();

    if (result.success && result.data) {
      setUser(result.data);
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    if (!initialUser) {
      refresh();
    }
  }, [initialUser, refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
      refresh,
      logout,
    }),
    [user, status, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }

  return context;
}

// 역할별 훅
export function useAdminAuth() {
  const auth = useAuth();
  const user = auth.user;
  const isAdmin = user?.role === "admin";

  return {
    ...auth,
    isAdmin,
    adminEmail: user?.role === "admin" ? user.email : null,
  };
}

export function useInstructorAuth() {
  const auth = useAuth();
  const user = auth.user;
  const isInstructor = user?.role === "instructor";

  return {
    ...auth,
    isInstructor,
    instructorId: user?.role === "instructor" ? user.instructorId : null,
    email: user?.role === "instructor" ? user.email : null,
  };
}

export function useStudentAuth() {
  const auth = useAuth();
  const user = auth.user;
  const isStudent = user?.role === "student";

  return {
    ...auth,
    isStudent,
    studentId: user?.role === "student" ? user.studentId : null,
    courseId: user?.role === "student" ? user.courseId : null,
    studentNumber: user?.role === "student" ? user.studentNumber : null,
  };
}
