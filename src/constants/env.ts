import { z } from 'zod';

// 클라이언트에서 접근 가능한 환경 변수
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

// 서버 전용 환경 변수 (클라이언트에 노출되지 않음)
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET은 최소 32자 이상이어야 합니다'),
  JWT_ISSUER: z.string().default('teammatch'),
  JWT_AUDIENCE: z.string().default('teammatch-users'),
  RATE_LIMIT_ENABLED: z.string().transform((val) => val === 'true').optional(),
  RATE_LIMIT_LOGIN_MAX: z.string().transform(Number).optional(),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.string().transform(Number).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

const _clientEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

if (!_clientEnv.success) {
  console.error('환경 변수 검증 실패:', _clientEnv.error.flatten().fieldErrors);
  throw new Error('환경 변수를 확인하세요.');
}

export const env: ClientEnv = _clientEnv.data;

// 서버 환경 변수 검증 (서버에서만 사용)
export function getServerEnv(): ServerEnv {
  const _serverEnv = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
    RATE_LIMIT_LOGIN_MAX: process.env.RATE_LIMIT_LOGIN_MAX,
    RATE_LIMIT_LOGIN_WINDOW_MS: process.env.RATE_LIMIT_LOGIN_WINDOW_MS,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  if (!_serverEnv.success) {
    console.error('서버 환경 변수 검증 실패:', _serverEnv.error.flatten().fieldErrors);
    throw new Error('서버 환경 변수를 확인하세요.');
  }

  return _serverEnv.data;
}
