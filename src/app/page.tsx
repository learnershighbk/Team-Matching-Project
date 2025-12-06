'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            TeamMatch
          </h1>
          <p className="text-xl text-blue-200 md:text-2xl">
            AI 기반 팀 프로젝트 매칭 서비스
          </p>
          <p className="max-w-2xl mx-auto text-blue-300">
            KDI School의 팀 프로젝트를 위한 최적의 팀 구성 솔루션입니다.
            학생들의 역량, 선호도, 일정을 고려하여 균형 잡힌 팀을 자동으로 구성합니다.
          </p>
        </header>

        {/* Role Selection */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Admin */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Admin</CardTitle>
              <CardDescription className="text-blue-200">
                시스템 관리자
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-100">
                교수자 계정 관리, 코스 현황 모니터링, 학생 PIN 리셋 등 시스템 전반을 관리합니다.
              </p>
              <Link href="/admin">
                <Button className="w-full bg-white text-blue-900 hover:bg-blue-50">
                  Admin 로그인
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Instructor</CardTitle>
              <CardDescription className="text-blue-200">
                교수자
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-100">
                코스 생성, 학생 현황 확인, 매칭 실행 및 팀 확정 등 코스를 운영합니다.
              </p>
              <Link href="/instructor">
                <Button className="w-full bg-white text-blue-900 hover:bg-blue-50">
                  Instructor 로그인
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Student */}
          <Card className="bg-white/10 border-white/20 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Student</CardTitle>
              <CardDescription className="text-blue-200">
                학생
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-100">
                코스 링크를 통해 접속하여 프로필을 입력하고 팀 매칭 결과를 확인합니다.
              </p>
              <p className="text-xs text-blue-300">
                * 교수자로부터 받은 코스 링크로 접속하세요
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-medium mb-1">코스 생성</h3>
              <p className="text-sm text-blue-200">교수자가 코스를 생성하고 설정합니다</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-medium mb-1">프로필 입력</h3>
              <p className="text-sm text-blue-200">학생들이 자신의 정보를 입력합니다</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-medium mb-1">매칭 실행</h3>
              <p className="text-sm text-blue-200">AI가 최적의 팀을 구성합니다</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="font-medium mb-1">팀 확정</h3>
              <p className="text-sm text-blue-200">팀 결과를 확인하고 활동을 시작합니다</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">7가지 매칭 요소</h3>
            <p className="text-sm text-blue-200">
              시간대 호환성, 역량 다양성, 역할 균형, 전공 다양성, 목표 일치, 지역 다양성, 성별 균형을 종합적으로 고려합니다.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">No-Orphan 보장</h3>
            <p className="text-sm text-blue-200">
              1인 팀이 생성되지 않도록 알고리즘이 설계되어 모든 학생이 균등하게 팀에 배정됩니다.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">최적화 알고리즘</h3>
            <p className="text-sm text-blue-200">
              Local Swap 알고리즘으로 팀 간 점수 차이를 최소화하여 공정한 팀 구성을 보장합니다.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">맞춤형 가중치</h3>
            <p className="text-sm text-blue-200">
              Balanced, Skill-heavy, Diversity-heavy 등 다양한 가중치 프로파일로 목적에 맞는 팀을 구성합니다.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-blue-300 mt-8">
          <p>KDI School Team Matching Service</p>
          <p className="mt-1">Built with Next.js, Hono, Supabase</p>
        </footer>
      </div>
    </main>
  );
}
