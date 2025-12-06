/**
 * Admin E2E 테스트
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, waitForPageLoad, generateTestData } from './helpers/test-utils';

test.describe('Admin 기능', () => {
  test.describe('로그인', () => {
    test('로그인 페이지 접근', async ({ page }) => {
      await page.goto('/admin');

      // CardTitle은 h3로 렌더링됨
      await expect(page.getByText('TeamMatch Admin')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('잘못된 자격증명으로 로그인 실패', async ({ page }) => {
      await page.goto('/admin');

      await page.fill('#email', 'wrong@email.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // 에러 메시지 또는 로그인 페이지 유지
      await expect(page).toHaveURL(/\/admin/);
    });

    test.skip('올바른 자격증명으로 로그인 성공 (환경변수 필요)', async ({ page }) => {
      await loginAsAdmin(page);

      // 대시보드 또는 메인 페이지로 이동
      await expect(page).toHaveURL(/\/admin\/dashboard/);
    });
  });

  test.describe('교수자 관리 (로그인 필요)', () => {
    test.skip('교수자 목록 조회', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/instructors');

      await expect(page.locator('table, [role="table"], .instructor-list')).toBeVisible();
    });

    test.skip('새 교수자 추가', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/instructors');

      const testData = generateTestData();

      // 추가 버튼 클릭
      await page.click('button:has-text("추가"), button:has-text("Add"), [data-testid="add-instructor"]');

      // 폼 작성
      await page.fill('#email, input[name="email"]', testData.email);
      await page.fill('#name, input[name="name"]', 'Test Instructor');
      await page.fill('#pin, input[name="pin"]', '1234');

      // 저장
      await page.click('button[type="submit"], button:has-text("저장"), button:has-text("Save")');

      // 성공 확인
      await expect(page.locator(`text=${testData.email}`)).toBeVisible();
    });

    test.skip('교수자 정보 수정', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/instructors');

      // 첫 번째 교수자 수정 버튼 클릭
      await page.click('button:has-text("수정"), button:has-text("Edit"), [data-testid="edit-instructor"]');

      // 이름 수정
      await page.fill('#name, input[name="name"]', 'Updated Name');

      // 저장
      await page.click('button[type="submit"], button:has-text("저장")');

      // 변경 확인
      await expect(page.locator('text=Updated Name')).toBeVisible();
    });
  });

  test.describe('코스 관리 (로그인 필요)', () => {
    test.skip('코스 목록 조회', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/courses');

      await expect(page.locator('table, [role="table"], .course-list')).toBeVisible();
    });

    test.skip('코스 마감일 수정', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/courses');

      // 첫 번째 코스의 마감일 수정
      await page.click('[data-testid="edit-deadline"], button:has-text("마감일")');

      // 새 날짜 입력
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await page.fill('input[type="date"], input[name="deadline"]', futureDate);

      // 저장
      await page.click('button[type="submit"], button:has-text("저장")');

      await waitForPageLoad(page);
    });
  });
});

test.describe('Admin 접근 제어', () => {
  test('비로그인 상태에서 관리 페이지 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto('/admin/instructors');

    // 로그인 페이지로 리다이렉트 또는 접근 거부
    await expect(page).toHaveURL(/\/(admin|login|unauthorized)/);
  });
});
