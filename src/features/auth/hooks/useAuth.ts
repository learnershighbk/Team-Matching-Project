'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

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
          throw new Error(data.error.message || '인증에 실패했습니다');
        }
        
        // 성공 응답
        return data as {
          studentId: string;
          studentNumber: string;
          profileCompleted: boolean;
          courseStatus: string;
        };
      } catch (error) {
        const message = extractApiErrorMessage(error, '인증에 실패했습니다');
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error('Student auth error:', extractApiErrorMessage(error));
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
