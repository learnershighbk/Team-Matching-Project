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

import React, { useState } from "react";
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
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Language = "ko" | "en";

const translations = {
  ko: {
    nav: {
      login: "로그인",
    },
    hero: {
      badge: "KDI School 공식 팀 매칭 솔루션",
      title: "AI 기반 팀 프로젝트",
      titleAccent: "매칭 서비스",
      description: "학생들의",
      descriptionHighlight: "스킬, 선호도, 일정",
      descriptionEnd: "을 종합적으로 분석하여",
      descriptionEndLine: "균형 잡힌 최적의 팀을 자동으로 구성합니다",
      cta: "시작하기",
    },
    steps: {
      title: "How It Works",
      subtitle: "4단계로 완성되는 최적의 팀 구성",
      courseCreation: {
        title: "COURSE CREATION",
        description: "교수자가 코스를 생성하고 매칭 설정을 구성합니다",
      },
      profileInput: {
        title: "PROFILE INPUT",
        description: "학생들이 자신의 스킬, 선호도, 일정 정보를 입력합니다",
      },
      aiMatching: {
        title: "AI MATCHING",
        description: "AI가 7가지 요소를 분석하여 최적의 팀을 구성합니다",
      },
      teamConfirm: {
        title: "TEAM CONFIRM",
        description: "매칭 결과를 확인하고 팀 활동을 시작합니다",
      },
    },
    features: {
      title: "핵심 기능",
      subtitle: "TeamMatch만의 차별화된 매칭 알고리즘",
      matchingFactors: {
        title: "7가지 매칭 요소",
        description: "시간대 호환성, 스킬 다양성, 역할 균형, 전공 다양성, 목표 일치, 지역 다양성, 성별 균형",
        tags: ["시간대", "스킬", "역할", "전공", "목표", "지역", "성별"],
      },
      noOrphan: {
        title: "No-Orphan 보장",
        description: "1인 팀이 생성되지 않도록 설계되어 모든 학생이 균등하게 팀에 배정됩니다.",
      },
      optimization: {
        title: "최적화 알고리즘",
        description: "Local Swap 알고리즘으로 팀 간 점수 차이를 최소화하여 공정한 팀 구성을 보장합니다.",
      },
      weights: {
        title: "맞춤형 가중치",
        description: "Balanced, Skill-heavy, Diversity-heavy 등 프로젝트 목적에 맞는 가중치를 설정합니다.",
        tags: ["Balanced", "Skill-heavy", "Diversity-heavy"],
      },
    },
    stats: {
      matchedTeams: "매칭된 팀",
      students: "참여 학생",
      satisfaction: "만족도",
    },
    cta: {
      title: "지금 바로 시작하세요",
      description: "AI 기반 팀 매칭으로 더 효과적인 협업을 경험하세요",
      button: "TeamMatch 시작하기",
    },
    footer: {
      terms: "이용약관",
      privacy: "개인정보처리방침",
      contact: "문의하기",
      copyright: "© 2025 KDI School. All rights reserved.",
    },
    termsDialog: {
      effectiveDate: (year: number, month: number, day: number) => `${year}년 ${month}월 ${day}일 시행`,
      article1: {
        title: "제1조 (목적)",
        content: "본 약관은 KDI국제정책대학원(이하 \"학교\")이 운영하는 TeamMatch 서비스(이하 \"서비스\")의 이용과 관련하여 학교와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
      },
      article2: {
        title: "제2조 (용어의 정의)",
        items: [
          "\"서비스\"란 학교가 제공하는 AI 기반 팀 프로젝트 매칭 플랫폼을 의미합니다.",
          "\"이용자\"란 본 약관에 따라 서비스를 이용하는 교수자, 학생, 관리자를 의미합니다.",
          "\"매칭\"이란 학생들의 프로필 정보를 기반으로 AI 알고리즘을 통해 팀을 구성하는 것을 의미합니다.",
        ],
      },
      article3: {
        title: "제3조 (약관의 효력 및 변경)",
        items: [
          "본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.",
          "학교는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 전항과 같은 방법으로 공지함으로써 효력을 발생합니다.",
          "이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.",
        ],
      },
      article4: {
        title: "제4조 (서비스의 제공)",
        items: [
          "학교는 다음 각 호의 서비스를 제공합니다: 코스 생성 및 관리, 학생 프로필 입력, AI 기반 팀 매칭, 팀 결과 확인",
          "서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 다만, 시스템 점검, 서버의 증설 및 교체 등 필요한 경우 서비스가 일시 중단될 수 있습니다.",
          "학교는 서비스 제공에 필요한 경우 정기 또는 임시로 서비스 이용을 제한할 수 있습니다.",
        ],
      },
      article5: {
        title: "제5조 (이용자의 의무)",
        intro: "이용자는 서비스를 이용할 때 다음 각 호의 행위를 하여서는 안 됩니다:",
        prohibitedItems: [
          "타인의 정보 도용 또는 허위정보 입력",
          "서비스의 안정적 운영을 방해하는 행위",
          "다른 이용자의 서비스 이용을 방해하는 행위",
          "관련 법령 및 본 약관에서 금지하는 행위",
        ],
        accountResponsibility: "이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있으며, 계정 정보의 부정사용으로 인한 모든 책임은 이용자에게 있습니다.",
      },
      article6: {
        title: "제6조 (서비스 이용의 제한)",
        content: "학교는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.",
      },
      article7: {
        title: "제7조 (면책사항)",
        items: [
          "학교는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.",
          "학교는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.",
          "학교는 이용자가 서비스를 이용하여 기대하는 매칭 결과에 대해 보장하지 않으며, 매칭 결과에 대한 최종 결정권은 해당 코스의 교수자에게 있습니다.",
        ],
      },
      article8: {
        title: "제8조 (분쟁의 해결)",
        content: "본 약관에 명시되지 않은 사항은 관계법령 및 상관례에 따르며, 학교와 이용자 간에 발생한 분쟁에 대하여는 대한민국 법을 적용하며, 관할법원은 학교 소재지를 관할하는 법원으로 합니다.",
      },
    },
    privacyDialog: {
      effectiveDate: (year: number, month: number, day: number) => `${year}년 ${month}월 ${day}일 시행`,
      section1: {
        title: "1. 수집하는 개인정보의 항목 및 수집방법",
        intro: "KDI국제정책대학원(이하 \"학교\")은 TeamMatch 서비스 제공을 위해 다음의 개인정보를 수집합니다:",
        requiredTitle: "필수 수집 항목",
        requiredItems: [
          "교수자/학생: 학번, 이름, 이메일",
          "학생 프로필: 기술 스킬, 선호 역할, 시간대, 전공, 목표, 지역, 성별 등",
        ],
        autoTitle: "자동 수집 항목",
        autoItems: [
          "IP 주소, 쿠키, 접속 로그, 서비스 이용 기록",
        ],
      },
      section2: {
        title: "2. 개인정보의 수집 및 이용목적",
        items: [
          { label: "서비스 제공:", content: "팀 매칭 기능 수행, 코스 관리, 학생 프로필 관리" },
          { label: "서비스 개선:", content: "매칭 알고리즘 최적화, 사용자 경험 개선" },
          { label: "안전한 서비스 제공:", content: "부정 이용 방지, 서비스 안정성 확보" },
        ],
      },
      section3: {
        title: "3. 개인정보의 보유 및 이용기간",
        items: [
          "학교는 이용자가 서비스를 이용하는 동안 개인정보를 보유 및 이용합니다.",
          "이용자가 서비스 이용을 종료하거나 회원 탈퇴를 요청한 경우, 수집 목적이 달성된 즉시 해당 개인정보를 파기합니다.",
          "다만, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.",
        ],
      },
      section4: {
        title: "4. 개인정보의 제3자 제공",
        intro: "학교는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:",
        items: [
          "이용자가 사전에 동의한 경우",
          "법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우",
        ],
      },
      section5: {
        title: "5. 개인정보의 처리 위탁",
        content: "학교는 서비스 향상을 위해 개인정보 처리 업무를 외부 전문업체에 위탁할 수 있으며, 이 경우 관련 법령에 따라 위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 감독합니다.",
      },
      section6: {
        title: "6. 이용자의 권리 및 행사방법",
        items: [
          "이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.",
          "이용자는 개인정보 처리 정지 요구 등 관련 법령이 정한 권리를 행사할 수 있습니다.",
          "권리 행사는 서비스 내 개인정보 관리 메뉴를 통해 가능하며, 교육혁신팀으로 문의하실 수 있습니다.",
        ],
      },
      section7: {
        title: "7. 개인정보의 파기",
        intro: "학교는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다:",
        items: [
          { label: "파기절차:", content: "이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다." },
          { label: "파기방법:", content: "전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다." },
        ],
      },
      section8: {
        title: "8. 개인정보 보호책임자",
        intro: "학교는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
        department: "소속:",
        departmentValue: "KDI국제정책대학원 교육혁신팀",
        email: "이메일:",
        phone: "전화:",
      },
      section9: {
        title: "9. 개인정보 처리방침 변경",
        content: "이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.",
      },
    },
    contactDialog: {
      description: "TeamMatch 서비스 이용 관련 문의사항이 있으시면 아래 연락처로 문의해주세요.",
      department: "소속",
      departmentValue: "KDI국제정책대학원 교육혁신팀",
      email: "이메일",
      phone: "전화",
      hours: "운영 시간: 평일 09:00 ~ 18:00 (주말 및 공휴일 제외)",
      response: "문의 접수 후 영업일 기준 1~2일 내에 답변드리겠습니다.",
    },
  },
  en: {
    nav: {
      login: "Login",
    },
    hero: {
      badge: "KDI School Official Team Matching Solution",
      title: "AI-Powered Team Project",
      titleAccent: "Matching Service",
      description: "Comprehensively analyze students'",
      descriptionHighlight: "skills, preferences, and schedules",
      descriptionEnd: "to",
      descriptionEndLine: "automatically form balanced, optimal teams",
      cta: "Get Started",
    },
    steps: {
      title: "How It Works",
      subtitle: "Optimal team formation in 4 steps",
      courseCreation: {
        title: "COURSE CREATION",
        description: "Instructors create courses and configure matching settings",
      },
      profileInput: {
        title: "PROFILE INPUT",
        description: "Students input their skills, preferences, and schedule information",
      },
      aiMatching: {
        title: "AI MATCHING",
        description: "AI analyzes 7 factors to form optimal teams",
      },
      teamConfirm: {
        title: "TEAM CONFIRM",
        description: "Review matching results and start team activities",
      },
    },
    features: {
      title: "Key Features",
      subtitle: "TeamMatch's differentiated matching algorithm",
      matchingFactors: {
        title: "7 Matching Factors",
        description: "Time zone compatibility, skill diversity, role balance, major diversity, goal alignment, regional diversity, gender balance",
        tags: ["Time Zone", "Skill", "Role", "Major", "Goal", "Region", "Gender"],
      },
      noOrphan: {
        title: "No-Orphan Guarantee",
        description: "Designed to prevent single-person teams, ensuring all students are equally assigned to teams.",
      },
      optimization: {
        title: "Optimization Algorithm",
        description: "Local Swap algorithm minimizes score differences between teams, ensuring fair team formation.",
      },
      weights: {
        title: "Customizable Weights",
        description: "Set weights such as Balanced, Skill-heavy, and Diversity-heavy to match project objectives.",
        tags: ["Balanced", "Skill-heavy", "Diversity-heavy"],
      },
    },
    stats: {
      matchedTeams: "Matched Teams",
      students: "Participating Students",
      satisfaction: "Satisfaction Rate",
    },
    cta: {
      title: "Get Started Now",
      description: "Experience more effective collaboration with AI-based team matching",
      button: "Start TeamMatch",
    },
    footer: {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact Us",
      copyright: "© 2025 KDI School. All rights reserved.",
    },
    termsDialog: {
      effectiveDate: (year: number, month: number, day: number) => `Effective as of ${month}/${day}/${year}`,
      article1: {
        title: "Article 1 (Purpose)",
        content: "These Terms of Service (\"Terms\") govern the use of the TeamMatch service (\"Service\") operated by KDI School of Public Policy and Management (\"School\"), and establish the rights, obligations, and responsibilities between the School and users.",
      },
      article2: {
        title: "Article 2 (Definitions)",
        items: [
          "\"Service\" refers to the AI-based team project matching platform provided by the School.",
          "\"User\" refers to instructors, students, and administrators who use the Service in accordance with these Terms.",
          "\"Matching\" refers to the formation of teams through AI algorithms based on students' profile information.",
        ],
      },
      article3: {
        title: "Article 3 (Effectiveness and Amendment of Terms)",
        items: [
          "These Terms take effect when posted on the Service screen or notified to users by other means.",
          "The School may amend these Terms as necessary within the scope not violating relevant laws, and amended Terms take effect when notified in the same manner as the preceding paragraph.",
          "Users may discontinue use of the Service and terminate the user agreement if they do not agree to the amended Terms.",
        ],
      },
      article4: {
        title: "Article 4 (Provision of Service)",
        items: [
          "The School provides the following services: course creation and management, student profile input, AI-based team matching, and team result confirmation.",
          "The Service is provided 24 hours a day, 365 days a year, in principle. However, the Service may be temporarily suspended when necessary, such as for system maintenance, server expansion, or replacement.",
          "The School may restrict Service use regularly or temporarily when necessary for Service provision.",
        ],
      },
      article5: {
        title: "Article 5 (User Obligations)",
        intro: "Users must not engage in the following acts when using the Service:",
        prohibitedItems: [
          "Unauthorized use of others' information or input of false information",
          "Acts that interfere with the stable operation of the Service",
          "Acts that interfere with other users' use of the Service",
          "Acts prohibited by relevant laws and these Terms",
        ],
        accountResponsibility: "Users are responsible for securely managing their account information, and are liable for all consequences arising from unauthorized use of account information.",
      },
      article6: {
        title: "Article 6 (Restriction of Service Use)",
        content: "The School may progressively restrict Service use through warnings, temporary suspension, or permanent suspension when users violate obligations under these Terms or interfere with normal Service operation.",
      },
      article7: {
        title: "Article 7 (Disclaimer)",
        items: [
          "The School is exempt from liability for Service provision when unable to provide the Service due to natural disasters or other force majeure events.",
          "The School is not liable for Service use disruptions caused by user fault.",
          "The School does not guarantee matching results expected by users, and the final decision-making authority regarding matching results belongs to the instructor of the relevant course.",
        ],
      },
      article8: {
        title: "Article 8 (Dispute Resolution)",
        content: "Matters not specified in these Terms shall be governed by relevant laws and customary practices. Disputes between the School and users shall be governed by the laws of the Republic of Korea, and the competent court shall be the court having jurisdiction over the School's location.",
      },
    },
    privacyDialog: {
      effectiveDate: (year: number, month: number, day: number) => `Effective as of ${month}/${day}/${year}`,
      section1: {
        title: "1. Items and Methods of Personal Information Collection",
        intro: "KDI School of Public Policy and Management (\"School\") collects the following personal information to provide the TeamMatch service:",
        requiredTitle: "Required Collection Items",
        requiredItems: [
          "Instructors/Students: Student ID, Name, Email",
          "Student Profile: Technical skills, preferred roles, time slots, major, goals, region, gender, etc.",
        ],
        autoTitle: "Automatically Collected Items",
        autoItems: [
          "IP address, cookies, access logs, service usage records",
        ],
      },
      section2: {
        title: "2. Purpose of Personal Information Collection and Use",
        items: [
          { label: "Service Provision:", content: "Performing team matching functions, course management, student profile management" },
          { label: "Service Improvement:", content: "Optimizing matching algorithms, improving user experience" },
          { label: "Secure Service Provision:", content: "Preventing unauthorized use, ensuring service stability" },
        ],
      },
      section3: {
        title: "3. Retention and Use Period of Personal Information",
        items: [
          "The School retains and uses personal information while users use the Service.",
          "When users terminate Service use or request membership withdrawal, the School destroys the personal information immediately upon achieving the collection purpose.",
          "However, the School retains information for the required period when retention is necessary under relevant laws.",
        ],
      },
      section4: {
        title: "4. Third-Party Provision of Personal Information",
        intro: "The School does not provide users' personal information to third parties in principle. However, exceptions are made in the following cases:",
        items: [
          "When users have given prior consent",
          "When required by law or when investigative agencies request it in accordance with legally prescribed procedures and methods for investigative purposes",
        ],
      },
      section5: {
        title: "5. Entrustment of Personal Information Processing",
        content: "The School may entrust personal information processing tasks to external specialized companies for service improvement. In such cases, the School stipulates and supervises necessary matters to ensure personal information is securely managed in accordance with relevant laws when entering into entrustment contracts.",
      },
      section6: {
        title: "6. User Rights and Exercise Methods",
        items: [
          "Users may access, modify, and delete their personal information at any time.",
          "Users may exercise rights prescribed by relevant laws, such as requesting suspension of personal information processing.",
          "Rights may be exercised through the personal information management menu in the Service, or by contacting the Educational Innovation Team.",
        ],
      },
      section7: {
        title: "7. Destruction of Personal Information",
        intro: "The School destroys personal information without delay when it becomes unnecessary due to expiration of the retention period or achievement of processing purposes. The procedures and methods of destruction are as follows:",
        items: [
          { label: "Destruction Procedure:", content: "Information entered by users is moved to a separate database after achieving the purpose and destroyed after storage for a certain period or immediately in accordance with internal policies and other relevant laws." },
          { label: "Destruction Method:", content: "Information in electronic file format is deleted using technical methods that cannot reproduce records." },
        ],
      },
      section8: {
        title: "8. Personal Information Protection Officer",
        intro: "The School is responsible for overseeing personal information processing tasks and has designated a Personal Information Protection Officer as follows to handle complaints and provide relief for information subjects related to personal information processing:",
        department: "Department:",
        departmentValue: "KDI School Educational Innovation Team",
        email: "Email:",
        phone: "Phone:",
      },
      section9: {
        title: "9. Changes to Privacy Policy",
        content: "This Privacy Policy applies from the effective date. When there are additions, deletions, or corrections to the content in accordance with laws and policies, notice will be given through announcements 7 days before the implementation of changes.",
      },
    },
    contactDialog: {
      description: "If you have any inquiries regarding the TeamMatch service, please contact us using the information below.",
      department: "Department",
      departmentValue: "KDI School Educational Innovation Team",
      email: "Email",
      phone: "Phone",
      hours: "Operating Hours: Weekdays 09:00 ~ 18:00 (excluding weekends and holidays)",
      response: "We will respond within 1-2 business days after receiving your inquiry.",
    },
  },
};

export default function TeamMatchLanding({ mode = "light" }: { mode?: "light" | "dark" }) {
  const [language, setLanguage] = useState<Language>("ko");
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const colors = COLORS[mode];
  const t = translations[language];

  const steps = [
    {
      icon: BookOpen,
      title: t.steps.courseCreation.title,
      description: t.steps.courseCreation.description,
    },
    {
      icon: Users,
      title: t.steps.profileInput.title,
      description: t.steps.profileInput.description,
    },
    {
      icon: Zap,
      title: t.steps.aiMatching.title,
      description: t.steps.aiMatching.description,
    },
    {
      icon: CheckCircle2,
      title: t.steps.teamConfirm.title,
      description: t.steps.teamConfirm.description,
    },
  ];

  const features = [
    {
      icon: Target,
      title: t.features.matchingFactors.title,
      description: t.features.matchingFactors.description,
      tags: t.features.matchingFactors.tags,
    },
    {
      icon: UserCheck,
      title: t.features.noOrphan.title,
      description: t.features.noOrphan.description,
    },
    {
      icon: Shuffle,
      title: t.features.optimization.title,
      description: t.features.optimization.description,
    },
    {
      icon: Scale,
      title: t.features.weights.title,
      description: t.features.weights.description,
      tags: t.features.weights.tags,
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
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className="flex items-center gap-2 text-base font-medium px-5 py-2.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: colors.description }}
            title={language === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <Globe className="w-5 h-5" />
            {language === "ko" ? "EN" : "한"}
          </button>
          <Link
            href="/login"
            className="text-base font-medium px-6 py-2.5 rounded-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
          >
            {t.nav.login}
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
            {t.hero.badge}
          </motion.div>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            style={{ color: colors.heading }}
          >
            {t.hero.title}
            <br />
            <span style={{ color: colors.accent }}>{t.hero.titleAccent}</span>
          </h1>

          {/* Description */}
          <p
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
            style={{ color: colors.description }}
          >
            {t.hero.description} <strong style={{ color: colors.subheading }}>{t.hero.descriptionHighlight}</strong> {t.hero.descriptionEnd}
            <br className="hidden md:block" />
            {t.hero.descriptionEndLine}
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl text-white font-semibold text-xl shadow-lg transition-all"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 10px 40px ${colors.accent}40`,
              }}
            >
              {t.hero.cta}
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
              {t.steps.title}
            </h2>
            <p className="text-lg md:text-xl" style={{ color: colors.description }}>
              {t.steps.subtitle}
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
            {t.features.title}
          </h2>
          <p className="text-lg md:text-xl" style={{ color: colors.description }}>
            {t.features.subtitle}
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
              { value: "500+", label: t.stats.matchedTeams },
              { value: "2,000+", label: t.stats.students },
              { value: "98%", label: t.stats.satisfaction },
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
            {t.cta.title}
          </h2>
          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            style={{ color: colors.description }}
          >
            {t.cta.description}
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-12 py-5 rounded-xl text-white font-semibold text-xl shadow-lg transition-all"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 10px 40px ${colors.accent}40`,
              }}
            >
              {t.cta.button}
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
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                {t.footer.terms}
              </button>
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                {t.footer.privacy}
              </button>
              <button
                onClick={() => setContactOpen(true)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                {t.footer.contact}
              </button>
            </div>

            <div className="text-base" style={{ color: colors.description }}>
              {t.footer.copyright}
            </div>
          </div>
        </div>
      </footer>

      {/* 이용약관 Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent
          className="max-w-3xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            color: colors.heading,
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: colors.heading }}>
              {t.footer.terms}
            </DialogTitle>
            <DialogDescription style={{ color: colors.description }}>
              {t.termsDialog.effectiveDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4" style={{ color: colors.description }}>
            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article1.title}
              </h3>
              <p className="leading-relaxed">
                {t.termsDialog.article1.content}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article2.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.termsDialog.article2.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article3.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.termsDialog.article3.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article4.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.termsDialog.article4.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article5.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  {t.termsDialog.article5.intro}
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    {t.termsDialog.article5.prohibitedItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </li>
                <li>{t.termsDialog.article5.accountResponsibility}</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article6.title}
              </h3>
              <p className="leading-relaxed">
                {t.termsDialog.article6.content}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article7.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.termsDialog.article7.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.termsDialog.article8.title}
              </h3>
              <p className="leading-relaxed">
                {t.termsDialog.article8.content}
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* 개인정보처리방침 Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent
          className="max-w-3xl max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            color: colors.heading,
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: colors.heading }}>
              {t.footer.privacy}
            </DialogTitle>
            <DialogDescription style={{ color: colors.description }}>
              {t.privacyDialog.effectiveDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4" style={{ color: colors.description }}>
            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section1.title}
              </h3>
              <p className="leading-relaxed mb-2">{t.privacyDialog.section1.intro}</p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1" style={{ color: colors.subheading }}>{t.privacyDialog.section1.requiredTitle}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {t.privacyDialog.section1.requiredItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1" style={{ color: colors.subheading }}>{t.privacyDialog.section1.autoTitle}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {t.privacyDialog.section1.autoItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section2.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.privacyDialog.section2.items.map((item, idx) => (
                  <li key={idx}><strong>{item.label}</strong> {item.content}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section3.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.privacyDialog.section3.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section4.title}
              </h3>
              <p className="leading-relaxed">
                {t.privacyDialog.section4.intro}
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed mt-2">
                {t.privacyDialog.section4.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section5.title}
              </h3>
              <p className="leading-relaxed">
                {t.privacyDialog.section5.content}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section6.title}
              </h3>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                {t.privacyDialog.section6.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section7.title}
              </h3>
              <p className="leading-relaxed">
                {t.privacyDialog.section7.intro}
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed mt-2">
                {t.privacyDialog.section7.items.map((item, idx) => (
                  <li key={idx}><strong>{item.label}</strong> {item.content}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section8.title}
              </h3>
              <div className="bg-opacity-50 p-4 rounded-lg" style={{ backgroundColor: `${colors.border}20` }}>
                <p className="leading-relaxed mb-2">
                  {t.privacyDialog.section8.intro}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p><strong>{t.privacyDialog.section8.department}</strong> {t.privacyDialog.section8.departmentValue}</p>
                  <p><strong>{t.privacyDialog.section8.email}</strong> bklee@kdischool.ac.kr</p>
                  <p><strong>{t.privacyDialog.section8.phone}</strong> 044-550-1217</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3" style={{ color: colors.heading }}>
                {t.privacyDialog.section9.title}
              </h3>
              <p className="leading-relaxed">
                {t.privacyDialog.section9.content}
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* 문의하기 Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent
          className="max-w-2xl"
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            color: colors.heading,
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: colors.heading }}>
              {t.footer.contact}
            </DialogTitle>
            <DialogDescription style={{ color: colors.description }}>
              {t.contactDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.border}10` }}>
                <div className="mt-1">
                  <Users className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: colors.heading }}>
                    {t.contactDialog.department}
                  </h4>
                  <p style={{ color: colors.description }}>
                    {t.contactDialog.departmentValue}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.border}10` }}>
                <div className="mt-1">
                  <Mail className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: colors.heading }}>
                    {t.contactDialog.email}
                  </h4>
                  <a
                    href="mailto:bklee@kdischool.ac.kr"
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: colors.accent }}
                  >
                    bklee@kdischool.ac.kr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.border}10` }}>
                <div className="mt-1">
                  <Phone className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: colors.heading }}>
                    {t.contactDialog.phone}
                  </h4>
                  <a
                    href="tel:044-550-1217"
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: colors.accent }}
                  >
                    044-550-1217
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
              <p className="text-sm leading-relaxed" style={{ color: colors.description }}>
                {t.contactDialog.hours}
                <br />
                {t.contactDialog.response}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

