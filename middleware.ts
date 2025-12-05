import { NextResponse, type NextRequest } from "next/server";
import {
  shouldProtectPath,
  hasAccess,
  ADMIN_LOGIN_PATH,
  INSTRUCTOR_LOGIN_PATH,
} from "@/constants/auth";
import { verifyToken, getRole } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/cookie";

/**
 * 역할별 로그인 페이지로 리다이렉트
 */
function redirectToLogin(
  request: NextRequest,
  role?: "admin" | "instructor" | "student"
): NextResponse {
  const { pathname } = request.nextUrl;

  // 역할에 따라 적절한 로그인 페이지로 리다이렉트
  if (role === "admin" || pathname.startsWith("/admin")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role === "instructor" || pathname.startsWith("/instructor")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = INSTRUCTOR_LOGIN_PATH;
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Student는 courseId가 필요하므로 루트로 리다이렉트
  // (실제로는 course/[uuid] 페이지에서 처리)
  return NextResponse.redirect(new URL("/", request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (!shouldProtectPath(pathname)) {
    return NextResponse.next();
  }

  // 토큰 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  // 토큰 검증
  const payload = await verifyToken(token);

  if (!payload) {
    // 토큰이 유효하지 않음 (만료, 서명 오류 등)
    const response = redirectToLogin(request);
    // 쿠키 삭제
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  // 역할 확인
  const role = getRole(payload);

  if (!role) {
    return redirectToLogin(request);
  }

  // 경로 권한 확인
  if (!hasAccess(pathname, role)) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "AUTH_003", message: "권한이 없습니다" },
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
