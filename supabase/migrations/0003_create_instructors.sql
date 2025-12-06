-- Migration: Create instructors table
-- 참조: DATABASE.md 섹션 3.2

CREATE TABLE IF NOT EXISTS instructors (
  instructor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,  -- bcrypt 해시
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 조건부 생성 (이미 존재하면 무시)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'instructors_updated_at'
  ) THEN
    CREATE TRIGGER instructors_updated_at
      BEFORE UPDATE ON instructors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;


