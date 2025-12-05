-- Migration: Create teams table
-- 참조: DATABASE.md 섹션 3.4

CREATE TABLE IF NOT EXISTS teams (
  team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  score_total DECIMAL(10,2) DEFAULT 0,
  score_time DECIMAL(10,2) DEFAULT 0,
  score_skill DECIMAL(10,2) DEFAULT 0,
  score_role DECIMAL(10,2) DEFAULT 0,
  score_major DECIMAL(10,2) DEFAULT 0,
  score_goal DECIMAL(10,2) DEFAULT 0,
  score_continent DECIMAL(10,2) DEFAULT 0,
  score_gender DECIMAL(10,2) DEFAULT 0,
  top_factors TEXT[] DEFAULT '{}',  -- 상위 2개 요소
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, team_number)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_teams_course ON teams(course_id);

