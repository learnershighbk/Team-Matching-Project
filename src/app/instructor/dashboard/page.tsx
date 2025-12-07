'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useInstructorCourses,
  useCreateCourse,
} from '@/features/instructor/hooks/useInstructor';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Course } from '@/features/instructor/types';

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const { data: courses, isLoading } = useInstructorCourses();
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseCode: '',
    teamSize: 4,
    weightProfile: 'balanced',
    deadline: '',
  });

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push('/instructor');
      },
    });
  };

  const handleCreateCourse = () => {
    if (!newCourse.courseName || !newCourse.courseCode || !newCourse.deadline) {
      toast({ title: '오류', description: '모든 필드를 입력해주세요', variant: 'destructive' });
      return;
    }

    createCourse(
      {
        ...newCourse,
        deadline: new Date(newCourse.deadline).toISOString(),
      },
      {
        onSuccess: (data) => {
          toast({ title: '성공', description: '코스가 생성되었습니다' });
          setIsDialogOpen(false);
          setNewCourse({
            courseName: '',
            courseCode: '',
            teamSize: 4,
            weightProfile: 'balanced',
            deadline: '',
          });
          if (data?.courseId) {
            router.push(`/instructor/courses/${data.courseId}`);
          }
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-green-500">입력 가능</Badge>;
      case 'LOCKED':
        return <Badge className="bg-yellow-500">마감됨</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-500">팀 확정</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Group courses by status
  const openCourses = courses?.filter((c: Course) => c.status === 'OPEN') || [];
  const lockedCourses = courses?.filter((c: Course) => c.status === 'LOCKED') || [];
  const confirmedCourses = courses?.filter((c: Course) => c.status === 'CONFIRMED') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">TeamMatch Instructor</h1>
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">내 코스</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>+ 새 코스 생성</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 코스 생성</DialogTitle>
                <DialogDescription>코스 정보를 입력하세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">코스명</Label>
                  <Input
                    id="courseName"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                    placeholder="예: AI 프로젝트 실습"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode">코스 코드</Label>
                  <Input
                    id="courseCode"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    placeholder="예: AI101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize">팀 인원수</Label>
                  <Select
                    value={newCourse.teamSize.toString()}
                    onValueChange={(value) =>
                      setNewCourse({ ...newCourse, teamSize: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="팀 인원수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3명</SelectItem>
                      <SelectItem value="4">4명</SelectItem>
                      <SelectItem value="5">5명</SelectItem>
                      <SelectItem value="6">6명</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightProfile">가중치 프로파일</Label>
                  <Select
                    value={newCourse.weightProfile}
                    onValueChange={(value) => setNewCourse({ ...newCourse, weightProfile: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="가중치 프로파일 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (균형)</SelectItem>
                      <SelectItem value="skill_heavy">Skill-heavy (역량 중심)</SelectItem>
                      <SelectItem value="skill_role_focused">Skill-Role-Focused (역량+역할)</SelectItem>
                      <SelectItem value="diversity_heavy">Diversity-heavy (다양성 중심)</SelectItem>
                      <SelectItem value="time_heavy">Time-heavy (시간 중심)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">프로필 입력 마감일</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newCourse.deadline}
                    onChange={(e) => setNewCourse({ ...newCourse, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateCourse} disabled={isCreating}>
                  {isCreating ? '생성 중...' : '생성'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">코스 목록을 불러오는 중...</p>
          </div>
        ) : courses?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">아직 생성된 코스가 없습니다</p>
              <Button onClick={() => setIsDialogOpen(true)}>첫 코스 생성하기</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Open Courses */}
            {openCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  입력 가능 ({openCourses.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {openCourses.map((course: Course) => (
                    <CourseCard
                      key={course.courseId}
                      course={course}
                      getStatusBadge={getStatusBadge}
                      getDaysRemaining={getDaysRemaining}
                      onClick={() => router.push(`/instructor/courses/${course.courseId}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Courses */}
            {lockedCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  마감됨 - 매칭 대기 ({lockedCourses.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lockedCourses.map((course: Course) => (
                    <CourseCard
                      key={course.courseId}
                      course={course}
                      getStatusBadge={getStatusBadge}
                      getDaysRemaining={getDaysRemaining}
                      onClick={() => router.push(`/instructor/courses/${course.courseId}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Courses */}
            {confirmedCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  팀 확정 완료 ({confirmedCourses.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {confirmedCourses.map((course: Course) => (
                    <CourseCard
                      key={course.courseId}
                      course={course}
                      getStatusBadge={getStatusBadge}
                      getDaysRemaining={getDaysRemaining}
                      onClick={() => router.push(`/instructor/courses/${course.courseId}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function CourseCard({
  course,
  getStatusBadge,
  getDaysRemaining,
  onClick,
}: {
  course: Course;
  getStatusBadge: (status: string) => React.ReactNode;
  getDaysRemaining: (deadline: string) => number;
  onClick: () => void;
}) {
  const daysRemaining = getDaysRemaining(course.deadline);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {getStatusBadge(course.status)}
          {course.status === 'OPEN' && daysRemaining > 0 && (
            <span className="text-sm font-medium text-orange-600">D-{daysRemaining}</span>
          )}
        </div>
        <CardTitle className="text-lg">{course.courseName}</CardTitle>
        <CardDescription>{course.courseCode}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>팀 크기: {course.teamSize}명</p>
          <p>
            마감일:{' '}
            {new Date(course.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          상세 보기
        </Button>
      </CardContent>
    </Card>
  );
}

