"use client";

/**
 * TeamMatch API 클라이언트
 *
 * 모든 인증 요청은 이 클라이언트를 통해 API Routes로 전달됩니다.
 * 브라우저에서 Supabase를 직접 호출하지 않습니다.
 */

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  role: "admin";
  email: string;
};

export type InstructorLoginRequest = {
  email: string;
  pin: string;
};

export type InstructorLoginResponse = {
  role: "instructor";
  instructorId: string;
  email: string;
};

export type StudentAuthRequest = {
  courseId: string;
  studentNumber: string;
  pin: string;
  isNewUser: boolean;
};

export type StudentAuthResponse = {
  role: "student";
  studentId: string;
  courseId: string;
  studentNumber: string;
};

export type CurrentUser =
  | { role: "admin"; email: string }
  | { role: "instructor"; instructorId: string; email: string }
  | { role: "student"; studentId: string; courseId: string; studentNumber: string }
  | null;

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include", // HttpOnly 쿠키 포함
    });

    return await response.json();
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "네트워크 오류가 발생했습니다." },
    };
  }
}

export const authApi = {
  // Admin 로그인
  adminLogin: (data: AdminLoginRequest) =>
    apiRequest<AdminLoginResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Instructor 로그인
  instructorLogin: (data: InstructorLoginRequest) =>
    apiRequest<InstructorLoginResponse>("/api/instructor/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Student 인증 (신규/기존)
  studentAuth: (data: StudentAuthRequest) =>
    apiRequest<StudentAuthResponse>("/api/student/auth", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 현재 사용자 조회
  getCurrentUser: () => apiRequest<CurrentUser>("/api/auth/me", { method: "GET" }),

  // 로그아웃
  logout: () => apiRequest<null>("/api/auth/logout", { method: "POST" }),
};
