'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  useCourseDetail,
  useCourseStudents,
  useLockCourse,
  useRunMatching,
  useConfirmTeams,
  useCourseTeams,
} from '@/features/instructor/hooks/useInstructor';
import { toast } from '@/hooks/use-toast';
import type { StudentStatus, Team, TeamMember } from '@/features/instructor/types';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: course, isLoading: courseLoading } = useCourseDetail(courseId);
  const { data: students, isLoading: studentsLoading } = useCourseStudents(courseId);
  const { data: teams } = useCourseTeams(courseId);

  const { mutate: lockCourse, isPending: isLocking } = useLockCourse();
  const { mutate: runMatching, isPending: isMatching, data: matchingPreview } = useRunMatching();
  const { mutate: confirmTeams, isPending: isConfirming } = useConfirmTeams();

  const [showMatchingPreview, setShowMatchingPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleCopyUrl = async () => {
    if (!course?.courseId) {
      toast({ title: '오류', description: '코스 정보를 불러올 수 없습니다', variant: 'destructive' });
      return;
    }

    try {
      // 환경 변수에 설정된 URL 우선 사용, 없으면 현재 origin 사용
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${baseUrl}/course/${course.courseId}`;
      await navigator.clipboard.writeText(url);
      toast({ title: '복사됨', description: '학생 URL이 클립보드에 복사되었습니다' });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({ title: '오류', description: 'URL 복사에 실패했습니다', variant: 'destructive' });
    }
  };

  const handleLock = () => {
    if (confirm('코스를 마감하시겠습니까? 마감 후에는 학생들이 프로필을 수정할 수 없습니다.')) {
      lockCourse(courseId, {
        onSuccess: () => {
          toast({ title: '성공', description: '코스가 마감되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      });
    }
  };

  const handleRunMatching = () => {
    runMatching(
      { courseId },
      {
        onSuccess: () => {
          setShowMatchingPreview(true);
          toast({ title: '성공', description: '매칭이 완료되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleConfirmTeams = () => {
    confirmTeams(courseId, {
      onSuccess: () => {
        setShowMatchingPreview(false);
        setShowConfirmDialog(false);
        toast({ title: '성공', description: '팀이 확정되었습니다' });
      },
      onError: (error) => {
        toast({ title: '오류', description: error.message, variant: 'destructive' });
      },
    });
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">코스 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">코스를 찾을 수 없습니다</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Ensure students is always an array
  const studentsArray = Array.isArray(students) ? students : [];
  const completedCount = studentsArray.filter((s: StudentStatus) => s.profileCompleted).length || 0;
  const totalCount = studentsArray.length || 0;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/instructor/dashboard')}>
              ← 대시보드
            </Button>
            <h1 className="text-xl font-bold">{course.courseName}</h1>
            {getStatusBadge(course.status)}
          </div>
          <Button variant="outline" onClick={handleCopyUrl}>
            학생 URL 복사
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Course Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>코스 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">코스 코드</span>
                <span className="font-medium">{course.courseCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">팀 크기</span>
                <span className="font-medium">{course.teamSize}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가중치 프로파일</span>
                <span className="font-medium">{course.weightProfile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">마감일</span>
                <span className="font-medium">
                  {new Date(course.deadline).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>학생 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">전체 학생</span>
                  <span className="text-2xl font-bold">{totalCount}명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">프로필 완료</span>
                  <span className="text-2xl font-bold text-green-600">{completedCount}명</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  완료율: {completionRate}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>액션</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {course.status === 'OPEN' && (
              <Button onClick={handleLock} disabled={isLocking} variant="outline">
                {isLocking ? '마감 중...' : '수동 마감'}
              </Button>
            )}
            {course.status === 'LOCKED' && (
              <>
                <Button onClick={handleRunMatching} disabled={isMatching || completedCount < 2}>
                  {isMatching ? '매칭 중...' : '매칭 실행'}
                </Button>
                {completedCount < 2 && (
                  <p className="text-sm text-muted-foreground">
                    매칭을 실행하려면 최소 2명의 프로필 완료 학생이 필요합니다
                  </p>
                )}
              </>
            )}
            {course.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500 text-lg px-4 py-2">팀 확정 완료</Badge>
            )}
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
            <CardDescription>등록된 학생들의 프로필 상태를 확인합니다</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : studentsArray.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">등록된 학생이 없습니다</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학번</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>전공</TableHead>
                    <TableHead>프로필</TableHead>
                    <TableHead>팀</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsArray.map((student: StudentStatus) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-mono">{student.studentNumber}</TableCell>
                      <TableCell>{student.name || '-'}</TableCell>
                      <TableCell>{student.major || '-'}</TableCell>
                      <TableCell>
                        {student.profileCompleted ? (
                          <Badge className="bg-green-500">완료</Badge>
                        ) : (
                          <Badge variant="secondary">미완료</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.teamNumber ? `Team ${student.teamNumber}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Matching Preview */}
        {showMatchingPreview && matchingPreview && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>매칭 결과 미리보기</CardTitle>
                  <CardDescription>팀을 확정하기 전에 결과를 확인하세요</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRunMatching} disabled={isMatching}>
                    다시 매칭
                  </Button>
                  <Button onClick={() => setShowConfirmDialog(true)}>팀 확정</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // 통계 계산
                const teams = matchingPreview.teams || [];
                const totalTeams = teams.length;
                const totalAssignedStudents = teams.reduce((sum, team) => sum + (team.memberCount || 0), 0);
                const averageTeamSize = totalTeams > 0 ? totalAssignedStudents / totalTeams : 0;
                const totalStudents = students?.length || 0;
                const profileCompletionRate = totalStudents > 0 ? (totalAssignedStudents / totalStudents) * 100 : 0;

                return (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{totalTeams}</p>
                      <p className="text-sm text-muted-foreground">총 팀 수</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">
                        {averageTeamSize > 0 ? averageTeamSize.toFixed(1) : '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">평균 팀 크기</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{totalAssignedStudents}</p>
                      <p className="text-sm text-muted-foreground">배정된 학생</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">
                        {!isNaN(profileCompletionRate) ? profileCompletionRate.toFixed(0) : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">프로필 완료율</p>
                    </div>
                  </div>
                );
              })()}

              <Accordion type="multiple" className="w-full">
                {matchingPreview.teams?.map((team: Team, index: number) => (
                  <AccordionItem value={`team-${index}`} key={team.teamId || index}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Team {team.teamNumber}</span>
                        <Badge variant="secondary">{team.memberCount}명</Badge>
                        {team.topFactors && team.topFactors.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            Top: {team.topFactors.join(', ')}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {team.scoreBreakdown && (
                          <div className="grid grid-cols-7 gap-2 text-xs">
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Time</p>
                              <p>{team.scoreBreakdown.time?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Skill</p>
                              <p>{team.scoreBreakdown.skill?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Role</p>
                              <p>{team.scoreBreakdown.role?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Major</p>
                              <p>{team.scoreBreakdown.major?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Goal</p>
                              <p>{team.scoreBreakdown.goal?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Continent</p>
                              <p>{team.scoreBreakdown.continent?.toFixed(1)}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="font-medium">Gender</p>
                              <p>{team.scoreBreakdown.gender?.toFixed(1)}</p>
                            </div>
                          </div>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Major</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Skill</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {team.members?.map((member: TeamMember) => (
                              <TableRow key={member.studentId}>
                                <TableCell className="font-mono">{member.studentNumber}</TableCell>
                                <TableCell>{member.name || '-'}</TableCell>
                                <TableCell>{member.major || '-'}</TableCell>
                                <TableCell>{member.role || '-'}</TableCell>
                                <TableCell>{member.skill || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Confirmed Teams */}
        {course.status === 'CONFIRMED' && teams && teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>확정된 팀</CardTitle>
              <CardDescription>최종 확정된 팀 목록입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {teams.map((team: Team, index: number) => (
                  <AccordionItem value={`team-${index}`} key={team.teamId || index}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Team {team.teamNumber}</span>
                        <Badge variant="secondary">{team.memberCount}명</Badge>
                        {team.topFactors && team.topFactors.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            Top: {team.topFactors.join(', ')}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>학번</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>전공</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {team.members?.map((member: TeamMember) => (
                            <TableRow key={member.studentId}>
                              <TableCell className="font-mono">{member.studentNumber}</TableCell>
                              <TableCell>{member.name || '-'}</TableCell>
                              <TableCell>{member.email || '-'}</TableCell>
                              <TableCell>{member.major || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>팀 확정</DialogTitle>
              <DialogDescription>
                팀을 확정하시겠습니까? 확정 후에는 변경할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                취소
              </Button>
              <Button onClick={handleConfirmTeams} disabled={isConfirming}>
                {isConfirming ? '확정 중...' : '확정'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
