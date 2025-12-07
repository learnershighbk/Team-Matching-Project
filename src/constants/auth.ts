import { match } from "ts-pattern";

// 공개 경로 (인증 불필요)
const PUBLIC_PATHS = ["/", "/login", "/signup"] as const;
const PUBLIC_PREFIXES = [
  "/_next",
  "/api/admin/login",
  "/api/instructor/login",
  "/api/student/auth",
  "/api/auth/logout",
  "/api/course",
  "/favicon",
  "/static",
  "/docs",
  "/images",
] as const;

// 기본 로그인 페이지 (역할 선택)
export const LOGIN_PATH = "/login";

// 역할별 로그인 페이지
export const ADMIN_LOGIN_PATH = "/admin";
export const INSTRUCTOR_LOGIN_PATH = "/instructor";
export const STUDENT_AUTH_PATH_PATTERN = "/course/[uuid]";

// 역할별 보호된 경로
export const PROTECTED_ROUTES = {
  admin: ["/admin/dashboard", "/api/admin"],
  instructor: ["/instructor/dashboard", "/api/instructor"],
  student: ["/course", "/api/student"],
} as const;

// 공개 경로 확인 (로그인 페이지 포함)
export const isAuthPublicPath = (pathname: string) => {
  const normalized = pathname.toLowerCase();

  return match(normalized)
    .when(
      (path) => PUBLIC_PATHS.some((publicPath) => publicPath === path),
      () => true
    )
    .when(
      (path) => PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix)),
      () => true
    )
    .when(
      (path) => path === ADMIN_LOGIN_PATH || path.startsWith(ADMIN_LOGIN_PATH + "/"),
      () => true
    )
    .when(
      (path) =>
        path === INSTRUCTOR_LOGIN_PATH ||
        path.startsWith(INSTRUCTOR_LOGIN_PATH + "/"),
      () => true
    )
    .when(
      (path) => /^\/course\/[^/]+$/.test(path), // /course/[uuid] 패턴
      () => true
    )
    .otherwise(() => false);
};

// 보호된 경로 확인
export const shouldProtectPath = (pathname: string) =>
  !isAuthPublicPath(pathname);

// 경로가 특정 역할의 보호된 경로인지 확인
export function hasAccess(pathname: string, role: "admin" | "instructor" | "student"): boolean {
  const allowedRoutes = PROTECTED_ROUTES[role];
  if (!allowedRoutes) return false;

  return allowedRoutes.some((route) => {
    if (route.includes("*")) {
      const regex = new RegExp(route.replace("*", "[^/]+"));
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });
}

