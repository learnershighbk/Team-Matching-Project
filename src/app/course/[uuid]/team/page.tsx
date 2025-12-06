'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCourseStatus } from '@/features/course/hooks/useCourse';
import { useStudentTeam, useStudentProfile } from '@/features/student/hooks/useStudent';
import { toast } from '@/hooks/use-toast';
import type { TeamMember } from '@/features/student/types';

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { data: course, isLoading: courseLoading } = useCourseStatus(uuid);
  const { data: profile } = useStudentProfile(uuid);
  const { data: team, isLoading: teamLoading, error: teamError } = useStudentTeam(uuid);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: '복사됨', description: '이메일이 클립보드에 복사되었습니다' });
  };

  if (courseLoading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">팀 정보를 불러오는 중...</p>
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

  if (course.status !== 'CONFIRMED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-xl font-semibold mb-2">아직 팀이 확정되지 않았습니다</h2>
            <p className="text-muted-foreground mb-6">
              팀 매칭이 완료되면 이 페이지에서 결과를 확인할 수 있습니다.
            </p>
            <Button onClick={() => router.push(`/course/${uuid}`)}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2">팀 정보를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-6">
              프로필을 완료하지 않아 매칭에서 제외되었을 수 있습니다.
            </p>
            <Button onClick={() => router.push(`/course/${uuid}`)}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFactorDescription = (factors: string[]) => {
    const descriptions: Record<string, string> = {
      time: '시간대 호환성',
      skill: '역량 다양성',
      role: '역할 균형',
      major: '전공 다양성',
      goal: '목표 일치',
      continent: '지역 다양성',
      gender: '성별 균형',
    };

    return factors.map((f) => descriptions[f.toLowerCase()] || f).join(' 및 ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Celebration Header */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold mb-2">팀이 확정되었습니다!</h1>
            <p className="text-blue-100">
              {course.courseName} - Team {team.teamNumber}
            </p>
          </CardContent>
        </Card>

        {/* Top Factors */}
        {team.topFactors && team.topFactors.length > 0 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <p className="text-center text-muted-foreground">
                이 팀은 <span className="font-medium text-foreground">{getFactorDescription(team.topFactors)}</span> 측면에서 가장 적합하게 매칭되었습니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Team {team.teamNumber}
              <Badge variant="secondary">{team.memberCount}명</Badge>
            </CardTitle>
            <CardDescription>팀원들에게 연락하여 첫 미팅 일정을 잡아보세요!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.members?.map((member: TeamMember) => {
                const isMe = member.studentId === profile?.studentId;

                return (
                  <div
                    key={member.studentId}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      isMe ? 'bg-blue-50 border border-blue-200' : 'bg-muted'
                    }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={isMe ? 'bg-blue-500 text-white' : ''}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name || '이름 없음'}</span>
                        {isMe && (
                          <Badge variant="outline" className="text-xs">
                            나
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.studentNumber}</p>
                    </div>
                    {member.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyEmail(member.email!)}
                      >
                        이메일 복사
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>팀원들의 이메일을 복사하여 그룹 채팅방을 만드세요</li>
              <li>첫 미팅 일정을 잡아 서로 인사를 나누세요</li>
              <li>프로젝트 역할 분담과 계획을 세워보세요</li>
            </ol>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push(`/course/${uuid}`)}>
            코스 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
