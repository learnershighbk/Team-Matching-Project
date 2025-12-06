/**
 * @deprecated 이 파일은 템플릿 잔재입니다.
 *
 * TeamMatch 프로젝트는 @/lib/supabase/server.ts의 createClient 또는
 * @/backend/supabase/client.ts의 createServiceClient를 사용합니다.
 *
 * 마이그레이션 완료 후 이 파일은 삭제됩니다.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/constants/env";
import type { Database } from "./types";

type WritableCookieStore = Awaited<ReturnType<typeof cookies>> & {
  set?: (options: {
    name: string;
    value: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
  }) => void;
};

/**
 * @deprecated createClient from @/lib/supabase/server를 사용하세요.
 */
export const createSupabaseServerClient = async (): Promise<
  SupabaseClient<Database>
> => {
  const cookieStore = (await cookies()) as WritableCookieStore;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (typeof cookieStore.set === "function") {
              cookieStore.set({ name, value, ...options });
            }
          });
        },
      },
    }
  ) as any;
};
