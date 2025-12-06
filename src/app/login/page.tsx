"use client";

import Link from "next/link";

/**
 * 템플릿 로그인 페이지 → TeamMatch 인증 안내로 교체
 *
 * TeamMatch는 역할별 전용 인증 페이지를 사용합니다:
 * - Admin: /admin
 * - Instructor: /instructor
 * - Student: /course/[uuid]
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">TeamMatch 로그인</h1>
        <p className="mt-2 text-slate-500">
          역할에 맞는 로그인 페이지를 선택하세요.
        </p>
      </header>

      <div className="grid w-full max-w-md gap-4">
        <Link
          href="/admin"
          className="flex flex-col gap-1 rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <span className="text-lg font-semibold">Admin</span>
          <span className="text-sm text-slate-500">
            시스템 관리자 로그인
          </span>
        </Link>

        <Link
          href="/instructor"
          className="flex flex-col gap-1 rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <span className="text-lg font-semibold">Instructor</span>
          <span className="text-sm text-slate-500">
            교수자 로그인 (이메일 + PIN)
          </span>
        </Link>

        <div className="flex flex-col gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <span className="text-lg font-semibold text-slate-400">Student</span>
          <span className="text-sm text-slate-400">
            코스 URL로 직접 접속하세요 (/course/[uuid])
          </span>
        </div>
      </div>
    </div>
  );
}
