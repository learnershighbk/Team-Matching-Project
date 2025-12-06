'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Instructor, Course, Student } from '../types';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

// Instructors
export function useInstructors() {
  return useQuery({
    queryKey: ['admin', 'instructors'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Instructor[]>>('/api/admin/instructors');
      if (!data.success) {
        throw new Error(data.error?.message || '교수자 목록을 불러오는데 실패했습니다');
      }
      return data.data || [];
    },
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; pin: string; name: string }) => {
      const { data } = await apiClient.post<ApiResponse<Instructor>>('/api/admin/instructors', input);
      if (!data.success) {
        throw new Error(data.error?.message || '교수자 생성에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'instructors'] });
    },
    onError: (error) => {
      console.error('Create instructor error:', extractApiErrorMessage(error));
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; email?: string; pin?: string; name?: string }) => {
      const { data } = await apiClient.put<ApiResponse<Instructor>>(`/api/admin/instructors/${id}`, input);
      if (!data.success) {
        throw new Error(data.error?.message || '교수자 수정에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'instructors'] });
    },
    onError: (error) => {
      console.error('Update instructor error:', extractApiErrorMessage(error));
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/api/admin/instructors/${id}`);
      if (!data.success) {
        throw new Error(data.error?.message || '교수자 삭제에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'instructors'] });
    },
    onError: (error) => {
      console.error('Delete instructor error:', extractApiErrorMessage(error));
    },
  });
}

// Courses
export function useAdminCourses() {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ courses: Course[]; pagination: { page: number; limit: number; total: number } }>>('/api/admin/courses');
      if (!data.success) {
        throw new Error(data.error?.message || '코스 목록을 불러오는데 실패했습니다');
      }
      return data.data?.courses || [];
    },
  });
}

export function useUpdateCourseDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, deadline }: { id: string; deadline: string }) => {
      const { data } = await apiClient.put<ApiResponse<Course>>(`/api/admin/courses/${id}/deadline`, { deadline });
      if (!data.success) {
        throw new Error(data.error?.message || '마감일 변경에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: (error) => {
      console.error('Update deadline error:', extractApiErrorMessage(error));
    },
  });
}

export function useUnconfirmCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await apiClient.post<ApiResponse<{ courseId: string; status: string }>>(
        `/api/admin/courses/${courseId}/unconfirm`
      );
      if (!data.success) {
        throw new Error(data.error?.message || '팀 확정 상태 되돌리기에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
    onError: (error) => {
      console.error('Unconfirm course error:', extractApiErrorMessage(error));
    },
  });
}

// Students
export function useAdminStudents(courseId?: string) {
  return useQuery({
    queryKey: ['admin', 'students', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/admin/students?courseId=${courseId}` : '/api/admin/students';
      const { data } = await apiClient.get<ApiResponse<Student[]>>(url);
      if (!data.success) {
        throw new Error(data.error?.message || '학생 목록을 불러오는데 실패했습니다');
      }
      return data.data || [];
    },
    enabled: true,
  });
}

export function useResetStudentPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pin }: { id: string; pin: string }) => {
      const { data } = await apiClient.put<ApiResponse<null>>(`/api/admin/students/${id}/reset-pin`, { pin });
      if (!data.success) {
        throw new Error(data.error?.message || 'PIN 리셋에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
    onError: (error) => {
      console.error('Reset PIN error:', extractApiErrorMessage(error));
    },
  });
}
