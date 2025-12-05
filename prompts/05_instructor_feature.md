# 👨‍🏫 05_instructor_feature.md — 교수자 기능 구현

**순서:** 5/8  
**의존성:** 04_admin_feature.md  
**다음:** 06_student_feature.md

---

## 🎯 Mission

Instructor 대시보드, 코스 생성/관리, 학생 현황 조회, 매칭 실행 UI를 구현합니다.

---

## 📋 Tasks

### Task 1: 코스 CRUD API

**파일:** `app/api/instructor/courses/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const courseSchema = z.object({
  courseName: z.string().min(1).max(200),
  courseCode: z.string().min(1).max(20),
  teamSize: z.number().min(2).max(6),
  weightProfile: z.enum(['balanced', 'skill_heavy', 'skill_role_focused', 'diversity_heavy']),
  deadline: z.string().datetime(),
});

// GET: 내 코스 목록
export const GET = withAuth(async (request: NextRequest, auth) => {
  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select(`
      course_id,
      course_name,
      course_code,
      team_size,
      weight_profile,
      status,
      deadline,
      students:students(count),
      completed:students(count)
    `)
    .eq('instructor_id', auth.instructorId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // completed count 별도 쿼리
  const formatted = await Promise.all(courses.map(async (c) => {
    const { count } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', c.course_id)
      .eq('profile_completed', true);
    
    return {
      courseId: c.course_id,
      courseName: c.course_name,
      courseCode: c.course_code,
      teamSize: c.team_size,
      weightProfile: c.weight_profile,
      status: c.status,
      deadline: c.deadline,
      studentCount: c.students?.[0]?.count || 0,
      completedCount: count || 0,
      accessUrl: `/course/${c.course_id}`,
    };
  }));
  
  return NextResponse.json({ success: true, data: formatted });
}, ['instructor']);

// POST: 코스 생성
export const POST = withAuth(async (request: NextRequest, auth) => {
  const body = await request.json();
  
  const validated = courseSchema.parse(body);
  
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .insert({
      instructor_id: auth.instructorId,
      course_name: validated.courseName,
      course_code: validated.courseCode,
      team_size: validated.teamSize,
      weight_profile: validated.weightProfile,
      deadline: validated.deadline,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: {
      courseId: course.course_id,
      courseName: course.course_name,
      courseCode: course.course_code,
      accessUrl: `/course/${course.course_id}`,
    }
  }, { status: 201 });
}, ['instructor']);
```

### Task 2: 코스 상세/학생 현황 API

**파일:** `app/api/instructor/courses/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const GET = withAuth(async (request: NextRequest, auth) => {
  const id = request.url.split('/').slice(-1)[0];
  
  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('course_id', id)
    .eq('instructor_id', auth.instructorId)
    .single();
  
  if (error || !course) {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_001', message: '코스를 찾을 수 없습니다' } },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: course });
}, ['instructor']);

export const PUT = withAuth(async (request: NextRequest, auth) => {
  const id = request.url.split('/').slice(-1)[0];
  const updates = await request.json();
  
  // LOCKED/CONFIRMED 상태에서는 수정 제한
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status')
    .eq('course_id', id)
    .single();
  
  if (course?.status !== 'OPEN') {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_003', message: '수정할 수 없는 상태입니다' } },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabaseAdmin
    .from('courses')
    .update({
      team_size: updates.teamSize,
      weight_profile: updates.weightProfile,
      deadline: updates.deadline,
    })
    .eq('course_id', id)
    .eq('instructor_id', auth.instructorId)
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json({ success: true, data });
}, ['instructor']);
```

**파일:** `app/api/instructor/courses/[id]/students/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const GET = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[4];
  
  // 코스 소유권 확인
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('instructor_id')
    .eq('course_id', id)
    .single();
  
  if (course?.instructor_id !== auth.instructorId) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_003', message: '권한 없음' } },
      { status: 403 }
    );
  }
  
  const { data: students, error } = await supabaseAdmin
    .from('students')
    .select(`
      student_id,
      student_number,
      name,
      email,
      major,
      profile_completed,
      team:teams(team_number)
    `)
    .eq('course_id', id)
    .order('student_number');
  
  if (error) throw error;
  
  const { count: total } = await supabaseAdmin
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id);
  
  const { count: completed } = await supabaseAdmin
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id)
    .eq('profile_completed', true);
  
  return NextResponse.json({
    success: true,
    data: {
      total: total || 0,
      completed: completed || 0,
      students: students.map(s => ({
        studentId: s.student_id,
        studentNumber: s.student_number,
        name: s.name,
        email: s.email,
        major: s.major,
        profileCompleted: s.profile_completed,
        teamNumber: s.team?.team_number || null,
      })),
    }
  });
}, ['instructor']);
```

### Task 3: 코스 Lock API

**파일:** `app/api/instructor/courses/[id]/lock/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const POST = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[4];
  
  // 상태 확인
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('status, instructor_id')
    .eq('course_id', id)
    .single();
  
  if (course?.instructor_id !== auth.instructorId) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_003', message: '권한 없음' } },
      { status: 403 }
    );
  }
  
  if (course?.status !== 'OPEN') {
    return NextResponse.json(
      { success: false, error: { code: 'COURSE_004', message: '이미 마감된 코스입니다' } },
      { status: 400 }
    );
  }
  
  // 학생 수 확인
  const { count } = await supabaseAdmin
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id)
    .eq('profile_completed', true);
  
  if (!count || count < 2) {
    return NextResponse.json(
      { success: false, error: { code: 'MATCH_001', message: '최소 2명의 학생이 필요합니다' } },
      { status: 400 }
    );
  }
  
  // Lock
  const { error } = await supabaseAdmin
    .from('courses')
    .update({ status: 'LOCKED' })
    .eq('course_id', id);
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: { courseId: id, status: 'LOCKED', studentCount: count }
  });
}, ['instructor']);
```

### Task 4: Instructor 로그인 페이지

**파일:** `app/(auth)/instructor/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstructorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/instructor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    });

    const data = await res.json();

    if (data.success) {
      router.push('/instructor/dashboard');
    } else {
      setError(data.error?.message || '로그인 실패');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">TeamMatch Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>PIN (4자리)</Label>
              <Input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Task 5: Instructor 대시보드

**파일:** `app/(auth)/instructor/dashboard/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Course {
  courseId: string;
  courseName: string;
  courseCode: string;
  status: string;
  studentCount: number;
  completedCount: number;
  deadline: string;
  accessUrl: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await fetch('/api/instructor/courses');
    const data = await res.json();
    if (data.success) {
      setCourses(data.data);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    alert('URL이 복사되었습니다!');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      OPEN: 'bg-green-100 text-green-800',
      LOCKED: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 코스</h1>
        <Button onClick={() => router.push('/instructor/courses/new')}>
          + 새 코스 생성
        </Button>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.courseId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{course.courseName}</CardTitle>
                  <p className="text-gray-500">{course.courseCode}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${getStatusBadge(course.status)}`}>
                  {course.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p>학생: {course.completedCount}/{course.studentCount} 완료</p>
                  <p className="text-sm text-gray-500">
                    마감: {new Date(course.deadline).toLocaleString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => copyUrl(course.accessUrl)}>
                    URL 복사
                  </Button>
                  <Button size="sm" onClick={() => router.push(`/instructor/courses/${course.courseId}`)}>
                    상세보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Task 6: 코스 생성 페이지

**파일:** `app/(auth)/instructor/courses/new/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    teamSize: 4,
    weightProfile: 'balanced',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/instructor/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`코스가 생성되었습니다!\n학생 URL: ${window.location.origin}${data.data.accessUrl}`);
      router.push('/instructor/dashboard');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>새 코스 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>코스명 *</Label>
              <Input
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="Policy Analysis and Evaluation"
                required
              />
            </div>
            
            <div>
              <Label>코스 코드 *</Label>
              <Input
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                placeholder="KPP101"
                required
              />
            </div>
            
            <div>
              <Label>팀 인원수</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: Number(e.target.value) })}
              >
                <option value={3}>3명</option>
                <option value={4}>4명 (기본)</option>
                <option value={5}>5명</option>
              </select>
            </div>
            
            <div>
              <Label>가중치 프로파일</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.weightProfile}
                onChange={(e) => setFormData({ ...formData, weightProfile: e.target.value })}
              >
                <option value="balanced">Balanced (기본)</option>
                <option value="skill_heavy">Skill-heavy</option>
                <option value="skill_role_focused">Skill-Role-Focused</option>
                <option value="diversity_heavy">Diversity-heavy</option>
              </select>
            </div>
            
            <div>
              <Label>프로필 입력 마감일시 *</Label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit">코스 생성</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] 코스 목록 조회 API
- [ ] 코스 생성 API
- [ ] 코스 수정 API
- [ ] 학생 현황 조회 API
- [ ] 코스 Lock API
- [ ] Instructor 로그인 페이지
- [ ] Instructor 대시보드
- [ ] 코스 생성 페이지

---

## 🔗 Reference

- docs/API_SPEC.md (Instructor APIs)
- docs/USERFLOW.md (Instructor Flow)

---

## ➡️ Next Step

06_student_feature.md로 진행하여 Student 기능을 구현합니다.
