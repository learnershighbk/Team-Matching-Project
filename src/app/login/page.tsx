"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Shield,
} from "lucide-react";

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
};

export default function LoginPage() {
  const colors = COLORS.light;

  const roles = [
    {
      icon: Shield,
      title: "Admin",
      subtitle: "시스템 관리자",
      description: "교수자 계정 관리, 코스 현황 모니터링, 학생 PIN 리셋 등 시스템 전반을 관리합니다.",
      buttonText: "Admin 로그인",
      color: "#E53935",
      href: "/admin",
    },
    {
      icon: BookOpen,
      title: "Instructor",
      subtitle: "교수자",
      description: "코스 생성, 학생 현황 확인, 매칭 실행 및 팀 확정 등 코스를 운영합니다.",
      buttonText: "Instructor 로그인",
      color: "#1E88E5",
      primary: true,
      href: "/instructor",
    },
    {
      icon: GraduationCap,
      title: "Student",
      subtitle: "학생",
      description: "코스 링크를 통해 접속하여 프로필을 입력하고 팀 매칭 결과를 확인합니다.",
      buttonText: "코스 링크로 접속",
      color: "#43A047",
      href: "/login",
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
      {/* Role Cards Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: colors.heading }}
          >
            역할별 서비스
          </h2>
          <p className="text-lg md:text-xl" style={{ color: colors.description }}>
            사용자 역할에 따라 맞춤화된 기능을 제공합니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl p-10 transition-all hover:shadow-xl"
              style={{
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center mb-8"
                style={{ backgroundColor: `${role.color}15` }}
              >
                <role.icon className="w-10 h-10" style={{ color: role.color }} />
              </div>

              {/* Title */}
              <h3
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: colors.heading }}
              >
                {role.title}
              </h3>
              <p
                className="text-base md:text-lg mb-5"
                style={{ color: colors.description }}
              >
                {role.subtitle}
              </p>

              {/* Description */}
              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: colors.description }}
              >
                {role.description}
              </p>

              {/* Button */}
              <Link href={role.href}>
                <button
                  className="w-full py-4 rounded-xl font-semibold text-base md:text-lg transition-all"
                  style={{
                    backgroundColor: role.primary ? colors.accent : colors.tagBg,
                    color: role.primary ? "#ffffff" : colors.subheading,
                  }}
                >
                  {role.buttonText}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
