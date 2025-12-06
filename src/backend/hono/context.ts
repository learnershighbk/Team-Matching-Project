import type { Context } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TokenPayload } from '@/features/auth/backend/jwt';

export type AppLogger = Pick<Console, 'info' | 'error' | 'warn' | 'debug'>;

export type AppConfig = {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
};

export type AppVariables = {
  supabase: SupabaseClient;
  logger: AppLogger;
  config: AppConfig;
  auth?: TokenPayload;
  validated?: unknown;
  validatedParams?: unknown;
  validatedQuery?: unknown;
};

export type AppEnv = {
  Variables: AppVariables;
};

export type AppContext = Context<AppEnv>;

export const contextKeys = {
  supabase: 'supabase',
  logger: 'logger',
  config: 'config',
  auth: 'auth',
  validated: 'validated',
  validatedParams: 'validatedParams',
  validatedQuery: 'validatedQuery',
} as const;

export const getSupabase = (c: AppContext) =>
  c.get(contextKeys.supabase) as SupabaseClient;

export const getLogger = (c: AppContext) =>
  c.get(contextKeys.logger) as AppLogger;

export const getConfig = (c: AppContext) =>
  c.get(contextKeys.config) as AppConfig;

export const getAuth = (c: AppContext) =>
  c.get(contextKeys.auth) as TokenPayload | undefined;
