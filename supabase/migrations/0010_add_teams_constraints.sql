-- Migration: Add constraints to teams table
-- 참조: TECHNICAL_REVIEW.md 섹션 2.5
-- Phase 4: Low Priority - 데이터베이스 스키마 검증

-- teams.top_factors 배열 길이 제약 추가 (최대 2개 요소)
ALTER TABLE teams
  ADD CONSTRAINT teams_top_factors_max_length 
  CHECK (array_length(top_factors, 1) IS NULL OR array_length(top_factors, 1) <= 2);

-- 주석 추가
COMMENT ON COLUMN teams.top_factors IS '상위 2개 매칭 요소 (최대 2개)';

