-- Migration: Fix RLS policies (Hotfix)
-- 이슈: auth.role() 함수가 자체 JWT 환경에서 작동하지 않음
-- 해결: 불필요한 service role 정책 제거

-- ============================================================================
-- 1. 기존 잘못된 정책 제거
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access on instructors" ON instructors;
DROP POLICY IF EXISTS "Service role full access on courses" ON courses;
DROP POLICY IF EXISTS "Service role full access on teams" ON teams;
DROP POLICY IF EXISTS "Service role full access on students" ON students;

-- 기존 중복 정책도 제거
DROP POLICY IF EXISTS "Anyone can check course status" ON courses;

-- ============================================================================
-- 2. 새 정책 적용 (멱등성 보장)
-- ============================================================================

-- courses 테이블: 공개 읽기 허용 (코스 존재 확인용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'courses'
    AND policyname = 'Public read access to courses'
  ) THEN
    CREATE POLICY "Public read access to courses"
      ON courses FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- 참고: 접근 제어 전략
-- ============================================================================
--
-- Browser (anon key):
--   - courses: SELECT만 가능 (공개 정보)
--   - instructors, students, teams: 접근 불가
--
-- API Routes (service role key):
--   - 모든 테이블 전체 접근 (RLS 자동 우회)
--   - 접근 제어는 API 레벨 JWT 검증으로 수행
--
-- 이 설계의 장점:
--   1. 보안 강화: 브라우저에서 민감 데이터 직접 접근 불가
--   2. 단순성: auth.role() 의존성 제거
--   3. 일관성: 모든 비즈니스 로직이 API에서 처리
--
