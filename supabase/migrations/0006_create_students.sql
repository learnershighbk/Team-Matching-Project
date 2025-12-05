-- Migration: Create students table
-- 참조: DATABASE.md 섹션 3.5

CREATE TABLE IF NOT EXISTS students (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
  student_number VARCHAR(9) NOT NULL,  -- 9자리 학번
  pin_hash VARCHAR(255) NOT NULL,  -- bcrypt 해시
  
  -- 프로필 필드
  name VARCHAR(100),
  email VARCHAR(255),
  major major_enum,
  gender gender_enum,
  continent continent_enum,
  role role_enum,
  skill skill_enum,
  times time_enum[] DEFAULT '{}',  -- 다중 선택
  goal goal_enum,
  
  -- 메타
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 코스 내 학번 유니크
  UNIQUE(course_id, student_number)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_team ON students(team_id);
CREATE INDEX IF NOT EXISTS idx_students_number ON students(student_number);

-- 트리거
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 프로필 완료 체크 함수
CREATE OR REPLACE FUNCTION check_profile_completed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completed := (
    NEW.name IS NOT NULL AND
    NEW.email IS NOT NULL AND
    NEW.major IS NOT NULL AND
    NEW.gender IS NOT NULL AND
    NEW.continent IS NOT NULL AND
    NEW.role IS NOT NULL AND
    NEW.skill IS NOT NULL AND
    array_length(NEW.times, 1) > 0 AND
    NEW.goal IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_profile_check
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completed();

-- 팀 멤버 수 동기화 함수
CREATE OR REPLACE FUNCTION sync_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 이전 팀 멤버 수 갱신
  IF OLD.team_id IS NOT NULL THEN
    UPDATE teams
    SET member_count = (
      SELECT COUNT(*) FROM students WHERE team_id = OLD.team_id
    )
    WHERE team_id = OLD.team_id;
  END IF;
  
  -- 새 팀 멤버 수 갱신
  IF NEW.team_id IS NOT NULL THEN
    UPDATE teams
    SET member_count = (
      SELECT COUNT(*) FROM students WHERE team_id = NEW.team_id
    )
    WHERE team_id = NEW.team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_team_sync
  AFTER UPDATE OF team_id ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_member_count();

