-- Migration: Create RLS policies
-- 참조: DATABASE.md 섹션 4
--
-- ============================================================================
-- 아키텍처 결정 (Architecture Decision Record)
-- ============================================================================
--
-- 컨텍스트:
--   - 자체 JWT 인증 시스템 사용 (Supabase Auth 미사용)
--   - auth.role() 함수는 Supabase Auth 전용이므로 작동하지 않음
--   - 모든 DB 접근은 API Routes를 통해 Service Role Key로 수행
--
-- 결정:
--   - RLS 활성화 + 최소한의 공개 정책만 유지
--   - 브라우저 → DB 직접 접근 차단 (보안 강화)
--   - 접근 제어는 API 레벨에서 JWT 검증으로 수행
--
-- 결과:
--   - Service Role Key 사용 시 RLS 자동 우회
--   - anon key로는 courses 공개 정보만 조회 가능
--   - 민감 데이터(students, teams, instructors)는 API를 통해서만 접근
--
-- ============================================================================

-- 모든 테이블에 RLS 활성화 (기본 차단)
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 공개 정책: 학생 URL 접속 시 코스 존재 확인용
-- ============================================================================
--
-- 용도: /course/[uuid] 페이지에서 코스 유효성 검증
-- 노출 정보: course_id, name, status (민감 정보 없음)
--
CREATE POLICY "Public read access to courses"
  ON courses FOR SELECT
  USING (true);

-- ============================================================================
-- 참고: 삭제된 정책들
-- ============================================================================
--
-- 아래 정책들은 auth.role() 함수가 Supabase Auth 없이 작동하지 않아 삭제됨.
-- Service Role Key 사용 시 RLS가 자동 우회되므로 별도 정책 불필요.
--
-- (삭제됨) "Service role full access on instructors"
-- (삭제됨) "Service role full access on courses"
-- (삭제됨) "Service role full access on teams"
-- (삭제됨) "Service role full access on students"
--


