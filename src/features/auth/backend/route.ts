import type { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { failure, success, respond } from "@/backend/http/response";
import type { AppEnv } from "@/backend/hono/context";
import {
  verifyToken,
  signToken,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  type TokenPayload,
} from "./jwt";

/**
 * TeamMatch 인증 라우트
 *
 * - GET /auth/me: 현재 사용자 조회
 * - POST /auth/logout: 로그아웃
 * - POST /admin/login: Admin 로그인
 * - POST /instructor/login: Instructor 로그인 (TODO)
 * - POST /student/auth: Student 인증 (TODO)
 */

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  // 현재 사용자 조회
  app.get("/auth/me", async (c) => {
    const token = getCookie(c, COOKIE_NAME);

    if (!token) {
      return respond(c, success(null));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // 유효하지 않은 토큰은 삭제
      deleteCookie(c, COOKIE_NAME);
      return respond(c, success(null));
    }

    return respond(c, success(payload));
  });

  // 로그아웃
  app.post("/auth/logout", async (c) => {
    deleteCookie(c, COOKIE_NAME, { path: "/" });
    return respond(c, success(null));
  });

  // Admin 로그인
  app.post("/admin/login", async (c) => {
    const body = await c.req.json<{ email: string; password: string }>();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return respond(
        c,
        failure(500, "AUTH_CONFIG_ERROR", "Admin 계정이 설정되지 않았습니다.")
      );
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return respond(
        c,
        failure(401, "AUTH_003", "인증에 실패했습니다.")
      );
    }

    const payload: TokenPayload = {
      role: "admin",
      email: body.email,
    };

    const token = await signToken(payload);

    setCookie(c, COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 4 * 60 * 60, // 4시간
    });

    return respond(
      c,
      success({
        role: "admin" as const,
        email: body.email,
      })
    );
  });

  // TODO: Instructor 로그인
  // app.post("/instructor/login", async (c) => { ... });

  // TODO: Student 인증
  // app.post("/student/auth", async (c) => { ... });
};
