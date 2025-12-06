/**
 * Supabase Client 모킹 유틸리티
 *
 * 서비스 함수 테스트를 위한 Supabase 클라이언트 모킹
 */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
};

type MockResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
  count?: number;
};

/**
 * 체이닝 가능한 쿼리 빌더 모킹
 */
function createChainableMock(): MockQueryBuilder {
  const mock: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  // 모든 메서드가 자기 자신을 반환하도록 설정
  Object.keys(mock).forEach((key) => {
    (mock as any)[key].mockReturnValue(mock);
  });

  return mock;
}

/**
 * Mock Supabase Client 생성
 */
export function createMockSupabaseClient() {
  const queryBuilder = createChainableMock();

  const mockClient = {
    from: vi.fn().mockReturnValue(queryBuilder),
    _queryBuilder: queryBuilder,
  } as unknown as SupabaseClient & { _queryBuilder: MockQueryBuilder };

  return mockClient;
}

/**
 * 성공 응답 설정
 */
export function mockSuccess<T>(
  queryBuilder: MockQueryBuilder,
  data: T,
  options?: { count?: number }
): void {
  const response: MockResponse<T> = {
    data,
    error: null,
    count: options?.count,
  };

  queryBuilder.single.mockResolvedValue(response);
  queryBuilder.maybeSingle.mockResolvedValue(response);

  // select, insert, update, delete는 배열이나 객체를 반환할 수 있음
  queryBuilder.select.mockReturnValue({
    ...queryBuilder,
    data,
    error: null,
    count: options?.count,
  });
}

/**
 * 실패 응답 설정
 */
export function mockError(
  queryBuilder: MockQueryBuilder,
  code: string,
  message: string
): void {
  const response: MockResponse<null> = {
    data: null,
    error: { code, message },
  };

  queryBuilder.single.mockResolvedValue(response);
  queryBuilder.maybeSingle.mockResolvedValue(response);
  queryBuilder.select.mockReturnValue({
    ...queryBuilder,
    data: null,
    error: { code, message },
  });
  queryBuilder.insert.mockReturnValue({
    ...queryBuilder,
    data: null,
    error: { code, message },
  });
  queryBuilder.update.mockReturnValue({
    ...queryBuilder,
    data: null,
    error: { code, message },
  });
  queryBuilder.delete.mockReturnValue({
    ...queryBuilder,
    data: null,
    error: { code, message },
  });
}

/**
 * Not Found 에러 (PGRST116)
 */
export function mockNotFound(queryBuilder: MockQueryBuilder): void {
  mockError(queryBuilder, 'PGRST116', 'Row not found');
}

/**
 * Duplicate Key 에러 (23505)
 */
export function mockDuplicateKey(queryBuilder: MockQueryBuilder): void {
  mockError(queryBuilder, '23505', 'Duplicate key violation');
}

/**
 * 빈 결과 설정
 */
export function mockEmptyResult(queryBuilder: MockQueryBuilder): void {
  const response: MockResponse<[]> = {
    data: [],
    error: null,
    count: 0,
  };

  queryBuilder.single.mockResolvedValue({ data: null, error: null });
  queryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
  queryBuilder.select.mockReturnValue({
    ...queryBuilder,
    data: [],
    error: null,
    count: 0,
  });
}

/**
 * 쿼리 결과 직접 설정 (select 체이닝 후)
 */
export function mockSelectResult<T>(
  mockClient: SupabaseClient & { _queryBuilder: MockQueryBuilder },
  data: T,
  options?: { count?: number; error?: { code: string; message: string } | null }
): void {
  const response = {
    data,
    error: options?.error || null,
    count: options?.count,
  };

  // 체이닝 마지막에 호출되는 메서드들
  mockClient._queryBuilder.single.mockResolvedValue(response);
  mockClient._queryBuilder.maybeSingle.mockResolvedValue(response);

  // order, range 등 이후에도 결과 반환
  mockClient._queryBuilder.order.mockReturnValue({
    ...mockClient._queryBuilder,
    ...response,
  });
  mockClient._queryBuilder.range.mockReturnValue({
    ...mockClient._queryBuilder,
    ...response,
  });
}

/**
 * Insert 결과 설정
 */
export function mockInsertResult<T>(
  mockClient: SupabaseClient & { _queryBuilder: MockQueryBuilder },
  data: T,
  error?: { code: string; message: string } | null
): void {
  const insertMock = {
    ...mockClient._queryBuilder,
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data,
        error: error || null,
      }),
    }),
  };

  mockClient._queryBuilder.insert.mockReturnValue(insertMock);
}

/**
 * Update 결과 설정
 */
export function mockUpdateResult<T>(
  mockClient: SupabaseClient & { _queryBuilder: MockQueryBuilder },
  data: T,
  error?: { code: string; message: string } | null
): void {
  const updateMock = {
    ...mockClient._queryBuilder,
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data,
          error: error || null,
        }),
      }),
    }),
  };

  mockClient._queryBuilder.update.mockReturnValue(updateMock);
}

/**
 * Delete 결과 설정
 */
export function mockDeleteResult(
  mockClient: SupabaseClient & { _queryBuilder: MockQueryBuilder },
  error?: { code: string; message: string } | null
): void {
  const deleteMock = {
    ...mockClient._queryBuilder,
    eq: vi.fn().mockResolvedValue({
      data: null,
      error: error || null,
    }),
  };

  mockClient._queryBuilder.delete.mockReturnValue(deleteMock);
}
