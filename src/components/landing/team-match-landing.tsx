"use client";

// ============================================================================
// CUSTOMIZATION - 이 섹션의 값들을 수정하여 프로젝트에 맞게 조정하세요
// ============================================================================

const COLORS = {
  light: {
    background: "#F5F5F5",
    cardBackground: "#FFFFFF",
    accent: "#EF6C35",
    accentHover: "#FF8A55",
    heading: "#1a1a1a",
    subheading: "#2f2f2f",
    description: "#5a5a5a",
    iconText: "#2f2f2f",
    border: "#e0e0e0",
    tagBg: "#f0f0f0",
  },
  dark: {
    background: "#1a1a1a",
    cardBackground: "#252525",
    accent: "#FF7A45",
    accentHover: "#FF9A65",
    heading: "#ffffff",
    subheading: "#e0e0e0",
    description: "#a0a0a0",
    iconText: "#e0e0e0",
    border: "#333333",
    tagBg: "#2a2a2a",
  },
};

// ============================================================================
// END CUSTOMIZATION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Shuffle,
  Target,
  Scale,
  Zap,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function TeamMatchLanding({ mode = "light" }: { mode?: "light" | "dark" }) {
  const colors = COLORS[mode];

  const steps = [
    {
      icon: BookOpen,
      title: "COURSE CREATION",
      description: "교수자가 코스를 생성하고 매칭 설정을 구성합니다",
    },
    {
      icon: Users,
      title: "PROFILE INPUT",
      description: "학생들이 자신의 역량, 선호도, 일정 정보를 입력합니다",
    },
    {
      icon: Zap,
      title: "AI MATCHING",
      description: "AI가 7가지 요소를 분석하여 최적의 팀을 구성합니다",
    },
    {
      icon: CheckCircle2,
      title: "TEAM CONFIRM",
      description: "매칭 결과를 확인하고 팀 활동을 시작합니다",
    },
  ];

  const features = [
    {
      icon: Target,
      title: "7가지 매칭 요소",
      description: "시간대 호환성, 역량 다양성, 역할 균형, 전공 다양성, 목표 일치, 지역 다양성, 성별 균형",
      tags: ["시간대", "역량", "역할", "전공", "목표", "지역", "성별"],
    },
    {
      icon: UserCheck,
      title: "No-Orphan 보장",
      description: "1인 팀이 생성되지 않도록 설계되어 모든 학생이 균등하게 팀에 배정됩니다.",
    },
    {
      icon: Shuffle,
      title: "최적화 알고리즘",
      description: "Local Swap 알고리즘으로 팀 간 점수 차이를 최소화하여 공정한 팀 구성을 보장합니다.",
    },
    {
      icon: Scale,
      title: "맞춤형 가중치",
      description: "Balanced, Skill-heavy, Diversity-heavy 등 프로젝트 목적에 맞는 가중치를 설정합니다.",
      tags: ["Balanced", "Skill-heavy", "Diversity-heavy"],
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: colors.background,
        fontFamily: "'Inter', sans-serif",
        color: colors.heading,
      }}
    >
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-4 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">TeamMatch</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            className="text-base font-medium px-5 py-2.5 rounded-lg transition-colors"
            style={{ color: colors.description }}
          >
            소개
          </button>
          <Link
            href="/login"
            className="text-base font-medium px-6 py-2.5 rounded-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
          >
            로그인
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-base font-medium mb-10"
            style={{
              backgroundColor: `${colors.accent}15`,
              color: colors.accent,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
            KDI School 공식 팀 매칭 솔루션
          </motion.div>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            style={{ color: colors.heading }}
          >
            AI 기반 팀 프로젝트
            <br />
            <span style={{ color: colors.accent }}>매칭 서비스</span>
          </h1>

          {/* Description */}
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
            style={{ color: colors.description }}
          >
            학생들의 <strong style={{ color: colors.subheading }}>역량, 선호도, 일정</strong>을 종합적으로 분석하여
            <br className="hidden md:block" />
            균형 잡힌 최적의 팀을 자동으로 구성합니다
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/instructor"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-white font-semibold text-xl shadow-lg transition-all"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 10px 40px ${colors.accent}40`,
              }}
            >
              시작하기
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-24"
        style={{ backgroundColor: mode === "light" ? "#ffffff" : colors.cardBackground }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.heading }}
            >
              How It Works
            </h2>
            <p className="text-lg md:text-xl" style={{ color: colors.description }}>
              4단계로 완성되는 최적의 팀 구성
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                {/* Step Number */}
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${colors.accent}10` }}
                  >
                    <step.icon
                      className="w-10 h-10"
                      style={{ color: colors.accent }}
                    />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-sm md:text-base font-bold tracking-wider mb-3"
                  style={{ color: colors.subheading }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="text-base leading-relaxed max-w-[240px]"
                  style={{ color: colors.description }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: colors.heading }}
          >
            핵심 기능
          </h2>
          <p className="text-lg md:text-xl" style={{ color: colors.description }}>
            TeamMatch만의 차별화된 매칭 알고리즘
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl p-10 transition-all hover:shadow-lg"
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${colors.accent}10` }}
                >
                  <feature.icon
                    className="w-8 h-8"
                    style={{ color: colors.accent }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3"
                    style={{ color: colors.heading }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-5"
                    style={{ color: colors.description }}
                  >
                    {feature.description}
                  </p>

                  {/* Tags */}
                  {feature.tags && (
                    <div className="flex flex-wrap gap-2.5">
                      {feature.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-1.5 rounded-lg text-sm font-medium"
                          style={{
                            backgroundColor: colors.tagBg,
                            color: colors.subheading,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-20"
        style={{ backgroundColor: mode === "light" ? "#ffffff" : colors.cardBackground }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 gap-12 text-center"
          >
            {[
              { value: "500+", label: "매칭된 팀" },
              { value: "2,000+", label: "참여 학생" },
              { value: "98%", label: "만족도" },
            ].map((stat, index) => (
              <div key={stat.label}>
                <div
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
                  style={{ color: colors.accent }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-base md:text-lg"
                  style={{ color: colors.description }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center rounded-3xl py-20 px-8"
          style={{
            backgroundColor: `${colors.accent}08`,
            border: `1px solid ${colors.accent}20`,
          }}
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
            style={{ color: colors.heading }}
          >
            지금 바로 시작하세요
          </h2>
          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            style={{ color: colors.description }}
          >
            AI 기반 팀 매칭으로 더 효과적인 협업을 경험하세요
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/instructor"
              className="inline-flex items-center gap-3 px-12 py-5 rounded-xl text-white font-semibold text-xl shadow-lg transition-all"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 10px 40px ${colors.accent}40`,
              }}
            >
              TeamMatch 시작하기
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="py-16 border-t"
        style={{ borderColor: colors.border }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">TeamMatch</span>
              <span
                className="text-base ml-2"
                style={{ color: colors.description }}
              >
                by KDI School
              </span>
            </div>

            <div className="flex gap-8 text-base" style={{ color: colors.description }}>
              <a href="#" className="hover:opacity-70 transition-opacity">
                이용약관
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                개인정보처리방침
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                문의하기
              </a>
            </div>

            <div className="text-base" style={{ color: colors.description }}>
              © 2024 KDI School. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

