'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourseStatus } from '@/features/course/hooks/useCourse';
import { useEffect } from 'react';

export default function WaitingPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { data: course, isLoading, refetch } = useCourseStatus(uuid);

  // Poll for status changes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Redirect if status changed to CONFIRMED
  useEffect(() => {
    if (course?.status === 'CONFIRMED') {
      router.push(`/course/${uuid}/team`);
    }
  }, [course?.status, router, uuid]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">코스를 찾을 수 없습니다</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-4">⏰</div>
          <CardTitle>{course.courseName}</CardTitle>
          <CardDescription>프로필 입력 기간이 종료되었습니다</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="p-4 bg-muted rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">마감일</p>
            <p className="font-medium">
              {new Date(course.deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <p className="text-muted-foreground mb-6">
            교수자가 팀 매칭을 진행하고 있습니다.
            <br />
            매칭 결과가 나오면 이 페이지에서 확인하실 수 있습니다.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
            자동으로 업데이트 확인 중...
          </div>

          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push(`/course/${uuid}`)}
          >
            코스 페이지로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
