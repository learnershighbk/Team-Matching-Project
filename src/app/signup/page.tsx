"use client";

import Link from "next/link";

/**
 * 템플릿 회원가입 페이지 → TeamMatch 안내로 교체
 *
 * TeamMatch 계정 생성 방식:
 * - Admin: 환경변수로 설정 (단일 계정)
 * - Instructor: Admin이 대시보드에서 생성
 * - Student: 코스 URL 최초 접속 시 자동 생성
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">TeamMatch 계정 안내</h1>
        <p className="mt-2 text-slate-500">
          TeamMatch는 별도의 회원가입이 필요 없습니다.
        </p>
      </header>

      <div className="w-full max-w-md space-y-6">
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold">Instructor (교수자)</h2>
          <p className="mt-2 text-sm text-slate-500">
            시스템 관리자(Admin)에게 계정 생성을 요청하세요.
            이메일과 4자리 PIN이 발급됩니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold">Student (학생)</h2>
          <p className="mt-2 text-sm text-slate-500">
            교수자가 공유한 코스 URL로 접속하면
            학번과 PIN으로 자동 등록됩니다.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-slate-600 underline hover:text-slate-900"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
