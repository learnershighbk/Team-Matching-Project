/**
 * Student E2E 테스트
 */

import { test, expect } from '@playwright/test';
import { waitForPageLoad, generateTestData } from './helpers/test-utils';

// 테스트용 코스 ID (실제 환경에서 설정 필요)
const TEST_COURSE_ID = process.env.TEST_COURSE_ID || 'test-course-id';

test.describe('Student 기능', () => {
  test.describe('인증 및 등록', () => {
    test.skip('코스 접근 페이지 표시', async ({ page }) => {
      await page.goto(`/course/${TEST_COURSE_ID}`);

      // 학번 입력 필드 확인 (1단계)
      await expect(page.locator('#studentNumber')).toBeVisible();
      // 다음 버튼 확인
      await expect(page.locator('button:has-text("다음")')).toBeVisible();
    });

    test.skip('잘못된 학번 형식 거부', async ({ page }) => {
      await page.goto(`/course/${TEST_COURSE_ID}`);

      // 5자리 학번 입력 (9자리 필요)
      await page.fill('#studentNumber', '12345');

      // 다음 버튼은 9자리가 아니면 비활성화됨
      const nextButton = page.locator('button:has-text("다음")');
      await expect(nextButton).toBeDisabled();
    });

    test.skip('잘못된 PIN 형식 거부', async ({ page }) => {
      await page.goto(`/course/${TEST_COURSE_ID}`);

      // 학번 입력
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');

      // PIN 입력 필드 확인
      await expect(page.locator('#pin')).toBeVisible();

      // 2자리 PIN 입력 (4자리 필요)
      await page.fill('#pin', '12');

      // 로그인 버튼은 4자리가 아니면 비활성화됨
      const loginButton = page.locator('button:has-text("로그인")');
      await expect(loginButton).toBeDisabled();
    });

    test.skip('신규 학생 등록 및 로그인', async ({ page }) => {
      const testData = generateTestData();

      await page.goto(`/course/${TEST_COURSE_ID}`);

      // 1단계: 학번 입력
      await page.fill('#studentNumber', testData.studentNumber);
      await page.click('button:has-text("다음")');

      // 2단계: PIN 입력 (신규 유저는 등록 페이지로 이동)
      await page.fill('#pin', testData.pin);
      await page.click('button:has-text("로그인")');

      // 신규 유저일 경우 PIN 설정 단계로 이동
      // 또는 처음 등록하시나요? 링크 클릭
      await page.click('button:has-text("처음 등록하시나요?")');

      // 새 PIN 설정
      await page.fill('#newPin', testData.pin);
      await page.fill('#confirmPin', testData.pin);
      await page.click('button:has-text("등록하기")');

      // 프로필 페이지로 이동
      await expect(page).toHaveURL(/\/course\/.*\/profile/);
    });
  });

  test.describe('프로필 입력 (로그인 필요)', () => {
    test.skip('프로필 페이지 접근', async ({ page }) => {
      // 학생 로그인
      await page.goto(`/course/${TEST_COURSE_ID}`);
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');
      await page.fill('#pin', '1234');
      await page.click('button:has-text("로그인")');

      await expect(page).toHaveURL(/\/profile/);

      // 프로필 폼 필드 확인
      await expect(page.locator('#name, input[name="name"]')).toBeVisible();
      await expect(page.locator('#email, input[name="email"]')).toBeVisible();
    });

    test.skip('프로필 정보 입력 및 저장', async ({ page }) => {
      // 학생 로그인
      await page.goto(`/course/${TEST_COURSE_ID}`);
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');
      await page.fill('#pin', '1234');
      await page.click('button:has-text("로그인")');

      await waitForPageLoad(page);

      // 프로필 정보 입력
      await page.fill('#name, input[name="name"]', 'Test Student');
      await page.fill('#email, input[name="email"]', 'student@test.com');
      await page.selectOption('select[name="major"]', 'Master');
      await page.selectOption('select[name="gender"]', 'Male');
      await page.selectOption('select[name="continent"]', 'Asia');
      await page.selectOption('select[name="role"]', 'Member');
      await page.selectOption('select[name="skill"]', 'Intermediate');
      await page.selectOption('select[name="goal"]', 'Learn');

      // 시간대 선택 (체크박스)
      await page.click('input[value="Morning"], label:has-text("Morning")');

      // 저장
      await page.click('button[type="submit"], button:has-text("저장")');

      // 성공 메시지 또는 상태 변경
      await expect(page.locator('text=저장, text=완료, text=success')).toBeVisible();
    });

    test.skip('필수 필드 누락 시 에러', async ({ page }) => {
      // 학생 로그인
      await page.goto(`/course/${TEST_COURSE_ID}`);
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');
      await page.fill('#pin', '1234');
      await page.click('button:has-text("로그인")');

      await waitForPageLoad(page);

      // 이름만 입력하고 저장 시도
      await page.fill('#name, input[name="name"]', 'Test');
      await page.click('button[type="submit"]');

      // 에러 메시지 표시
      await expect(page.locator('[role="alert"], .error, text=필수')).toBeVisible();
    });
  });

  test.describe('팀 결과 조회 (로그인 필요)', () => {
    test.skip('팀 페이지 접근 (매칭 전)', async ({ page }) => {
      // 학생 로그인
      await page.goto(`/course/${TEST_COURSE_ID}`);
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');
      await page.fill('#pin', '1234');
      await page.click('button:has-text("로그인")');

      // 팀 탭으로 이동
      await page.click('a:has-text("팀"), button:has-text("Team"), [data-testid="team-tab"]');

      // 대기 메시지 표시
      await expect(page.locator('text=매칭, text=기다리, text=pending')).toBeVisible();
    });

    test.skip('팀 결과 표시 (매칭 후)', async ({ page }) => {
      // CONFIRMED 상태의 코스에서 로그인한 학생
      await page.goto(`/course/${TEST_COURSE_ID}`);
      await page.fill('#studentNumber', '202400001');
      await page.click('button:has-text("다음")');
      await page.fill('#pin', '1234');
      await page.click('button:has-text("로그인")');

      // 팀 탭으로 이동
      await page.click('a:has-text("팀"), [data-testid="team-tab"]');

      // 팀 정보 표시
      await expect(page.locator('.team-info, [data-testid="team-result"]')).toBeVisible();

      // 팀원 정보 표시
      await expect(page.locator('.teammate, [data-testid="teammate"]')).toBeVisible();
    });
  });
});

test.describe('Student 접근 제어', () => {
  test('존재하지 않는 코스 접근 시 에러', async ({ page }) => {
    await page.goto('/course/non-existent-course-id');

    // 로딩이 끝날 때까지 대기 후 에러 메시지 확인
    // CardTitle에 "코스를 찾을 수 없습니다" 메시지가 표시됨
    await expect(page.getByText('코스를 찾을 수 없습니다')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('프로필 마감 제한', () => {
  test.skip('마감 후 프로필 수정 불가', async ({ page }) => {
    // 마감된 코스에서 로그인
    const closedCourseId = process.env.CLOSED_COURSE_ID || 'closed-course-id';

    await page.goto(`/course/${closedCourseId}`);
    await page.fill('#studentNumber', '202400001');
    await page.click('button:has-text("다음")');
    await page.fill('#pin', '1234');
    await page.click('button:has-text("로그인")');

    // 프로필 페이지에서 수정 불가 메시지
    await expect(page.locator('text=마감, text=closed, text=수정 불가')).toBeVisible();

    // 입력 필드가 비활성화되어 있음
    await expect(page.locator('#name, input[name="name"]')).toBeDisabled();
  });
});
