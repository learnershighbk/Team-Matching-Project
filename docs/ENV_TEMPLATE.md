# 🔧 ENV_TEMPLATE.md — TeamMatch 환경변수 설정

**참조:** PRD.md 섹션 10.1  
**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. Overview

TeamMatch는 다음 환경에서 실행됩니다:

| 환경 | 용도 | 파일 |
|------|------|------|
| **Development** | 로컬 개발 | `.env.local` |
| **Preview** | PR 브랜치 테스트 | Vercel Preview |
| **Production** | 실제 서비스 | Vercel Production |

---

## 2. Environment Variables

### 2.1 .env.local (개발용)

```env
# ============================================
# TeamMatch Environment Variables
# ============================================
# 이 파일을 .env.local로 복사하여 사용하세요.
# 절대 Git에 커밋하지 마세요!
# ============================================

# --------------------------------------------
# 1. Admin Credentials
# --------------------------------------------
# 관리자 로그인 정보 (환경변수에서 직접 검증)
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=1217

# --------------------------------------------
# 2. JWT Configuration
# --------------------------------------------
# JWT 서명용 비밀키 (최소 32자 이상)
# 생성: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# JWT 발행자/대상자 (선택적)
JWT_ISSUER=teammatch
JWT_AUDIENCE=teammatch-users

# --------------------------------------------
# 3. Supabase Configuration
# --------------------------------------------
# Supabase 프로젝트 URL
# 형식: https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (브라우저에서 사용)
# Supabase Dashboard > Settings > API > anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (서버에서만 사용)
# Supabase Dashboard > Settings > API > service_role
# ⚠️ 절대 클라이언트에 노출하지 마세요!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# --------------------------------------------
# 4. Application Settings
# --------------------------------------------
# 앱 기본 URL (로컬 개발)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 환경 (development | preview | production)
NEXT_PUBLIC_ENV=development

# --------------------------------------------
# 5. Optional: Rate Limiting
# --------------------------------------------
# Rate limiting 활성화 (true | false)
RATE_LIMIT_ENABLED=false

# 로그인 시도 제한 (분당)
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MS=60000

# --------------------------------------------
# 6. Optional: Logging
# --------------------------------------------
# 로그 레벨 (debug | info | warn | error)
LOG_LEVEL=debug
```

### 2.2 Production 환경변수 (Vercel)

```env
# Vercel Dashboard > Settings > Environment Variables

# Admin
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=<production-password>

# JWT (프로덕션용 강력한 키)
JWT_SECRET=<generated-strong-secret>
JWT_ISSUER=teammatch
JWT_AUDIENCE=teammatch-users

# Supabase (프로덕션 프로젝트)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>

# App
NEXT_PUBLIC_APP_URL=https://teammatch.vercel.app
NEXT_PUBLIC_ENV=production

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MS=60000

# Logging
LOG_LEVEL=error
```

---

## 3. Variable Details

### 3.1 Admin Credentials

| 변수 | 필수 | 설명 |
|------|------|------|
| `ADMIN_EMAIL` | ✅ | 관리자 이메일 |
| `ADMIN_PASSWORD` | ✅ | 관리자 비밀번호 |

```typescript
// 사용 예시 (lib/auth/admin.ts)
export function validateAdminCredentials(email: string, password: string): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}
```

### 3.2 JWT Configuration

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `JWT_SECRET` | ✅ | - | JWT 서명 비밀키 |
| `JWT_ISSUER` | ❌ | `teammatch` | JWT iss 클레임 |
| `JWT_AUDIENCE` | ❌ | `teammatch-users` | JWT aud 클레임 |

```bash
# JWT_SECRET 생성 방법
openssl rand -base64 32
# 또는
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3.3 Supabase Configuration

| 변수 | 필수 | 클라이언트 노출 | 설명 |
|------|------|----------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Anonymous API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ | Service Role Key |

```typescript
// lib/supabase/client.ts (브라우저용)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabase/server.ts (서버용)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## 4. Security Guidelines

### 4.1 비밀 관리 체크리스트

- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드에 없는지 확인
- [ ] 프로덕션과 개발 환경의 키가 다른지 확인
- [ ] `JWT_SECRET`이 충분히 긴지 확인 (최소 32자)

### 4.2 .gitignore 설정

```gitignore
# 환경변수
.env
.env.local
.env.*.local

# Vercel
.vercel
```

### 4.3 환경변수 검증

```typescript
// lib/config.ts
function validateEnv() {
  const required = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'JWT_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
}

// 앱 시작 시 호출
validateEnv();
```

---

## 5. Supabase Setup Guide

### 5.1 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `teammatch`
   - Database Password: 강력한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)`

### 5.2 API Keys 확인

1. Dashboard > Settings > API
2. 다음 키 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### 5.3 데이터베이스 초기화

```bash
# SQL Editor에서 실행하거나 마이그레이션 사용
# DATABASE.md의 스키마 참조
```

---

## 6. Vercel Deployment

### 6.1 환경변수 설정

1. Vercel Dashboard > Project > Settings > Environment Variables
2. 각 변수 추가:
   - Name: 변수명
   - Value: 값
   - Environment: Production / Preview / Development 선택

### 6.2 환경별 설정

| 변수 | Development | Preview | Production |
|------|-------------|---------|------------|
| `NEXT_PUBLIC_ENV` | development | preview | production |
| `LOG_LEVEL` | debug | info | error |
| `RATE_LIMIT_ENABLED` | false | true | true |

---

## 7. Local Development Setup

### 7.1 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/teammatch.git
cd teammatch

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 4. 개발 서버 시작
npm run dev
```

### 7.2 환경변수 확인

```bash
# 현재 설정된 환경변수 확인 (민감 정보 마스킹)
npm run env:check

# 또는 직접 확인
node -e "console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('JWT')))"
```

---

## 8. Troubleshooting

### 8.1 일반적인 문제

| 문제 | 원인 | 해결 |
|------|------|------|
| `JWT_SECRET is not defined` | .env.local 미설정 | 환경변수 파일 확인 |
| `Invalid Supabase URL` | URL 형식 오류 | https:// 포함 확인 |
| `Unauthorized` | Service Role Key 오류 | Supabase 대시보드에서 키 재확인 |

### 8.2 디버깅

```typescript
// 환경변수 로딩 확인
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('JWT Secret length:', process.env.JWT_SECRET?.length);
```

---

## 9. Quick Reference

### 9.1 필수 환경변수 (최소 설정)

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
JWT_SECRET=your-32-character-minimum-secret-key
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 9.2 NEXT_PUBLIC_ 접두사 규칙

| 접두사 | 서버 | 클라이언트 | 용도 |
|--------|------|------------|------|
| `NEXT_PUBLIC_` | ✅ | ✅ | 공개 가능한 설정 |
| (없음) | ✅ | ❌ | 서버 전용 비밀 |

---

**END OF DOCUMENT**

*이 문서는 PRD.md 섹션 10.1을 기반으로 한 환경변수 설정 가이드입니다.*
