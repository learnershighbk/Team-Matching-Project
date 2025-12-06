# ADR-001: API-Only 데이터 접근 패턴

**상태:** 승인됨
**날짜:** 2025-01-06
**의사결정자:** CTO

---

## 컨텍스트

TeamMatch 프로젝트는 다음과 같은 상황에 있었습니다:

1. **템플릿 잔재**: 프로젝트가 Supabase Auth를 사용하는 템플릿에서 시작
2. **PRD 요구사항**: 자체 JWT 인증 시스템 사용 (학번/PIN 기반)
3. **RLS 정책 오류**: `auth.role() = 'service_role'` 정책이 Supabase Auth 없이 작동하지 않음

## 결정

**브라우저에서 Supabase를 직접 호출하지 않고, 모든 요청을 API Routes를 통해 처리한다.**

```
┌─────────────────────────────────────────────────────────┐
│  Browser  →  API Routes (Hono)  →  Supabase (DB)       │
│     ↓              ↓                    ↓              │
│  API 호출만     JWT 검증           Service Role Key    │
│               접근 제어              RLS 자동 우회      │
└─────────────────────────────────────────────────────────┘
```

## 구현

### 1. RLS 정책 정리 (`0007_create_rls_policies.sql`)

```sql
-- RLS 활성화 (기본 차단)
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 공개 정책: 코스 조회만 허용
CREATE POLICY "Public read access to courses"
  ON courses FOR SELECT
  USING (true);

-- 삭제됨: auth.role() 기반 정책들
```

### 2. 인증 아키텍처

| 컴포넌트 | 파일 | 용도 |
|---------|------|------|
| API 클라이언트 | `@/lib/auth/api-client.ts` | 브라우저 → API 호출 |
| Auth Context | `@/lib/auth/auth-context.tsx` | 인증 상태 관리 |
| JWT 유틸리티 | `@/features/auth/backend/jwt.ts` | 토큰 생성/검증 |
| Auth Routes | `@/features/auth/backend/route.ts` | 인증 API 엔드포인트 |

### 3. 사용 방법

```tsx
// 브라우저에서 인증 상태 사용
import { useAuth } from "@/lib/auth/auth-context";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  // ...
}

// API 호출
import { authApi } from "@/lib/auth/api-client";

await authApi.adminLogin({ email, password });
await authApi.logout();
```

## 결과

### 장점

1. **보안 강화**: 브라우저에서 민감 데이터 직접 접근 불가
2. **단순성**: `auth.role()` 의존성 제거
3. **일관성**: 모든 비즈니스 로직이 API에서 처리
4. **테스트 용이**: API만 테스트하면 됨

### 단점

1. **네트워크 오버헤드**: 모든 요청이 API를 거침
2. **실시간 기능 제한**: Supabase Realtime 사용 시 추가 설계 필요

## 마이그레이션 체크리스트

- [x] RLS 정책 수정 (`0007`, `0009`)
- [x] API 클라이언트 생성 (`api-client.ts`)
- [x] Auth Context 생성 (`auth-context.tsx`)
- [x] JWT 유틸리티 생성 (`jwt.ts`)
- [x] Auth Routes 생성 (`route.ts`)
- [x] 템플릿 코드 deprecated 처리
- [ ] Admin 로그인 페이지 구현
- [ ] Instructor 로그인 API 구현
- [ ] Student 인증 API 구현

## 참고

- PRD.md: 인증 요구사항
- AUTH.md: 인증 시스템 상세 설계
- DATABASE.md: RLS 정책 설계
