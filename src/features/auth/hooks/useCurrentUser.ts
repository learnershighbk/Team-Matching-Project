/**
 * @deprecated 이 훅은 템플릿 잔재입니다.
 * 대신 @/lib/auth/auth-context의 useAuth를 사용하세요.
 */
"use client";

import { useAuth } from "@/lib/auth/auth-context";

/**
 * @deprecated useAuth()를 사용하세요.
 */
export const useCurrentUser = () => {
  console.warn(
    "[DEPRECATED] useCurrentUser는 더 이상 사용되지 않습니다. " +
    "@/lib/auth/auth-context의 useAuth를 사용하세요."
  );

  const auth = useAuth();

  return {
    user: auth.user,
    status: auth.status,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    refresh: auth.refresh,
  };
};
