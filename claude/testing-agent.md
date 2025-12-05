# 🧪 Testing Agent

**역할:** 테스트 코드 작성, 품질 보증, CI/CD 설정

---

## 🎯 Mission

TeamMatch의 품질을 보장하기 위한 단위 테스트, 통합 테스트, E2E 테스트를 작성합니다.

---

## 📂 담당 영역

```
__tests__/
├── unit/
│   ├── matching/
│   │   ├── slots.test.ts
│   │   ├── scoring.test.ts
│   │   └── algorithm.test.ts
│   └── auth/
│       ├── jwt.test.ts
│       └── hash.test.ts
├── integration/
│   ├── api/
│   │   ├── admin.test.ts
│   │   ├── instructor.test.ts
│   │   └── student.test.ts
│   └── db/
│       └── queries.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── course-flow.spec.ts
    └── matching-flow.spec.ts

playwright.config.ts
jest.config.js
```

---

## 🛠️ Technical Stack

- **Unit/Integration:** Jest
- **E2E:** Playwright
- **Mocking:** Jest mocks

---

## 📋 Test Categories

### 1. Unit Tests

핵심 비즈니스 로직 테스트

```typescript
// __tests__/unit/matching/slots.test.ts
import { createTeamSlots } from '@/lib/matching/slots';

describe('createTeamSlots', () => {
  test('12명, 4인팀 → [4,4,4]', () => {
    expect(createTeamSlots(12, 4)).toEqual([4, 4, 4]);
  });

  test('13명, 4인팀 → 1인팀 없음', () => {
    const slots = createTeamSlots(13, 4);
    expect(slots.every(s => s >= 2)).toBe(true);
    expect(slots.reduce((a, b) => a + b)).toBe(13);
  });

  test('14명, 4인팀 → [4,4,3,3]', () => {
    const slots = createTeamSlots(14, 4);
    expect(slots).toContain(4);
    expect(slots.every(s => s >= 2)).toBe(true);
  });

  test('2명 → [2]', () => {
    expect(createTeamSlots(2, 4)).toEqual([2]);
  });
});
```

```typescript
// __tests__/unit/matching/scoring.test.ts
import { calculateTimeScore, calculateSkillScore } from '@/lib/matching/scoring';

describe('calculateTimeScore', () => {
  test('모든 시간대 공유 → 10점', () => {
    const members = [
      { times: ['weekday_daytime', 'weekend'] },
      { times: ['weekday_daytime', 'weekend'] },
    ];
    expect(calculateTimeScore(members)).toBe(10);
  });

  test('시간대 겹침 없음 → 0점', () => {
    const members = [
      { times: ['weekday_daytime'] },
      { times: ['weekend'] },
    ];
    expect(calculateTimeScore(members)).toBe(0);
  });
});

describe('calculateSkillScore', () => {
  test('모든 역량 다름 → 10점', () => {
    const members = [
      { skill: 'data_analysis' },
      { skill: 'research' },
      { skill: 'writing' },
      { skill: 'visual' },
    ];
    expect(calculateSkillScore(members)).toBe(10);
  });
});
```

### 2. Integration Tests

API 엔드포인트 테스트

```typescript
// __tests__/integration/api/admin.test.ts
import { POST } from '@/app/api/admin/login/route';
import { NextRequest } from 'next/server';

describe('Admin Login API', () => {
  test('올바른 자격증명 → 성공', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bklee@kdischool.ac.kr',
        password: '1217',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('잘못된 자격증명 → 401', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrong@email.com',
        password: 'wrong',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
```

### 3. E2E Tests

전체 사용자 플로우 테스트

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('Admin 로그인 성공', async ({ page }) => {
    await page.goto('/admin');
    await page.fill('input[type="email"]', 'bklee@kdischool.ac.kr');
    await page.fill('input[type="password"]', '1217');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/dashboard');
  });
});
```

```typescript
// __tests__/e2e/course-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Instructor 로그인
    await page.goto('/instructor');
    await page.fill('input[type="email"]', 'test@kdi.ac.kr');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');
  });

  test('코스 생성', async ({ page }) => {
    await page.click('text=새 코스 생성');
    await page.fill('input[name="courseName"]', 'Test Course');
    await page.fill('input[name="courseCode"]', 'TEST101');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Test Course')).toBeVisible();
  });
});
```

---

## ⚙️ Configuration

### Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
```

### Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
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

---

## ✅ Checklist

### Unit Tests
- [ ] 팀 슬롯 생성 (No-Orphan)
- [ ] 점수 계산 함수 (7개)
- [ ] JWT 생성/검증
- [ ] 비밀번호 해싱

### Integration Tests
- [ ] Admin 로그인 API
- [ ] Instructor API
- [ ] Student API

### E2E Tests
- [ ] Admin 로그인 플로우
- [ ] 코스 생성 플로우
- [ ] 학생 프로필 입력 플로우
- [ ] 매칭 실행/확정 플로우

### Coverage
- [ ] 핵심 로직 80% 이상
- [ ] API Routes 70% 이상

---

## 📊 Test Commands

```bash
# 단위 테스트
npm run test

# 특정 파일 테스트
npm run test -- slots.test.ts

# Coverage 리포트
npm run test:coverage

# E2E 테스트
npm run test:e2e

# E2E UI 모드
npm run test:e2e:ui
```

---

## 🔗 Reference

- docs/USECASES.md - 테스트 시나리오
- docs/MATCHING_ALGORITHM.md - 알고리즘 스펙
- prompts/08_integration.md
