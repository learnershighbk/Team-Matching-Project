-- Migration: Create database functions
-- 참조: DATABASE.md 섹션 5

-- 마감 시 자동 상태 변경 함수
CREATE OR REPLACE FUNCTION auto_lock_courses()
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET status = 'LOCKED'
  WHERE status = 'OPEN'
    AND deadline <= NOW();
END;
$$ LANGUAGE plpgsql;

-- 주기적 실행을 위한 Cron Job 설정 (Supabase에서는 pg_cron 확장 사용)
-- 또는 API 호출로 주기적 실행
-- SELECT cron.schedule('auto-lock-courses', '*/5 * * * *', 'SELECT auto_lock_courses();');

