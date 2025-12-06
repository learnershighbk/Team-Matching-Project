import { createMiddleware } from 'hono/factory';
import { match, P } from 'ts-pattern';
import {
  contextKeys,
  type AppEnv,
  type AppLogger,
} from '@/backend/hono/context';

export const errorBoundary = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    try {
      await next();
    } catch (error) {
      const logger = c.get(contextKeys.logger) as AppLogger | undefined;
      const message = match(error)
        .with(P.instanceOf(Error), (err) => err.message)
        .otherwise(() => 'Unexpected error');

      logger?.error?.(error);

      // API 명세에 맞게 { success: false, error: ... } 형식으로 반환
      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message,
          },
        },
        500,
      );
    }
  });
