'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { StudentProfile, Team } from '../types';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

// Profile
export function useStudentProfile(courseId: string) {
  return useQuery({
    queryKey: ['student', 'profile', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<StudentProfile>>(`/api/student/profile?courseId=${courseId}`);
      if (!data.success) {
        throw new Error(data.error?.message || '프로필을 불러오는데 실패했습니다');
      }
      return data.data;
    },
    enabled: !!courseId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseId: string;
      name: string;
      email: string;
      major: string;
      gender: string;
      continent: string;
      role: string;
      skill: string;
      times: string[];
      goal: string;
    }) => {
      const { data } = await apiClient.put<ApiResponse<StudentProfile>>('/api/student/profile', input);
      if (!data.success) {
        throw new Error(data.error?.message || '프로필 저장에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', variables.courseId] });
    },
    onError: (error) => {
      console.error('Update profile error:', extractApiErrorMessage(error));
    },
  });
}

// Team
export function useStudentTeam(courseId: string) {
  return useQuery({
    queryKey: ['student', 'team', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{
        hasTeam: boolean;
        teamId?: string;
        courseId?: string;
        teamNumber?: number;
        memberCount?: number;
        topFactors?: string[];
        matchDescription?: string;
        members?: Array<{ studentId: string; studentNumber: string; name?: string; email?: string }>;
        createdAt?: string;
        courseStatus?: string;
        message?: string;
      }>>(`/api/student/team?courseId=${courseId}`);
      if (!data.success) {
        throw new Error(data.error?.message || '팀 정보를 불러오는데 실패했습니다');
      }
      
      // API 응답을 Team 타입으로 변환
      if (!data.data?.hasTeam || !data.data.teamId || !data.data.teamNumber) {
        throw new Error(data.data?.message || '팀 정보를 찾을 수 없습니다');
      }

      return {
        teamId: data.data.teamId,
        courseId: data.data.courseId || courseId,
        teamNumber: data.data.teamNumber,
        memberCount: data.data.memberCount || 0,
        topFactors: data.data.topFactors,
        members: data.data.members || [],
        createdAt: data.data.createdAt || new Date().toISOString(),
      } as Team;
    },
    enabled: !!courseId,
  });
}
