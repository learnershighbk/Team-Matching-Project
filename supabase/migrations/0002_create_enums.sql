-- Migration: Create ENUM types for TeamMatch
-- 참조: DATABASE.md 섹션 3.1

-- pgcrypto 확장 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 가중치 프로파일
CREATE TYPE weight_profile_enum AS ENUM (
  'balanced',
  'skill_heavy',
  'skill_role_focused',
  'diversity_heavy'
);

-- 코스 상태
CREATE TYPE course_status_enum AS ENUM (
  'OPEN',
  'LOCKED',
  'CONFIRMED'
);

-- 전공
CREATE TYPE major_enum AS ENUM (
  'MPP',
  'MDP',
  'MPM',
  'MDS',
  'MIPD',
  'MPPM',
  'PhD'
);

-- 성별
CREATE TYPE gender_enum AS ENUM (
  'male',
  'female',
  'other'
);

-- 대륙
CREATE TYPE continent_enum AS ENUM (
  'asia',
  'africa',
  'europe',
  'north_america',
  'south_america',
  'oceania'
);

-- 역할
CREATE TYPE role_enum AS ENUM (
  'leader',
  'executor',
  'ideator',
  'coordinator'
);

-- 역량
CREATE TYPE skill_enum AS ENUM (
  'data_analysis',
  'research',
  'writing',
  'visual',
  'presentation'
);

-- 시간대
CREATE TYPE time_enum AS ENUM (
  'weekday_daytime',
  'weekday_evening',
  'weekend'
);

-- 목표 성향
CREATE TYPE goal_enum AS ENUM (
  'a_plus',
  'balanced',
  'minimum'
);


