"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useAuth();

  // 사용자 표시 이름 결정
  const displayName = useMemo(() => {
    if (!user) return "알 수 없는 사용자";
    if (user.role === "admin") return user.email;
    if (user.role === "instructor") return user.email;
    if (user.role === "student") return `학번 ${user.studentNumber}`;
    return "알 수 없는 사용자";
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return "";
    if (user.role === "admin") return "시스템 관리자";
    if (user.role === "instructor") return "교수자";
    if (user.role === "student") return "학생";
    return "";
  }, [user]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">대시보드</h1>
        <p className="text-slate-500">
          {displayName} 님, 환영합니다.
        </p>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Image
          alt="대시보드"
          src="https://picsum.photos/seed/dashboard/960/420"
          width={960}
          height={420}
          className="h-auto w-full object-cover"
        />
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">현재 역할</h2>
          <p className="mt-2 text-sm text-slate-500">
            {roleLabel} 권한으로 로그인되어 있습니다.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-lg font-medium">보안 체크</h2>
          <p className="mt-2 text-sm text-slate-500">
            JWT 기반 인증으로 보호된 페이지입니다.
          </p>
        </article>
      </section>
    </div>
  );
}
