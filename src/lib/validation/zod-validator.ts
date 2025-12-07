/**
 * Zod 검증 에러를 표준 에러 응답으로 변환하는 미들웨어
 * 
 * Hono의 zValidator와 함께 사용하여 일관된 에러 응답 제공
 */

import { z } from 'zod';
import { createErrorResponse, zodErrorToResponse } from '@/lib/errors';
import { respond } from '@/backend/http/response';
import type { Context, Next } from 'hono';
import type { AppEnv } from '@/backend/hono/context';

/**
 * Zod 스키마로 요청 본문 검증
 * 
 * @param schema Zod 스키마
 * @returns Hono 미들웨어
 */
export function validateJson<T extends z.ZodTypeAny>(
  schema: T
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async (c: Context<AppEnv>, next: Next) => {
    try {
      const body = await c.req.json();
      const parsed = schema.safeParse(body);

      if (!parsed.success) {
        return respond(c, zodErrorToResponse(parsed.error));
      }

      // 검증된 데이터를 context에 저장
      c.set('validated', parsed.data);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return respond(c, zodErrorToResponse(error));
      }
      throw error;
    }
  };
}

/**
 * Zod 스키마로 요청 파라미터 검증
 * 
 * @param schema Zod 스키마
 * @returns Hono 미들웨어
 */
export function validateParam<T extends z.ZodTypeAny>(
  schema: T
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async (c: Context<AppEnv>, next: Next) => {
    const params = c.req.param();
    const parsed = schema.safeParse(params);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    // 검증된 파라미터를 context에 저장
    c.set('validatedParams', parsed.data);
    await next();
  };
}

/**
 * Zod 스키마로 쿼리 파라미터 검증
 * 
 * @param schema Zod 스키마
 * @returns Hono 미들웨어
 */
export function validateQuery<T extends z.ZodTypeAny>(
  schema: T
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async (c: Context<AppEnv>, next: Next) => {
    const query = c.req.query();
    const parsed = schema.safeParse(query);

    if (!parsed.success) {
      return respond(c, zodErrorToResponse(parsed.error));
    }

    // 검증된 쿼리를 context에 저장
    c.set('validatedQuery', parsed.data);
    await next();
  };
}


