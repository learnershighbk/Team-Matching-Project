-- Migration: Create RLS policies
-- 참조: DATABASE.md 섹션 4

-- 모든 테이블에 RLS 활성화
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Service Role 정책 (API Routes에서 Service Role Key 사용 시 RLS 우회)
-- 실제 접근 제어는 API 레벨에서 JWT 검증으로 수행
CREATE POLICY "Service role full access on instructors"
  ON instructors FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on courses"
  ON courses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on teams"
  ON teams FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on students"
  ON students FOR ALL
  USING (auth.role() = 'service_role');

-- 코스 상태 조회 (학생 URL 접속 시 - 공개 정보만)
CREATE POLICY "Anyone can check course status"
  ON courses FOR SELECT
  USING (true);  -- course_id로 조회, 민감 정보 없음

