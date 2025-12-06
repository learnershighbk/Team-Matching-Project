import axios, { isAxiosError } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 포함
});

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const extractApiErrorCode = (error: unknown): string | undefined => {
  // Error 객체에 code 속성이 있는 경우 (useAuth 등에서 설정한 경우)
  if (error instanceof Error && (error as any).code) {
    return (error as any).code;
  }
  
  // axios 에러인 경우
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;
    return payload?.error?.code;
  }
  
  return undefined;
};

export { apiClient, isAxiosError };
