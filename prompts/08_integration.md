# 🔗 08_integration.md — 통합 및 마무리

**순서:** 8/8 (마지막)  
**의존성:** 01-07 모든 단계  

---

## 🎯 Mission

모든 기능을 통합하고, UI/UX 개선, 테스트, 배포를 완료합니다.

---

## 📋 Tasks

### Task 1: 코스 상세 페이지 (Instructor)

**파일:** `app/(auth)/instructor/courses/[id]/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CourseDetail {
  course_id: string;
  course_name: string;
  course_code: string;
  team_size: number;
  weight_profile: string;
  status: string;
  deadline: string;
}

interface Student {
  studentId: string;
  studentNumber: string;
  name: string;
  major: string;
  profileCompleted: boolean;
  teamNumber: number | null;
}

interface MatchingResult {
  preview: boolean;
  teams: any[];
  summary: any;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchStudents();
  }, [courseId]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/instructor/courses/${courseId}`);
    const data = await res.json();
    if (data.success) setCourse(data.data);
  };

  const fetchStudents = async () => {
    const res = await fetch(`/api/instructor/courses/${courseId}/students`);
    const data = await res.json();
    if (data.success) {
      setStudents(data.data.students);
      setTotal(data.data.total);
      setCompleted(data.data.completed);
    }
  };

  const handleLock = async () => {
    if (!confirm('프로필 입력을 마감하시겠습니까?')) return;
    
    const res = await fetch(`/api/instructor/courses/${courseId}/lock`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.success) {
      fetchCourse();
      alert('마감되었습니다!');
    } else {
      alert(data.error?.message);
    }
  };

  const handleMatch = async () => {
    setLoading(true);
    const res = await fetch(`/api/instructor/courses/${courseId}/match`, {
      method: 'POST',
    });
    const data = await res.json();
    setLoading(false);
    
    if (data.success) {
      setMatchResult(data.data);
    } else {
      alert(data.error?.message);
    }
  };

  const handleConfirm = async () => {
    if (!matchResult) return;
    if (!confirm('팀을 확정하시겠습니까? 확정 후에는 변경할 수 없습니다.')) return;
    
    const res = await fetch(`/api/instructor/courses/${courseId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: matchResult.teams }),
    });
    const data = await res.json();
    
    if (data.success) {
      alert('팀이 확정되었습니다!');
      fetchCourse();
      setMatchResult(null);
    } else {
      alert(data.error?.message);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/course/${courseId}`);
    alert('URL이 복사되었습니다!');
  };

  if (!course) return <div>로딩중...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'LOCKED': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.course_name}</h1>
          <p className="text-gray-500">{course.course_code}</p>
        </div>
        <span className={`px-3 py-1 rounded ${getStatusColor(course.status)}`}>
          {course.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>코스 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>팀 인원: {course.team_size}명</p>
            <p>가중치: {course.weight_profile}</p>
            <p>마감: {new Date(course.deadline).toLocaleString()}</p>
            <Button variant="outline" onClick={copyUrl}>학생 URL 복사</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>학생 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completed} / {total}</p>
            <p className="text-gray-500">프로필 완료</p>
            <div className="mt-4 space-x-2">
              {course.status === 'OPEN' && (
                <Button onClick={handleLock} disabled={completed < 2}>
                  프로필 입력 마감
                </Button>
              )}
              {course.status === 'LOCKED' && (
                <Button onClick={handleMatch} disabled={loading}>
                  {loading ? '매칭 중...' : 'Run Matching'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 매칭 결과 미리보기 */}
      {matchResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>매칭 결과 미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p>총 팀 수: {matchResult.summary.totalTeams}</p>
              <p>평균 점수: {matchResult.summary.avgScore}</p>
              <p>점수 편차: {matchResult.summary.stdDev}</p>
            </div>
            
            <div className="space-y-4">
              {matchResult.teams.map((team) => (
                <div key={team.teamNumber} className="border rounded p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold">Team {team.teamNumber}</h4>
                    <span className="text-sm text-gray-500">
                      점수: {team.totalScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {team.members.map((m: any) => (
                      <span key={m.studentId} className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {m.name} ({m.major})
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    주요 매칭 요인: {team.topFactors.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={handleMatch}>
                다시 매칭
              </Button>
              <Button onClick={handleConfirm}>
                ✅ 팀 확정
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 학생 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">학번</th>
                <th className="p-2">이름</th>
                <th className="p-2">전공</th>
                <th className="p-2">프로필</th>
                <th className="p-2">팀</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.studentId} className="border-b">
                  <td className="p-2">{s.studentNumber}</td>
                  <td className="p-2">{s.name || '-'}</td>
                  <td className="p-2">{s.major || '-'}</td>
                  <td className="p-2">
                    {s.profileCompleted ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2">{s.teamNumber || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 2: 공통 레이아웃

**파일:** `app/(auth)/layout.tsx`
```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (pathname.startsWith('/admin')) {
      router.push('/admin');
    } else {
      router.push('/instructor');
    }
  };

  const isAdmin = pathname.startsWith('/admin');
  const title = isAdmin ? 'TeamMatch Admin' : 'TeamMatch';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">{title}</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Task 3: Error Boundary

**파일:** `app/error.tsx`
```typescript
'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  );
}
```

### Task 4: Loading States

**파일:** `app/loading.tsx`
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### Task 5: API Error Handler

**파일:** `lib/api/error-handler.ts`
```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION',
          message: error.errors[0]?.message || '입력값이 올바르지 않습니다',
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: '알 수 없는 오류가 발생했습니다',
      },
    },
    { status: 500 }
  );
}
```

### Task 6: E2E 테스트 설정

**파일:** `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**파일:** `__tests__/e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should login with correct credentials', async ({ page }) => {
    await page.goto('/admin');
    await page.fill('input[type="email"]', 'bklee@kdischool.ac.kr');
    await page.fill('input[type="password"]', '1217');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('should show error with wrong credentials', async ({ page }) => {
    await page.goto('/admin');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-500')).toBeVisible();
  });
});
```

### Task 7: Vercel 배포 설정

**파일:** `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "ADMIN_EMAIL": "@admin_email",
    "ADMIN_PASSWORD": "@admin_password",
    "JWT_SECRET": "@jwt_secret",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key"
  }
}
```

### Task 8: README

**파일:** `README.md`
```markdown
# TeamMatch - KDI School Team Formation System

KDI School 팀 프로젝트 매칭 서비스

## Features

- 3가지 역할: Admin, Instructor, Student
- AI 기반 팀 매칭 알고리즘
- 7가지 매칭 요소 (시간, 역량, 역할, 전공, 목표, 대륙, 성별)
- 4가지 가중치 프로파일

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS + shadcn/ui
- JWT Authentication

## Getting Started

\`\`\`bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 개발 서버 실행
npm run dev
\`\`\`

## Environment Variables

See `docs/ENV_TEMPLATE.md` for details.

## Documentation

- `docs/PRD.md` - Product Requirements
- `docs/API_SPEC.md` - API Specification
- `docs/MATCHING_ALGORITHM.md` - Algorithm Details
```

---

## ✅ Final Checklist

### 기능 완성
- [ ] Admin: 로그인, 교수자 관리, 학생 PIN 리셋
- [ ] Instructor: 로그인, 코스 관리, 매칭 실행/확정
- [ ] Student: 인증, 프로필 입력, 팀 결과 조회
- [ ] 매칭 알고리즘 작동

### UI/UX
- [ ] 모든 페이지 반응형
- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 메시지
- [ ] Toast 알림

### 테스트
- [ ] 단위 테스트 (알고리즘)
- [ ] E2E 테스트 (주요 플로우)

### 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 도메인 연결 (선택)
- [ ] 프로덕션 테스트

---

## 🚀 Deployment Steps

1. GitHub 저장소에 Push
2. Vercel에서 Import
3. Environment Variables 설정
4. Deploy
5. 프로덕션 URL 테스트

---

## 📊 Success Criteria

- [ ] Admin이 교수자를 생성하고 로그인할 수 있음
- [ ] Instructor가 코스를 생성하고 URL을 공유할 수 있음
- [ ] Student가 URL로 접속해서 프로필을 입력할 수 있음
- [ ] 마감 후 매칭 실행 및 확정이 가능함
- [ ] Student가 팀 결과를 확인할 수 있음
- [ ] 1인 팀이 생성되지 않음

---

**🎉 MVP 완성!**
