# 👨‍🎓 06_student_feature.md — 학생 기능 구현

**순서:** 6/8  
**의존성:** 05_instructor_feature.md  
**다음:** 07_matching_engine.md

---

## 🎯 Mission

학생 인증, 프로필 입력/수정, 팀 결과 조회 기능을 구현합니다.

---

## 📋 Tasks

### Task 1: 프로필 API

**파일:** `app/api/student/profile/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  major: z.enum(['MPP', 'MDP', 'MPM', 'MDS', 'MIPD', 'MPPM', 'PhD']),
  gender: z.enum(['male', 'female', 'other']),
  continent: z.enum(['asia', 'africa', 'europe', 'north_america', 'south_america', 'oceania']),
  role: z.enum(['leader', 'executor', 'ideator', 'coordinator']),
  skill: z.enum(['data_analysis', 'research', 'writing', 'visual', 'presentation']),
  times: z.array(z.enum(['weekday_daytime', 'weekday_evening', 'weekend'])).min(1),
  goal: z.enum(['a_plus', 'balanced', 'minimum']),
});

// GET: 프로필 조회
export const GET = withAuth(async (request: NextRequest, auth) => {
  const { data: student, error } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('student_id', auth.studentId)
    .single();
  
  if (error) throw error;
  
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status')
    .eq('course_id', auth.courseId)
    .single();
  
  return NextResponse.json({
    success: true,
    data: {
      studentId: student.student_id,
      studentNumber: student.student_number,
      courseId: student.course_id,
      courseStatus: course?.status,
      profile: {
        name: student.name,
        email: student.email,
        major: student.major,
        gender: student.gender,
        continent: student.continent,
        role: student.role,
        skill: student.skill,
        times: student.times,
        goal: student.goal,
      },
      profileCompleted: student.profile_completed,
    }
  });
}, ['student']);

// PUT: 프로필 수정
export const PUT = withAuth(async (request: NextRequest, auth) => {
  // 코스 상태 확인
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status')
    .eq('course_id', auth.courseId)
    .single();
  
  if (course?.status !== 'OPEN') {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_002', message: '프로필 입력 마감기한이 지났습니다' } },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  const validated = profileSchema.parse(body);
  
  const { error } = await supabaseAdmin
    .from('students')
    .update({
      name: validated.name,
      email: validated.email,
      major: validated.major,
      gender: validated.gender,
      continent: validated.continent,
      role: validated.role,
      skill: validated.skill,
      times: validated.times,
      goal: validated.goal,
    })
    .eq('student_id', auth.studentId);
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: { profileCompleted: true, message: '프로필이 저장되었습니다' }
  });
}, ['student']);
```

### Task 2: 팀 결과 API

**파일:** `app/api/student/team/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

const FACTOR_LABELS: Record<string, string> = {
  time: '시간대(Time)',
  skill: '역량 균형(Skill)',
  role: '역할 분배(Role)',
  major: '전공 다양성(Major)',
  goal: '목표 일치(Goal)',
  continent: '대륙 다양성(Continent)',
  gender: '성별 다양성(Gender)',
};

export const GET = withAuth(async (request: NextRequest, auth) => {
  // 학생 정보 조회
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('team_id')
    .eq('student_id', auth.studentId)
    .single();
  
  // 코스 상태 확인
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status')
    .eq('course_id', auth.courseId)
    .single();
  
  if (!student?.team_id) {
    return NextResponse.json({
      success: true,
      data: {
        hasTeam: false,
        courseStatus: course?.status,
        message: course?.status === 'CONFIRMED' 
          ? '팀 배정 정보를 찾을 수 없습니다' 
          : '매칭 결과를 기다리고 있습니다'
      }
    });
  }
  
  // 팀 정보 조회
  const { data: team } = await supabaseAdmin
    .from('teams')
    .select('team_number, top_factors')
    .eq('team_id', student.team_id)
    .single();
  
  // 팀원 정보 조회 (이름, 전공, 이메일만)
  const { data: teammates } = await supabaseAdmin
    .from('students')
    .select('student_id, name, major, email')
    .eq('team_id', student.team_id)
    .neq('student_id', auth.studentId);
  
  // 매칭 설명 생성
  const topFactors = team?.top_factors || [];
  const factor1 = FACTOR_LABELS[topFactors[0]] || topFactors[0];
  const factor2 = FACTOR_LABELS[topFactors[1]] || topFactors[1];
  const matchDescription = topFactors.length >= 2
    ? `이 팀은 ${factor1} 및 ${factor2} 측면에서 가장 적합하게 매칭되었습니다.`
    : '팀이 구성되었습니다.';
  
  return NextResponse.json({
    success: true,
    data: {
      hasTeam: true,
      teamNumber: team?.team_number,
      topFactors: team?.top_factors,
      matchDescription,
      teammates: teammates?.map(t => ({
        name: t.name,
        major: t.major,
        email: t.email,
      })) || [],
    }
  });
}, ['student']);
```

### Task 3: 코스 상태 API (Public)

**파일:** `app/api/course/[uuid]/status/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select(`
      course_id,
      course_name,
      course_code,
      status,
      deadline,
      instructor:instructors(name)
    `)
    .eq('course_id', params.uuid)
    .single();
  
  if (error || !course) {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_001', message: '코스를 찾을 수 없습니다' } },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      courseId: course.course_id,
      courseName: course.course_name,
      courseCode: course.course_code,
      instructorName: course.instructor?.name,
      status: course.status,
      deadline: course.deadline,
      isDeadlinePassed: new Date(course.deadline) < new Date(),
    }
  });
}
```

### Task 4: 학생 인증 페이지

**파일:** `app/course/[uuid]/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CourseInfo {
  courseName: string;
  courseCode: string;
  instructorName: string;
  deadline: string;
  status: string;
}

export default function StudentAuthPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.uuid as string;
  
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [studentNumber, setStudentNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [step, setStep] = useState<'number' | 'pin'>('number');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    const res = await fetch(`/api/course/${courseId}/status`);
    const data = await res.json();
    if (data.success) {
      setCourseInfo(data.data);
    } else {
      setError('코스를 찾을 수 없습니다');
    }
  };

  const checkStudentNumber = async () => {
    if (!/^\d{9}$/.test(studentNumber)) {
      setError('학번은 9자리 숫자여야 합니다');
      return;
    }
    
    // 기존 학생인지 확인 (간단한 체크)
    // 실제로는 서버에서 확인
    setStep('pin');
    setError('');
  };

  const handleAuth = async () => {
    const res = await fetch('/api/student/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        studentNumber,
        pin,
        isNewUser,
      }),
    });

    const data = await res.json();

    if (data.success) {
      if (data.data.courseStatus === 'CONFIRMED') {
        router.push(`/course/${courseId}/team`);
      } else if (data.data.profileCompleted && data.data.courseStatus === 'LOCKED') {
        router.push(`/course/${courseId}/team`);
      } else {
        router.push(`/course/${courseId}/profile`);
      }
    } else {
      if (data.error?.code === 'AUTH_003' && !isNewUser) {
        setIsNewUser(true);
        setError('처음 접속하시나요? PIN을 설정해주세요.');
      } else {
        setError(data.error?.message || '인증 실패');
      }
    }
  };

  if (!courseInfo) {
    return <div className="flex justify-center items-center min-h-screen">로딩중...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{courseInfo.courseName}</CardTitle>
          <p className="text-gray-500">{courseInfo.courseCode}</p>
          <p className="text-sm">담당: {courseInfo.instructorName}</p>
          <p className="text-sm text-orange-600">
            마감: {new Date(courseInfo.deadline).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          {step === 'number' ? (
            <div className="space-y-4">
              <div>
                <Label>학번 (Student ID)</Label>
                <Input
                  type="text"
                  maxLength={9}
                  placeholder="202400001"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value.replace(/\D/g, ''))}
                />
                <p className="text-xs text-gray-500 mt-1">9자리 숫자를 입력하세요</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full" onClick={checkStudentNumber}>
                다음
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm">학번: {studentNumber}</p>
              <div>
                <Label>{isNewUser ? 'PIN 설정 (4자리)' : 'PIN 입력'}</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep('number'); setPin(''); setError(''); }}>
                  뒤로
                </Button>
                <Button className="flex-1" onClick={handleAuth}>
                  {isNewUser ? 'PIN 설정 및 시작' : '로그인'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 5: 프로필 입력 페이지

**파일:** `app/course/[uuid]/profile/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MAJORS = ['MPP', 'MDP', 'MPM', 'MDS', 'MIPD', 'MPPM', 'PhD'];
const GENDERS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }];
const CONTINENTS = [
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'europe', label: 'Europe' },
  { value: 'north_america', label: 'North America' },
  { value: 'south_america', label: 'South America' },
  { value: 'oceania', label: 'Oceania' },
];
const ROLES = [
  { value: 'leader', label: 'Leader (리더)' },
  { value: 'executor', label: 'Executor (실무)' },
  { value: 'ideator', label: 'Ideator (아이디어)' },
  { value: 'coordinator', label: 'Coordinator (조정자)' },
];
const SKILLS = [
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'visual', label: 'Visual/PPT' },
  { value: 'presentation', label: 'Presentation' },
];
const TIMES = [
  { value: 'weekday_daytime', label: 'Weekday Daytime' },
  { value: 'weekday_evening', label: 'Weekday Evening' },
  { value: 'weekend', label: 'Weekend' },
];
const GOALS = [
  { value: 'a_plus', label: 'A+ (최고 성적 목표)' },
  { value: 'balanced', label: 'Balanced (균형)' },
  { value: 'minimum', label: 'Minimum Completion (최소 완성)' },
];

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.uuid;
  
  const [profile, setProfile] = useState({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/student/profile');
    const data = await res.json();
    if (data.success && data.data.profile) {
      setProfile({
        name: data.data.profile.name || '',
        email: data.data.profile.email || '',
        major: data.data.profile.major || '',
        gender: data.data.profile.gender || '',
        continent: data.data.profile.continent || '',
        role: data.data.profile.role || '',
        skill: data.data.profile.skill || '',
        times: data.data.profile.times || [],
        goal: data.data.profile.goal || '',
      });
    }
  };

  const handleTimeToggle = (value: string) => {
    setProfile(prev => ({
      ...prev,
      times: prev.times.includes(value)
        ? prev.times.filter(t => t !== value)
        : [...prev.times, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert('프로필이 저장되었습니다!');
      router.push(`/course/${courseId}/team`);
    } else {
      setError(data.error?.message || '저장 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>프로필 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>이름 *</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>이메일 *</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>전공 *</Label>
                <select
                  className="w-full border rounded p-2"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  required
                >
                  <option value="">선택하세요</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label>성별 *</Label>
                <div className="flex gap-4 mt-2">
                  {GENDERS.map(g => (
                    <label key={g.value} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value={g.value}
                        checked={profile.gender === g.value}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      />
                      {g.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>출신 대륙 *</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {CONTINENTS.map(c => (
                  <label key={c.value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="continent"
                      value={c.value}
                      checked={profile.continent === c.value}
                      onChange={(e) => setProfile({ ...profile, continent: e.target.value })}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>역할 선호 *</Label>
                {ROLES.map(r => (
                  <label key={r.value} className="flex items-center gap-1 mt-1">
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={profile.role === r.value}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
              <div>
                <Label>주요 역량 *</Label>
                {SKILLS.map(s => (
                  <label key={s.value} className="flex items-center gap-1 mt-1">
                    <input
                      type="radio"
                      name="skill"
                      value={s.value}
                      checked={profile.skill === s.value}
                      onChange={(e) => setProfile({ ...profile, skill: e.target.value })}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>선호 시간대 * (복수 선택 가능)</Label>
              <div className="flex gap-4 mt-2">
                {TIMES.map(t => (
                  <label key={t.value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={profile.times.includes(t.value)}
                      onChange={() => handleTimeToggle(t.value)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>목표 성향 *</Label>
              <div className="flex flex-col gap-2 mt-2">
                {GOALS.map(g => (
                  <label key={g.value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="goal"
                      value={g.value}
                      checked={profile.goal === g.value}
                      onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '저장 중...' : '프로필 저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 6: 팀 결과 페이지

**파일:** `app/course/[uuid]/team/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeamData {
  hasTeam: boolean;
  teamNumber?: number;
  matchDescription?: string;
  teammates?: { name: string; major: string; email: string }[];
  courseStatus?: string;
  message?: string;
}

export default function TeamResultPage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    const res = await fetch('/api/student/team');
    const data = await res.json();
    if (data.success) {
      setTeamData(data.data);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert('이메일이 복사되었습니다!');
  };

  if (!teamData) {
    return <div className="flex justify-center items-center min-h-screen">로딩중...</div>;
  }

  if (!teamData.hasTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">매칭 대기 중</h2>
            <p className="text-gray-600">{teamData.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <CardTitle>팀이 배정되었습니다!</CardTitle>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-xl font-bold">
            Team {teamData.teamNumber}
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded mb-6">
            <p className="text-gray-700">💡 {teamData.matchDescription}</p>
          </div>

          <h3 className="font-bold mb-4">👥 팀원 정보</h3>
          <div className="space-y-3">
            {teamData.teammates?.map((member, idx) => (
              <div key={idx} className="border rounded p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.major}</p>
                  <p className="text-sm text-blue-600">{member.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyEmail(member.email)}>
                  복사
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              ℹ️ 팀원들과 직접 연락하여 첫 미팅 일정을 잡아주세요!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] 프로필 조회 API
- [ ] 프로필 수정 API (상태 체크)
- [ ] 팀 결과 조회 API
- [ ] 코스 상태 조회 API (Public)
- [ ] 학생 인증 페이지
- [ ] 프로필 입력 페이지
- [ ] 팀 결과 페이지

---

## 🔗 Reference

- docs/API_SPEC.md (Student APIs)
- docs/USERFLOW.md (Student Flow)

---

## ➡️ Next Step

07_matching_engine.md로 진행하여 매칭 알고리즘을 구현합니다.
