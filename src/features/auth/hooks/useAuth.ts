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
      const { data } = await apiClient.get<ApiResponse<AuthUser | null>>('/api/auth/me');
      return data.data;
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
      const { data } = await apiClient.post<ApiResponse<AuthUser>>('/api/admin/login', credentials);
      if (!data.success) {
        throw new Error(data.error?.message || '로그인에 실패했습니다');
      }
      return data.data;
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
      const { data } = await apiClient.post<ApiResponse<AuthUser>>('/api/instructor/login', credentials);
      if (!data.success) {
        throw new Error(data.error?.message || '로그인에 실패했습니다');
      }
      return data.data;
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
      const { data } = await apiClient.post<ApiResponse<{
        studentId: string;
        studentNumber: string;
        profileCompleted: boolean;
        courseStatus: string;
      }>>('/api/student/auth', authData);
      if (!data.success) {
        throw new Error(data.error?.message || '인증에 실패했습니다');
      }
      return data.data;
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
      const { data } = await apiClient.post<ApiResponse<null>>('/api/auth/logout');
      return data;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
    },
  });
}
