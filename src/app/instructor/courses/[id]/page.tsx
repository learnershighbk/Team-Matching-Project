'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { WEIGHT_PROFILES } from '@/features/matching/weights';
import {
  Clock,
  Zap,
  UserCog,
  GraduationCap,
  Target,
  Globe,
  Users,
  TrendingUp,
  Download,
} from 'lucide-react';

// 라벨 매핑 함수들
const getMajorLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    MPP: 'MPP',
    MDP: 'MDP',
    MPM: 'MPM',
    MDS: 'MDS',
    MIPD: 'MIPD',
    MPPM: 'MPPM',
    PhD: 'Ph.D.',
  };
  return mapping[value] || value;
};

const getGenderLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
  };
  return mapping[value] || value;
};

const getContinentLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    asia: 'Asia',
    africa: 'Africa',
    europe: 'Europe',
    north_america: 'North America',
    south_america: 'South America',
    oceania: 'Oceania',
  };
  return mapping[value] || value;
};

const getRoleLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    leader: 'Leader',
    executor: 'Executor',
    ideator: 'Ideator',
    coordinator: 'Coordinator',
  };
  return mapping[value] || value;
};

const getSkillLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    data_analysis: 'Data Analysis',
    research: 'Research',
    writing: 'Writing',
    visual: 'Visual/PPT',
    presentation: 'Presentation',
  };
  return mapping[value] || value;
};

const getTimeLabel = (value: string) => {
  const mapping: Record<string, string> = {
    weekday_daytime: 'Weekday Daytime',
    weekday_evening: 'Weekday Evening',
    weekend: 'Weekend',
  };
  return mapping[value] || value;
};

const getGoalLabel = (value?: string) => {
  if (!value) return '-';
  const mapping: Record<string, string> = {
    a_plus: 'A+',
    balanced: 'Balanced',
    minimum: 'Minimum',
  };
  return mapping[value] || value;
};

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
  const [selectedWeightProfile, setSelectedWeightProfile] = useState<string>('');

  // 가중치 프로파일 옵션
  const weightProfileOptions = [
    { value: 'balanced', label: 'Balanced (균형)', description: '모든 요소를 균형있게 고려' },
    { value: 'skill_heavy', label: 'Skill-heavy (역량 중심)', description: '역량 다양성을 중시' },
    { value: 'diversity_heavy', label: 'Diversity-heavy (다양성 중심)', description: '전공, 지역, 성별 다양성 중시' },
    { value: 'time_heavy', label: 'Time-heavy (시간대 중심)', description: '시간대 호환성을 최우선' },
  ];

  // 현재 선택된 가중치 프로파일
  const currentWeightProfile = selectedWeightProfile || course?.weightProfile || 'balanced';
  const currentWeights = WEIGHT_PROFILES[currentWeightProfile] || WEIGHT_PROFILES.balanced;

  // 가중치 요소 정보
  const weightInfo: Record<
    string,
    { label: string; icon: typeof Clock; color: string; gradient: string }
  > = {
    time: {
      label: '시간대',
      icon: Clock,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
    skill: {
      label: '역량',
      icon: Zap,
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-500',
    },
    role: {
      label: '역할',
      icon: UserCog,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    major: {
      label: '전공',
      icon: GraduationCap,
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
    },
    goal: {
      label: '목표',
      icon: Target,
      color: 'text-red-600',
      gradient: 'from-red-500 to-pink-500',
    },
    continent: {
      label: '지역',
      icon: Globe,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    gender: {
      label: '성별',
      icon: Users,
      color: 'text-pink-600',
      gradient: 'from-pink-500 to-rose-500',
    },
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

  const handleDownloadCSV = () => {
    if (studentsArray.length === 0) {
      toast({ title: '오류', description: '다운로드할 학생 데이터가 없습니다', variant: 'destructive' });
      return;
    }

    try {
      // CSV 헤더
      const headers = [
        '팀',
        '학번',
        '이름',
        '이메일',
        '전공',
        '성별',
        '대륙',
        '역할',
        '역량',
        '시간대',
        '목표',
        '프로필 상태',
      ];

      // CSV 데이터 행 생성
      const rows = studentsArray.map((student: StudentStatus) => {
        const timesStr =
          student.times && student.times.length > 0
            ? student.times.map((t) => getTimeLabel(t)).join(', ')
            : '-';
        return [
          student.teamNumber ? `Team ${student.teamNumber}` : '-',
          student.studentNumber || '-',
          student.name || '-',
          student.email || '-',
          getMajorLabel(student.major),
          getGenderLabel(student.gender),
          getContinentLabel(student.continent),
          getRoleLabel(student.role),
          getSkillLabel(student.skill),
          timesStr,
          getGoalLabel(student.goal),
          student.profileCompleted ? '완료' : '미완료',
        ];
      });

      // CSV 내용 생성
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 파일명 생성 (코스명_날짜시간.csv)
      const courseName = course?.courseName || 'course';
      const sanitizedCourseName = courseName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `${sanitizedCourseName}_학생목록_${dateStr}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ title: '성공', description: 'CSV 파일이 다운로드되었습니다' });
    } catch (error) {
      console.error('Failed to download CSV:', error);
      toast({ title: '오류', description: 'CSV 다운로드에 실패했습니다', variant: 'destructive' });
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
    if (!selectedWeightProfile && course?.weightProfile) {
      // 기본값으로 코스의 가중치 프로파일 사용
      runMatching(
        { courseId, weightProfile: course.weightProfile },
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
    } else if (selectedWeightProfile) {
      runMatching(
        { courseId, weightProfile: selectedWeightProfile },
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
    } else {
      toast({ title: '오류', description: '가중치 프로파일을 선택해주세요', variant: 'destructive' });
    }
  };

  const handleConfirmTeams = () => {
    if (!matchingPreview || !matchingPreview.teams || matchingPreview.teams.length === 0) {
      toast({ title: '오류', description: '매칭 결과가 없습니다. 먼저 매칭을 실행해주세요.', variant: 'destructive' });
      return;
    }

    confirmTeams(
      { courseId, teams: matchingPreview.teams },
      {
        onSuccess: () => {
          setShowMatchingPreview(false);
          setShowConfirmDialog(false);
          toast({ title: '성공', description: '팀이 확정되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
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
                  {new Date(course.deadline).toLocaleDateString('en-US', {
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
          <CardContent className="space-y-4">
            {course.status === 'OPEN' && (
              <Button onClick={handleLock} disabled={isLocking} variant="outline">
                {isLocking ? '마감 중...' : '수동 마감'}
              </Button>
            )}
            {course.status === 'LOCKED' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weightProfile">가중치 프로파일</Label>
                  <Select
                    value={selectedWeightProfile || course.weightProfile || 'balanced'}
                    onValueChange={setSelectedWeightProfile}
                  >
                    <SelectTrigger id="weightProfile" className="w-full md:w-[300px]">
                      <SelectValue placeholder="가중치 프로파일 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightProfileOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWeightProfile && (
                    <p className="text-sm text-muted-foreground">
                      {weightProfileOptions.find((opt) => opt.value === selectedWeightProfile)?.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    코스 기본값: {course.weightProfile || 'balanced'} (선택하지 않으면 기본값 사용)
                  </p>
                </div>

                {/* 가중치 시각화 */}
                <div className="rounded-lg border bg-card p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">가중치 적용 현황</Label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {weightProfileOptions.find((opt) => opt.value === currentWeightProfile)?.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(currentWeights).map(([key, value]) => {
                      const maxWeight = Math.max(...Object.values(currentWeights));
                      const percentage = (value / maxWeight) * 100;
                      const info = weightInfo[key];
                      const Icon = info?.icon || TrendingUp;
                      const color = info?.color || 'text-gray-600';
                      const gradient = info?.gradient || 'from-gray-500 to-gray-600';
                      
                      return (
                        <div
                          key={key}
                          className="rounded-md border bg-muted/30 p-2 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${color}`} />
                              <span className="text-xs font-medium">{info?.label || key}</span>
                            </div>
                            <span className={`text-xs font-bold ${color} font-mono`}>
                              {value.toFixed(1)}
                            </span>
                          </div>
                          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button onClick={handleRunMatching} disabled={isMatching || completedCount < 2}>
                    {isMatching ? '매칭 중...' : '매칭 실행'}
                  </Button>
                  {completedCount < 2 && (
                    <p className="text-sm text-muted-foreground">
                      매칭을 실행하려면 최소 2명의 프로필 완료 학생이 필요합니다
                    </p>
                  )}
                </div>
              </div>
            )}
            {course.status === 'CONFIRMED' && (
              <Badge className="bg-blue-500 text-lg px-4 py-2">팀 확정 완료</Badge>
            )}
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>학생 목록 (현재 등록: {totalCount}명)</CardTitle>
                <CardDescription>등록된 학생들의 프로필 상태를 확인합니다</CardDescription>
              </div>
              {studentsArray.length > 0 && (
                <Button variant="outline" onClick={handleDownloadCSV} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  CSV 다운로드
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : studentsArray.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">등록된 학생이 없습니다</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>팀</TableHead>
                      <TableHead>학번</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>전공</TableHead>
                      <TableHead>성별</TableHead>
                      <TableHead>대륙</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>역량</TableHead>
                      <TableHead>시간대</TableHead>
                      <TableHead>목표</TableHead>
                      <TableHead>프로필</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsArray.map((student: StudentStatus) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          {student.teamNumber ? `Team ${student.teamNumber}` : '-'}
                        </TableCell>
                        <TableCell className="font-mono">{student.studentNumber}</TableCell>
                        <TableCell>{student.name || '-'}</TableCell>
                        <TableCell className="text-sm">{student.email || '-'}</TableCell>
                        <TableCell>{getMajorLabel(student.major)}</TableCell>
                        <TableCell>{getGenderLabel(student.gender)}</TableCell>
                        <TableCell>{getContinentLabel(student.continent)}</TableCell>
                        <TableCell>{getRoleLabel(student.role)}</TableCell>
                        <TableCell>{getSkillLabel(student.skill)}</TableCell>
                        <TableCell>
                          {student.times && student.times.length > 0
                            ? student.times.map((t) => getTimeLabel(t)).join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>{getGoalLabel(student.goal)}</TableCell>
                        <TableCell>
                          {student.profileCompleted ? (
                            <Badge className="bg-green-500">완료</Badge>
                          ) : (
                            <Badge variant="secondary">미완료</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                    {isMatching ? '매칭 중...' : '다시 매칭'}
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
