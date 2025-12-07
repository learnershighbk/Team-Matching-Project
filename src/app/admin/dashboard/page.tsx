'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  useInstructors,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
  useAdminCourses,
  useUpdateCourseDeadline,
  useUnconfirmCourse,
  useAdminStudents,
  useResetStudentPin,
} from '@/features/admin/hooks/useAdmin';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Instructor, Course, Student } from '@/features/admin/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push('/admin');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">TeamMatch Admin</h1>
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="instructors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="instructors">교수자 관리</TabsTrigger>
            <TabsTrigger value="courses">코스 현황</TabsTrigger>
            <TabsTrigger value="students">학생 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="instructors">
            <InstructorManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Instructor Management Component
function InstructorManagement() {
  const { data: instructors, isLoading } = useInstructors();
  const { mutate: createInstructor, isPending: isCreating } = useCreateInstructor();
  const { mutate: deleteInstructor } = useDeleteInstructor();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInstructor, setNewInstructor] = useState({ email: '', name: '', pin: '' });

  const handleCreate = () => {
    if (!newInstructor.email || !newInstructor.name || newInstructor.pin.length !== 4) {
      toast({ title: '오류', description: '모든 필드를 올바르게 입력해주세요', variant: 'destructive' });
      return;
    }

    createInstructor(newInstructor, {
      onSuccess: () => {
        toast({ title: '성공', description: '교수자가 추가되었습니다' });
        setIsDialogOpen(false);
        setNewInstructor({ email: '', name: '', pin: '' });
      },
      onError: (error) => {
        toast({ title: '오류', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteInstructor(id, {
        onSuccess: () => {
          toast({ title: '성공', description: '교수자가 삭제되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>교수자 관리</CardTitle>
          <CardDescription>교수자를 추가, 수정, 삭제합니다</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ 교수자 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 교수자 추가</DialogTitle>
              <DialogDescription>교수자 정보를 입력하세요</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  placeholder="instructor@kdischool.ac.kr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN (4자리)</Label>
                <Input
                  id="pin"
                  type="text"
                  maxLength={4}
                  value={newInstructor.pin}
                  onChange={(e) =>
                    setNewInstructor({
                      ...newInstructor,
                      pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                    })
                  }
                  placeholder="0000"
                  className="text-center tracking-widest"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? '추가 중...' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>코스 수</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  등록된 교수자가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              instructors?.map((instructor: Instructor) => (
                <TableRow key={instructor.instructorId}>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>{instructor.courseCount || 0}</TableCell>
                  <TableCell>
                    {new Date(instructor.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(instructor.instructorId)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Course Management Component
function CourseManagement() {
  const { data: courses, isLoading } = useAdminCourses();
  const { mutate: updateDeadline } = useUpdateCourseDeadline();
  const { mutate: unconfirmCourse, isPending: isUnconfirming } = useUnconfirmCourse();
  const [filter, setFilter] = useState<string>('all');

  const filteredCourses = courses?.filter((course: Course) => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const handleDeadlineChange = (courseId: string, newDeadline: string) => {
    updateDeadline(
      { id: courseId, deadline: newDeadline },
      {
        onSuccess: () => {
          toast({ title: '성공', description: '마감일이 변경되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleUnconfirm = (courseId: string, courseName: string) => {
    if (!confirm(`"${courseName}"의 팀 확정 상태를 되돌리시겠습니까?\n\n이 작업은 다음을 수행합니다:\n- 모든 팀 삭제\n- 학생들의 팀 배정 초기화\n- 코스 상태를 LOCKED로 변경\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    unconfirmCourse(courseId, {
      onSuccess: () => {
        toast({ title: '성공', description: '팀 확정 상태가 되돌려졌습니다' });
      },
      onError: (error) => {
        toast({ title: '오류', description: error.message, variant: 'destructive' });
      },
    });
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

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>코스 현황</CardTitle>
            <CardDescription>전체 코스 목록과 상태를 확인합니다</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'OPEN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('OPEN')}
            >
              입력 가능
            </Button>
            <Button
              variant={filter === 'LOCKED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('LOCKED')}
            >
              마감됨
            </Button>
            <Button
              variant={filter === 'CONFIRMED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('CONFIRMED')}
            >
              팀 확정
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>코스명</TableHead>
              <TableHead>코드</TableHead>
              <TableHead>교수자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>마감일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  코스가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses?.map((course: Course) => (
                <TableRow key={course.courseId}>
                  <TableCell className="font-medium">{course.courseName}</TableCell>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.instructorName || '-'}</TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell>
                    {new Date(course.deadline).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            마감일 변경
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>마감일 변경</DialogTitle>
                            <DialogDescription>{course.courseName}</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="deadline">새 마감일</Label>
                            <Input
                              id="deadline"
                              type="datetime-local"
                              defaultValue={course.deadline.slice(0, 16)}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleDeadlineChange(
                                    course.courseId,
                                    new Date(e.target.value).toISOString()
                                  );
                                }
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      {course.status === 'CONFIRMED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUnconfirm(course.courseId, course.courseName)}
                          disabled={isUnconfirming}
                        >
                          {isUnconfirming ? '처리 중...' : '확정 되돌리기'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Student Management Component
function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: students, isLoading } = useAdminStudents();
  const { mutate: resetPin, isPending: isResetting } = useResetStudentPin();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newPin, setNewPin] = useState('');

  const filteredStudents = students?.filter(
    (student: Student) =>
      student.studentNumber.includes(searchTerm) ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetPin = () => {
    if (!selectedStudent || newPin.length !== 4) {
      toast({ title: '오류', description: 'PIN은 4자리 숫자여야 합니다', variant: 'destructive' });
      return;
    }

    resetPin(
      { id: selectedStudent.studentId, pin: newPin },
      {
        onSuccess: () => {
          toast({ title: '성공', description: 'PIN이 리셋되었습니다' });
          setSelectedStudent(null);
          setNewPin('');
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 관리</CardTitle>
        <CardDescription>학생 검색 및 PIN 리셋</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="학번 또는 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>학번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>프로필 완료</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  학생이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents?.map((student: Student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-mono">{student.studentNumber}</TableCell>
                  <TableCell>{student.name || '-'}</TableCell>
                  <TableCell>
                    {student.profileCompleted ? (
                      <Badge className="bg-green-500">완료</Badge>
                    ) : (
                      <Badge variant="secondary">미완료</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(student.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                        >
                          PIN 리셋
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>PIN 리셋</DialogTitle>
                          <DialogDescription>
                            학번 {selectedStudent?.studentNumber}의 새 PIN을 입력하세요
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="newPin">새 PIN (4자리)</Label>
                          <Input
                            id="newPin"
                            type="text"
                            maxLength={4}
                            value={newPin}
                            onChange={(e) =>
                              setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            placeholder="0000"
                            className="text-center tracking-widest"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(null);
                              setNewPin('');
                            }}
                          >
                            취소
                          </Button>
                          <Button onClick={handleResetPin} disabled={isResetting}>
                            {isResetting ? '리셋 중...' : '리셋'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
