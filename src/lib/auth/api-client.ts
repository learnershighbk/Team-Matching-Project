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

    // 응답이 없거나 실패한 경우
    if (!response.ok) {
      return {
        success: false,
        error: { code: "HTTP_ERROR", message: `HTTP ${response.status}: ${response.statusText}` },
      };
    }

    // JSON 파싱 시도
    try {
      const data = await response.json();
      
      // 응답이 유효한 ApiResponse 형태인지 확인
      if (data && typeof data === 'object' && ('success' in data || 'data' in data || 'error' in data)) {
        return data as ApiResponse<T>;
      }
      
      // 유효하지 않은 응답 형태
      return {
        success: false,
        error: { code: "INVALID_RESPONSE", message: "서버 응답 형식이 올바르지 않습니다." },
      };
    } catch (jsonError) {
      // JSON 파싱 실패
      return {
        success: false,
        error: { code: "PARSE_ERROR", message: "서버 응답을 파싱할 수 없습니다." },
      };
    }
  } catch (error) {
    // 네트워크 오류 또는 기타 예외
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
