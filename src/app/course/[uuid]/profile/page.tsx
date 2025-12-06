'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourseStatus } from '@/features/course/hooks/useCourse';
import { useStudentProfile, useUpdateProfile } from '@/features/student/hooks/useStudent';
import { toast } from '@/hooks/use-toast';

// PRD에 따른 옵션 정의 (표시값: DB값)
const MAJORS = [
  { label: 'MPP', value: 'MPP' },
  { label: 'MDP', value: 'MDP' },
  { label: 'MPM', value: 'MPM' },
  { label: 'MDS', value: 'MDS' },
  { label: 'MIPD', value: 'MIPD' },
  { label: 'MPPM', value: 'MPPM' },
  { label: 'Ph.D.', value: 'PhD' },
];

const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const CONTINENTS = [
  { label: 'Asia', value: 'asia' },
  { label: 'Africa', value: 'africa' },
  { label: 'Europe', value: 'europe' },
  { label: 'North America', value: 'north_america' },
  { label: 'South America', value: 'south_america' },
  { label: 'Oceania', value: 'oceania' },
];

const ROLES = [
  { label: 'Leader (리더)', value: 'leader' },
  { label: 'Executor (실무)', value: 'executor' },
  { label: 'Ideator (아이디어)', value: 'ideator' },
  { label: 'Coordinator (조정자)', value: 'coordinator' },
];

const SKILLS = [
  { label: 'Data Analysis', value: 'data_analysis' },
  { label: 'Research', value: 'research' },
  { label: 'Writing', value: 'writing' },
  { label: 'Visual/PPT', value: 'visual' },
  { label: 'Presentation', value: 'presentation' },
];

const TIMES = [
  { label: 'Weekday Daytime', value: 'weekday_daytime' },
  { label: 'Weekday Evening', value: 'weekday_evening' },
  { label: 'Weekend', value: 'weekend' },
];

const GOALS = [
  { label: 'A+ (최고 성적 목표)', value: 'a_plus' },
  { label: 'Balanced (균형)', value: 'balanced' },
  { label: 'Minimum Completion (최소 완성)', value: 'minimum' },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { data: course, isLoading: courseLoading } = useCourseStatus(uuid);
  const { data: profile, isLoading: profileLoading } = useStudentProfile(uuid);
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    major: '',
    gender: '',
    continent: '',
    role: '',
    skill: '',
    times: [] as string[],
    goal: '',
  });

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        major: profile.major || '',
        gender: profile.gender || '',
        continent: profile.continent || '',
        role: profile.role || '',
        skill: profile.skill || '',
        times: profile.times || [],
        goal: profile.goal || '',
      });
    }
  }, [profile]);

  const handleTimeToggle = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.includes(time)
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time],
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      toast({ title: '오류', description: '이름을 입력해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.email.trim()) {
      toast({ title: '오류', description: '이메일을 입력해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.major) {
      toast({ title: '오류', description: '전공을 선택해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.gender) {
      toast({ title: '오류', description: '성별을 선택해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.continent) {
      toast({ title: '오류', description: '출신 대륙을 선택해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.role) {
      toast({ title: '오류', description: '역할 선호를 선택해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.skill) {
      toast({ title: '오류', description: '역량 수준을 선택해주세요', variant: 'destructive' });
      return;
    }
    if (formData.times.length === 0) {
      toast({ title: '오류', description: '선호 시간대를 선택해주세요', variant: 'destructive' });
      return;
    }
    if (!formData.goal) {
      toast({ title: '오류', description: '목표 성향을 선택해주세요', variant: 'destructive' });
      return;
    }

    updateProfile(
      {
        courseId: uuid,
        ...formData,
      },
      {
        onSuccess: () => {
          toast({ title: '저장 완료', description: '프로필이 저장되었습니다' });
        },
        onError: (error) => {
          toast({ title: '오류', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  const getDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (courseLoading || profileLoading) {
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

  const isLocked = course.status !== 'OPEN';
  const daysRemaining = getDaysRemaining(course.deadline);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={isLocked ? 'secondary' : 'default'}>
                {isLocked ? '마감됨' : '입력 가능'}
              </Badge>
              {!isLocked && daysRemaining > 0 && (
                <span className="text-sm font-medium text-orange-600">D-{daysRemaining}</span>
              )}
            </div>
            <CardTitle>{course.courseName}</CardTitle>
            <CardDescription>
              마감일:{' '}
              {new Date(course.deadline).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CardDescription>
          </CardHeader>
        </Card>

        {isLocked ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-xl font-medium mb-2">프로필 입력 기간이 종료되었습니다</p>
              <p className="text-muted-foreground mb-4">
                매칭 결과가 나오면 알려드리겠습니다.
              </p>
              <Button onClick={() => router.push(`/course/${uuid}`)}>돌아가기</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>프로필 입력</CardTitle>
              <CardDescription>팀 매칭에 사용될 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@kdischool.ac.kr"
                  />
                </div>
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label>전공 *</Label>
                <Select
                  value={formData.major}
                  onValueChange={(value) => setFormData({ ...formData, major: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전공 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJORS.map((major) => (
                      <SelectItem key={major.value} value={major.value}>
                        {major.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>성별 *</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((gender) => (
                    <Button
                      key={gender.value}
                      type="button"
                      variant={formData.gender === gender.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, gender: gender.value })}
                    >
                      {gender.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Continent */}
              <div className="space-y-2">
                <Label>출신 대륙 *</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTINENTS.map((continent) => (
                    <Button
                      key={continent.value}
                      type="button"
                      variant={formData.continent === continent.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, continent: continent.value })}
                    >
                      {continent.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>팀 내 역할 선호 *</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <Button
                      key={role.value}
                      type="button"
                      variant={formData.role === role.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                    >
                      {role.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skill */}
              <div className="space-y-2">
                <Label>주요 역량 *</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <Button
                      key={skill.value}
                      type="button"
                      variant={formData.skill === skill.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, skill: skill.value })}
                    >
                      {skill.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Times */}
              <div className="space-y-2">
                <Label>선호 시간대 * (복수 선택 가능)</Label>
                <div className="flex flex-wrap gap-4">
                  {TIMES.map((time) => (
                    <div key={time.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={time.value}
                        checked={formData.times.includes(time.value)}
                        onCheckedChange={() => handleTimeToggle(time.value)}
                      />
                      <Label htmlFor={time.value} className="font-normal cursor-pointer">
                        {time.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label>목표 성향 *</Label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((goal) => (
                    <Button
                      key={goal.value}
                      type="button"
                      variant={formData.goal === goal.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                    >
                      {goal.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={isUpdating} 
                  className="w-full"
                >
                  {isUpdating ? '저장 중...' : '프로필 저장'}
                </Button>
              </div>

              {profile?.profileCompleted && (
                <p className="text-center text-sm text-green-600">
                  프로필이 완료되었습니다. 수정이 필요하면 다시 저장해주세요.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
