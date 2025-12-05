# 👑 04_admin_feature.md — 관리자 기능 구현

**순서:** 4/8  
**의존성:** 03_auth_backend.md  
**다음:** 05_instructor_feature.md

---

## 🎯 Mission

Admin 대시보드와 교수자 관리, 학생 PIN 리셋, 코스 관리 기능을 구현합니다.

---

## 📋 Tasks

### Task 1: 교수자 목록 조회 API

**파일:** `app/api/admin/instructors/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/hash';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET: 교수자 목록 조회
export const GET = withAuth(async (request: NextRequest, auth) => {
  const { data: instructors, error } = await supabaseAdmin
    .from('instructors')
    .select(`
      instructor_id,
      email,
      name,
      created_at,
      courses:courses(count)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  const formatted = instructors.map(i => ({
    instructorId: i.instructor_id,
    email: i.email,
    name: i.name,
    courseCount: i.courses?.[0]?.count || 0,
    createdAt: i.created_at,
  }));
  
  return NextResponse.json({ success: true, data: formatted });
}, ['admin']);

// POST: 교수자 생성
export const POST = withAuth(async (request: NextRequest, auth) => {
  const { email, pin, name } = await request.json();
  
  // PIN 검증
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' } },
      { status: 400 }
    );
  }
  
  // 중복 체크
  const { data: existing } = await supabaseAdmin
    .from('instructors')
    .select('instructor_id')
    .eq('email', email)
    .single();
  
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: 'ADMIN_001', message: '이미 등록된 이메일입니다' } },
      { status: 400 }
    );
  }
  
  const pinHash = await hashPassword(pin);
  
  const { data: instructor, error } = await supabaseAdmin
    .from('instructors')
    .insert({ email, pin_hash: pinHash, name })
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: {
      instructorId: instructor.instructor_id,
      email: instructor.email,
      name: instructor.name
    }
  }, { status: 201 });
}, ['admin']);
```

### Task 2: 교수자 수정/삭제 API

**파일:** `app/api/admin/instructors/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/hash';
import { supabaseAdmin } from '@/lib/supabase/server';

// PUT: 교수자 수정
export const PUT = withAuth(async (
  request: NextRequest,
  auth,
) => {
  const id = request.url.split('/').pop();
  const { name, pin } = await request.json();
  
  const updates: any = {};
  if (name) updates.name = name;
  if (pin) {
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' } },
        { status: 400 }
      );
    }
    updates.pin_hash = await hashPassword(pin);
  }
  
  const { data, error } = await supabaseAdmin
    .from('instructors')
    .update(updates)
    .eq('instructor_id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: { instructorId: data.instructor_id, email: data.email, name: data.name }
  });
}, ['admin']);

// DELETE: 교수자 삭제
export const DELETE = withAuth(async (request: NextRequest, auth) => {
  const id = request.url.split('/').pop();
  
  const { error } = await supabaseAdmin
    .from('instructors')
    .delete()
    .eq('instructor_id', id);
  
  if (error) throw error;
  
  return NextResponse.json({ success: true, data: { deleted: true } });
}, ['admin']);
```

### Task 3: 학생 PIN 리셋 API

**파일:** `app/api/admin/students/[id]/reset-pin/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/hash';
import { supabaseAdmin } from '@/lib/supabase/server';

export const PUT = withAuth(async (request: NextRequest, auth) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/')[4]; // /api/admin/students/{id}/reset-pin
  
  const { newPin } = await request.json();
  
  if (!/^\d{4}$/.test(newPin)) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' } },
      { status: 400 }
    );
  }
  
  const pinHash = await hashPassword(newPin);
  
  const { error } = await supabaseAdmin
    .from('students')
    .update({ pin_hash: pinHash })
    .eq('student_id', id);
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: { studentId: id, pinReset: true }
  });
}, ['admin']);
```

### Task 4: 코스 목록/마감 수정 API

**파일:** `app/api/admin/courses/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const GET = withAuth(async (request: NextRequest, auth) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  
  let query = supabaseAdmin
    .from('courses')
    .select(`
      course_id,
      course_name,
      course_code,
      status,
      deadline,
      instructor:instructors(name),
      students:students(count)
    `)
    .order('created_at', { ascending: false });
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data: courses, error } = await query;
  if (error) throw error;
  
  const formatted = courses.map(c => ({
    courseId: c.course_id,
    courseName: c.course_name,
    courseCode: c.course_code,
    instructorName: c.instructor?.name,
    status: c.status,
    studentCount: c.students?.[0]?.count || 0,
    deadline: c.deadline,
  }));
  
  return NextResponse.json({ success: true, data: { courses: formatted } });
}, ['admin']);
```

**파일:** `app/api/admin/courses/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { supabaseAdmin } from '@/lib/supabase/server';

export const PUT = withAuth(async (request: NextRequest, auth) => {
  const id = request.url.split('/').pop();
  const { deadline } = await request.json();
  
  const { data, error } = await supabaseAdmin
    .from('courses')
    .update({ deadline })
    .eq('course_id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json({
    success: true,
    data: { courseId: data.course_id, deadline: data.deadline }
  });
}, ['admin']);
```

### Task 5: Admin 로그인 페이지

**파일:** `app/(auth)/admin/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error?.message || '로그인 실패');
      }
    } catch {
      setError('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">TeamMatch Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

### Task 6: Admin 대시보드

**파일:** `app/(auth)/admin/dashboard/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Instructor {
  instructorId: string;
  email: string;
  name: string;
  courseCount: number;
}

export default function AdminDashboard() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', pin: '' });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const res = await fetch('/api/admin/instructors');
    const data = await res.json();
    if (data.success) {
      setInstructors(data.data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setFormData({ email: '', name: '', pin: '' });
      fetchInstructors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/instructors/${id}`, { method: 'DELETE' });
    fetchInstructors();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '+ 새 교수자 추가'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>새 교수자 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>이메일</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>이름</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>PIN (4자리)</Label>
                  <Input
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit">생성</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>교수자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">이메일</th>
                <th className="text-left p-2">이름</th>
                <th className="text-left p-2">코스 수</th>
                <th className="text-left p-2">액션</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((i) => (
                <tr key={i.instructorId} className="border-b">
                  <td className="p-2">{i.email}</td>
                  <td className="p-2">{i.name}</td>
                  <td className="p-2">{i.courseCount}</td>
                  <td className="p-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(i.instructorId)}
                    >
                      삭제
                    </Button>
                  </td>
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

---

## ✅ Checklist

- [ ] 교수자 목록 조회 API
- [ ] 교수자 생성 API (이메일 중복 체크)
- [ ] 교수자 수정/삭제 API
- [ ] 학생 PIN 리셋 API
- [ ] 코스 목록 조회 API
- [ ] Admin 로그인 페이지
- [ ] Admin 대시보드 UI

---

## 🔗 Reference

- docs/API_SPEC.md (Admin APIs)
- docs/USERFLOW.md (Admin Flow)

---

## ➡️ Next Step

05_instructor_feature.md로 진행하여 Instructor 기능을 구현합니다.
