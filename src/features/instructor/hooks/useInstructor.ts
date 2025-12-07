'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Course, StudentStatus, Team, MatchingPreview } from '../types';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

// Courses
export function useInstructorCourses() {
  return useQuery({
    queryKey: ['instructor', 'courses'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ApiResponse<Course[]>>('/api/instructor/courses');
        if (!data.success) {
          console.error('Failed to fetch courses:', data.error);
          throw new Error(data.error?.message || '코스 목록을 불러오는데 실패했습니다');
        }
        console.log('Fetched courses:', data.data);
        return data.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    },
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Course>>(`/api/instructor/courses/${courseId}`);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 정보를 불러오는데 실패했습니다');
      }
      return data.data;
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      courseName: string;
      courseCode: string;
      teamSize: number;
      weightProfile: string;
      deadline: string;
    }) => {
      const { data } = await apiClient.post<ApiResponse<Course>>('/api/instructor/courses', input);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 생성에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
    onError: (error) => {
      console.error('Create course error:', extractApiErrorMessage(error));
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      courseName?: string;
      courseCode?: string;
      teamSize?: number;
      weightProfile?: string;
      deadline?: string;
    }) => {
      const { data } = await apiClient.put<ApiResponse<Course>>(`/api/instructor/courses/${id}`, input);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 수정에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.id] });
    },
    onError: (error) => {
      console.error('Update course error:', extractApiErrorMessage(error));
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/api/instructor/courses/${id}`);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 삭제에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
    },
    onError: (error) => {
      console.error('Delete course error:', extractApiErrorMessage(error));
    },
  });
}

// Students
export function useCourseStudents(courseId: string) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'students'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ total: number; completed: number; students: StudentStatus[] }>>(`/api/instructor/courses/${courseId}/students`);
      if (!data.success) {
        throw new Error(data.error?.message || '학생 목록을 불러오는데 실패했습니다');
      }
      // API returns { total, completed, students }, but we only need the students array
      return Array.isArray(data.data?.students) ? data.data.students : [];
    },
    enabled: !!courseId,
  });
}

// Course Lock
export function useLockCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await apiClient.post<ApiResponse<Course>>(`/api/instructor/courses/${courseId}/lock`);
      if (!data.success) {
        throw new Error(data.error?.message || '코스 잠금에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', courseId] });
    },
    onError: (error) => {
      console.error('Lock course error:', extractApiErrorMessage(error));
    },
  });
}

// Matching
export function useRunMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, weightProfile }: { courseId: string; weightProfile?: string }) => {
      const { data } = await apiClient.post<ApiResponse<MatchingPreview>>(
        `/api/instructor/courses/${courseId}/match`,
        weightProfile ? { weightProfile } : {}
      );
      if (!data.success) {
        throw new Error(data.error?.message || '매칭 실행에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId] });
    },
    onError: (error) => {
      console.error('Run matching error:', extractApiErrorMessage(error));
    },
  });
}

export function useConfirmTeams() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, teams }: { courseId: string; teams: Team[] }) => {
      const { data } = await apiClient.post<ApiResponse<{ courseId: string; status: string; teamCount: number }>>(
        `/api/instructor/courses/${courseId}/confirm`,
        {
          teams: teams.map((team) => ({
            teamNumber: team.teamNumber,
            memberCount: team.memberCount,
            scoreTotal: team.scoreTotal || 0,
            scoreBreakdown: team.scoreBreakdown || {
              time: 0,
              skill: 0,
              role: 0,
              major: 0,
              goal: 0,
              continent: 0,
              gender: 0,
            },
            topFactors: team.topFactors || [],
            members: team.members.map((member) => ({
              studentId: member.studentId,
              studentNumber: member.studentNumber,
              name: member.name,
              email: member.email,
              major: member.major,
            })),
          })),
        }
      );
      if (!data.success) {
        throw new Error(data.error?.message || '팀 확정에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId, 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId, 'students'] });
    },
    onError: (error) => {
      console.error('Confirm teams error:', extractApiErrorMessage(error));
    },
  });
}

// Teams
export function useCourseTeams(courseId: string) {
  return useQuery({
    queryKey: ['instructor', 'courses', courseId, 'teams'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Team[]>>(`/api/instructor/courses/${courseId}/teams`);
      if (!data.success) {
        throw new Error(data.error?.message || '팀 목록을 불러오는데 실패했습니다');
      }
      return data.data || [];
    },
    enabled: !!courseId,
  });
}

// CSV Upload
export function useUploadStudentsCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, file }: { courseId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      // FormData를 전송할 때는 Content-Type을 삭제해야 axios가 자동으로 multipart/form-data와 boundary를 설정함
      const { data } = await apiClient.post<ApiResponse<{ total: number; created: number; updated: number; errors: number }>>(
        `/api/instructor/courses/${courseId}/students/upload`,
        formData,
        {
          headers: {
            'Content-Type': undefined as any, // FormData일 때 axios가 자동으로 설정
          },
        }
      );
      if (!data.success) {
        throw new Error(data.error?.message || 'CSV 업로드에 실패했습니다');
      }
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId, 'students'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', 'courses', variables.courseId] });
    },
    onError: (error) => {
      console.error('Upload CSV error:', extractApiErrorMessage(error));
    },
  });
}
