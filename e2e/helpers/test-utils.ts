/**
 * E2E 테스트 유틸리티
 */

import { Page, expect } from '@playwright/test';

/**
 * Admin 로그인
 */
export async function loginAsAdmin(page: Page, email?: string, password?: string) {
  const adminEmail = email || process.env.ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = password || process.env.ADMIN_PASSWORD || 'testpassword';

  await page.goto('/admin');
  await page.fill('#email', adminEmail);
  await page.fill('#password', adminPassword);
  await page.click('button[type="submit"]');

  // 로그인 성공 대기
  await page.waitForURL(/\/admin\/dashboard/);
}

/**
 * Instructor 로그인
 */
export async function loginAsInstructor(page: Page, email: string, pin: string) {
  await page.goto('/instructor');
  await page.fill('#email', email);
  await page.fill('#pin', pin);
  await page.click('button[type="submit"]');

  // 로그인 성공 대기
  await page.waitForURL(/\/instructor\/dashboard/);
}

/**
 * Student 로그인/등록
 */
export async function loginAsStudent(page: Page, courseId: string, studentNumber: string, pin: string) {
  await page.goto(`/course/${courseId}`);

  // 1단계: 학번 입력
  await page.fill('#studentNumber', studentNumber);
  await page.click('button:has-text("다음")');

  // 2단계: PIN 입력
  await page.fill('#pin', pin);
  await page.click('button:has-text("로그인")');

  // 로그인/등록 성공 대기
  await page.waitForURL(/\/course\/.*\/(profile|team|waiting)/);
}

/**
 * 에러 메시지 확인
 */
export async function expectError(page: Page, message?: string) {
  const errorElement = page.locator('[role="alert"], .error, [class*="error"], [data-state="destructive"]');
  await expect(errorElement).toBeVisible();
  if (message) {
    await expect(errorElement).toContainText(message);
  }
}

/**
 * 성공 메시지 확인
 */
export async function expectSuccess(page: Page, message?: string) {
  const successElement = page.locator('[role="status"], .success, [class*="success"]');
  await expect(successElement).toBeVisible();
  if (message) {
    await expect(successElement).toContainText(message);
  }
}

/**
 * 페이지 로딩 완료 대기
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * 폼 필드 채우기
 */
export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [name, value] of Object.entries(fields)) {
    // ID 기반 셀렉터 우선, name 속성 폴백
    const input = page.locator(`#${name}, input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
    const tagName = await input.evaluate(el => el.tagName.toLowerCase());

    if (tagName === 'select') {
      await input.selectOption(value);
    } else {
      await input.fill(value);
    }
  }
}

/**
 * 테스트 데이터 생성
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    studentNumber: `2024${String(timestamp).slice(-5)}`,
    pin: '1234',
    courseName: `Test Course ${timestamp}`,
    courseCode: `TC${String(timestamp).slice(-4)}`,
  };
}
