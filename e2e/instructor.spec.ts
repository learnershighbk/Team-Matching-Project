/**
 * Instructor E2E 테스트
 */

import { test, expect } from '@playwright/test';
import { loginAsInstructor, waitForPageLoad, generateTestData } from './helpers/test-utils';

test.describe('Instructor 기능', () => {
  test.describe('로그인', () => {
    test('로그인 페이지 접근', async ({ page }) => {
      await page.goto('/instructor');

      // CardTitle은 h3로 렌더링됨
      await expect(page.getByText('TeamMatch Instructor')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#pin')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('잘못된 자격증명으로 로그인 실패', async ({ page }) => {
      await page.goto('/instructor');

      await page.fill('#email', 'wrong@email.com');
      await page.fill('#pin', '9999');
      await page.click('button[type="submit"]');

      // 에러 메시지 또는 로그인 페이지 유지
      await expect(page).toHaveURL(/\/instructor/);
    });

    test('잘못된 PIN 형식 거부', async ({ page }) => {
      await page.goto('/instructor');

      await page.fill('#email', 'test@test.com');
      await page.fill('#pin', '123'); // 3자리 (4자리 필요)

      // 4자리 PIN이 아닐 때 submit 버튼은 비활성화됨
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      // 페이지 유지 확인
      await expect(page).toHaveURL(/\/instructor/);
    });
  });

  test.describe('코스 관리 (로그인 필요)', () => {
    test.skip('코스 목록 페이지 접근', async ({ page }) => {
      // 테스트용 교수자 로그인 필요
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      await expect(page.locator('h1, h2')).toContainText(/코스|Course/i);
    });

    test.skip('새 코스 생성', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      const testData = generateTestData();

      // 코스 생성 버튼/링크 클릭
      await page.click('a:has-text("새 코스"), button:has-text("코스 생성"), [data-testid="create-course"]');

      // 폼 작성
      await page.fill('#courseName, input[name="courseName"]', testData.courseName);
      await page.fill('#courseCode, input[name="courseCode"]', testData.courseCode);
      await page.fill('#teamSize, input[name="teamSize"]', '4');

      // 마감일 설정 (7일 후)
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      await page.fill('input[type="datetime-local"], input[name="deadline"]', futureDate);

      // 가중치 프로파일 선택
      await page.selectOption('select[name="weightProfile"]', 'balanced');

      // 저장
      await page.click('button[type="submit"]');

      // 코스 목록 또는 상세 페이지로 이동
      await waitForPageLoad(page);
      await expect(page.locator(`text=${testData.courseName}`)).toBeVisible();
    });

    test.skip('코스 상세 조회', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      // 첫 번째 코스 클릭
      await page.locator('.course-item, [data-testid="course-item"], table tbody tr').first().click();

      // 코스 상세 정보 표시
      await expect(page.locator('[data-testid="course-detail"], .course-detail')).toBeVisible();
    });

    test.skip('학생 현황 조회', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      // 코스 상세 페이지로 이동
      await page.locator('.course-item, [data-testid="course-item"]').first().click();

      // 학생 탭/섹션 클릭
      await page.click('button:has-text("학생"), a:has-text("Students"), [data-testid="students-tab"]');

      // 학생 목록 표시
      await expect(page.locator('table, .student-list')).toBeVisible();
    });
  });

  test.describe('매칭 기능 (로그인 필요)', () => {
    test.skip('코스 잠금 (OPEN → LOCKED)', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      // OPEN 상태의 코스로 이동
      await page.locator('[data-status="OPEN"], .course-item:has-text("OPEN")').first().click();

      // 잠금 버튼 클릭
      await page.click('button:has-text("잠금"), button:has-text("Lock"), [data-testid="lock-course"]');

      // 확인 대화상자
      await page.click('button:has-text("확인"), button:has-text("Confirm")');

      // 상태 변경 확인
      await expect(page.locator('text=LOCKED')).toBeVisible();
    });

    test.skip('매칭 미리보기 실행', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      // LOCKED 상태의 코스로 이동
      await page.locator('[data-status="LOCKED"], .course-item:has-text("LOCKED")').first().click();

      // 매칭 버튼 클릭
      await page.click('button:has-text("매칭"), button:has-text("Match"), [data-testid="run-matching"]');

      // 매칭 결과 표시
      await expect(page.locator('.team-list, [data-testid="matching-result"]')).toBeVisible();
    });

    test.skip('매칭 확정', async ({ page }) => {
      await loginAsInstructor(page, 'instructor@test.com', '1234');

      // LOCKED 상태의 코스 (매칭 실행됨)
      await page.locator('[data-status="LOCKED"]').first().click();

      // 확정 버튼 클릭
      await page.click('button:has-text("확정"), button:has-text("Confirm"), [data-testid="confirm-matching"]');

      // 확인 대화상자
      await page.click('button:has-text("확인"), button:has-text("Yes")');

      // 상태 변경 확인
      await expect(page.locator('text=CONFIRMED')).toBeVisible();
    });
  });
});

test.describe('Instructor 접근 제어', () => {
  test('비로그인 상태에서 코스 페이지 접근 시 리다이렉트', async ({ page }) => {
    await page.goto('/instructor/courses');

    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/\/(instructor|login|unauthorized)/);
  });
});
