'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CourseStatus } from '../types';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

// Course Status (Public)
export function useCourseStatus(uuid: string) {
  return useQuery({
    queryKey: ['course', 'status', uuid],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<CourseStatus>>(`/api/course/${uuid}/status`);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 정보를 불러오는데 실패했습니다');
      }
      return data.data;
    },
    enabled: !!uuid,
  });
}

// Check if student exists (for determining new user)
export function useCheckStudent(courseId: string, studentNumber: string) {
  return useQuery({
    queryKey: ['course', 'check-student', courseId, studentNumber],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ exists: boolean }>>(
        `/api/course/${courseId}/check-student?studentNumber=${studentNumber}`
      );
      if (!data.success) {
        throw new Error(data.error?.message || '학생 확인에 실패했습니다');
      }
      return data.data;
    },
    enabled: !!courseId && !!studentNumber && studentNumber.length === 9,
  });
}
