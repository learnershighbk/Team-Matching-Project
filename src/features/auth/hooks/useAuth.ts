'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage, isAxiosError } from '@/lib/remote/api-client';

// API Response Types
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

type AuthUser = {
  role: 'admin' | 'instructor' | 'student';
  email?: string;
  instructorId?: string;
  studentId?: string;
  courseId?: string;
  studentNumber?: string;
};

type AdminLoginData = { email: string; password: string };
type InstructorLoginData = { email: string; pin: string };
type StudentAuthData = {
  courseId: string;
  studentNumber: string;
  pin: string;
  isNewUser: boolean;
};

// useCurrentUser hook
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthUser | null>('/api/auth/me');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Admin Login
export function useAdminLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      try {
        const { data } = await apiClient.post<AuthUser | { error: { code: string; message: string } }>('/api/admin/login', credentials);
        
        // 에러 응답 확인
        if (data && 'error' in data) {
          throw new Error(data.error.message || '로그인에 실패했습니다');
        }
        
        // 성공 응답
        return data as AuthUser;
      } catch (error) {
        const message = extractApiErrorMessage(error, '로그인에 실패했습니다');
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/admin/dashboard');
    },
    onError: (error) => {
      console.error('Admin login error:', extractApiErrorMessage(error));
    },
  });
}

// Instructor Login
export function useInstructorLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: InstructorLoginData) => {
      try {
        const { data } = await apiClient.post<AuthUser | { error: { code: string; message: string } }>('/api/instructor/login', credentials);
        
        // 에러 응답 확인
        if (data && 'error' in data) {
          throw new Error(data.error.message || '로그인에 실패했습니다');
        }
        
        // 성공 응답
        return data as AuthUser;
      } catch (error) {
        const message = extractApiErrorMessage(error, '로그인에 실패했습니다');
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push('/instructor/dashboard');
    },
    onError: (error) => {
      console.error('Instructor login error:', extractApiErrorMessage(error));
    },
  });
}

// Student Auth
export function useStudentAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authData: StudentAuthData) => {
      try {
        const { data } = await apiClient.post<{
          studentId: string;
          studentNumber: string;
          profileCompleted: boolean;
          courseStatus: string;
        } | { error: { code: string; message: string } }>('/api/student/auth', authData);
        
        // 에러 응답 확인
        if (data && 'error' in data) {
          const apiError = new Error(data.error.message || '인증에 실패했습니다');
          (apiError as any).code = data.error.code;
          throw apiError;
        }
        
        // 성공 응답
        return data as {
          studentId: string;
          studentNumber: string;
          profileCompleted: boolean;
          courseStatus: string;
        };
      } catch (error) {
        // axios 에러인 경우 원본 에러 정보 유지
        if (isAxiosError(error)) {
          const payload = error.response?.data as { error?: { code?: string; message?: string } } | undefined;
          if (payload?.error) {
            const apiError = new Error(payload.error.message || extractApiErrorMessage(error, '인증에 실패했습니다'));
            (apiError as any).code = payload.error.code;
            throw apiError;
          }
        }
        
        const message = extractApiErrorMessage(error, '인증에 실패했습니다');
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      // 기본 onError는 콘솔에만 로그하고, 실제 에러 처리는 호출하는 컴포넌트에서 처리
      // (mutate 호출 시 onError를 제공하면 그쪽에서 처리됨)
      const errorMessage = extractApiErrorMessage(error);
      console.error('Student auth error:', errorMessage);
    },
  });
}

// Logout
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post<null>('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });
}
