-- Migration: Create ENUM types for TeamMatch
-- 참조: DATABASE.md 섹션 3.1

-- pgcrypto 확장 (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM 타입 조건부 생성 (이미 존재하면 무시)
DO $$ BEGIN
  -- 가중치 프로파일
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weight_profile_enum') THEN
    CREATE TYPE weight_profile_enum AS ENUM (
      'balanced',
      'skill_heavy',
      'skill_role_focused',
      'diversity_heavy'
    );
  END IF;

  -- 코스 상태
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status_enum') THEN
    CREATE TYPE course_status_enum AS ENUM (
      'OPEN',
      'LOCKED',
      'CONFIRMED'
    );
  END IF;

  -- 전공
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'major_enum') THEN
    CREATE TYPE major_enum AS ENUM (
      'MPP',
      'MDP',
      'MPM',
      'MDS',
      'MIPD',
      'MPPM',
      'PhD'
    );
  END IF;

  -- 성별
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE gender_enum AS ENUM (
      'male',
      'female',
      'other'
    );
  END IF;

  -- 대륙
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'continent_enum') THEN
    CREATE TYPE continent_enum AS ENUM (
      'asia',
      'africa',
      'europe',
      'north_america',
      'south_america',
      'oceania'
    );
  END IF;

  -- 역할
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    CREATE TYPE role_enum AS ENUM (
      'leader',
      'executor',
      'ideator',
      'coordinator'
    );
  END IF;

  -- 역량
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_enum') THEN
    CREATE TYPE skill_enum AS ENUM (
      'data_analysis',
      'research',
      'writing',
      'visual',
      'presentation'
    );
  END IF;

  -- 시간대
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_enum') THEN
    CREATE TYPE time_enum AS ENUM (
      'weekday_daytime',
      'weekday_evening',
      'weekend'
    );
  END IF;

  -- 목표 성향
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_enum') THEN
    CREATE TYPE goal_enum AS ENUM (
      'a_plus',
      'balanced',
      'minimum'
    );
  END IF;
END $$;


