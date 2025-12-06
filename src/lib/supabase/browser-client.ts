/**
 * @deprecated 이 파일은 템플릿 잔재입니다.
 *
 * TeamMatch 프로젝트는 자체 JWT 인증을 사용하며,
 * 브라우저에서 Supabase를 직접 호출하지 않습니다.
 *
 * 대신 사용하세요:
 * - 인증: @/lib/auth/api-client
 * - 컨텍스트: @/lib/auth/auth-context
 *
 * 마이그레이션 완료 후 이 파일은 삭제됩니다.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/constants/env";
import type { Database } from "./types";

let client: SupabaseClient<Database> | null = null;

/**
 * @deprecated TeamMatch 인증에는 @/lib/auth/api-client를 사용하세요.
 */
export const getSupabaseBrowserClient = () => {
  console.warn(
    "[DEPRECATED] getSupabaseBrowserClient는 더 이상 사용되지 않습니다. " +
    "@/lib/auth/api-client를 사용하세요."
  );

  if (!client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) as any;
  }

  return client;
};
