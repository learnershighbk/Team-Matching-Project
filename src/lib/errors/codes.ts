/**
 * 중앙화된 에러 코드 정의
 * 
 * PRD.md 섹션 18 및 API_SPEC.md 섹션 7 참조
 */

/**
 * 인증 관련 에러 코드
 */
export const AUTH_ERROR_CODES = {
  INVALID_STUDENT_NUMBER: 'AUTH_001', // 잘못된 학번 형식 (9자리 숫자 아님)
  INVALID_PIN: 'AUTH_002', // 잘못된 PIN 형식 (4자리 숫자 아님)
  AUTH_FAILED: 'AUTH_003', // 인증 실패
  CONFIG_ERROR: 'AUTH_CONFIG_ERROR', // 인증 설정 오류
  REGISTRATION_FAILED: 'AUTH_004', // 학생 등록 실패
} as const;

/**
 * 코스 관련 에러 코드
 */
export const COURSE_ERROR_CODES = {
  NOT_FOUND: 'COURSE_001', // 코스를 찾을 수 없음
  DEADLINE_PASSED: 'COURSE_002', // 프로필 입력 마감됨
  CANNOT_MODIFY: 'COURSE_003', // 해당 상태에서 수정 불가
  ALREADY_LOCKED: 'COURSE_004', // 이미 해당 상태임
  CANNOT_MATCH: 'COURSE_005', // 해당 상태에서 작업 불가
  FETCH_ERROR: 'COURSE_006', // 데이터 조회/처리 오류
  VALIDATION_ERROR: 'COURSE_007', // 유효성 검사 오류
} as const;

/**
 * 매칭 관련 에러 코드
 */
export const MATCH_ERROR_CODES = {
  INSUFFICIENT_STUDENTS: 'MATCH_001', // 매칭 실행 불가 (학생 부족)
  ALREADY_CONFIRMED: 'MATCH_002', // 이미 매칭 확정됨
  NOT_RUN: 'MATCH_003', // 매칭 미실행
} as const;

/**
 * 관리자 관련 에러 코드
 */
export const ADMIN_ERROR_CODES = {
  DUPLICATE_EMAIL: 'ADMIN_001', // 중복 이메일
  CANNOT_DELETE: 'ADMIN_002', // 삭제 불가 (연관 데이터 존재)
  FETCH_ERROR: 'ADMIN_003', // 데이터 조회/처리 오류
  NOT_FOUND: 'ADMIN_004', // 리소스를 찾을 수 없음
} as const;

/**
 * 모든 에러 코드 타입
 */
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
export type CourseErrorCode = (typeof COURSE_ERROR_CODES)[keyof typeof COURSE_ERROR_CODES];
export type MatchErrorCode = (typeof MATCH_ERROR_CODES)[keyof typeof MATCH_ERROR_CODES];
export type AdminErrorCode = (typeof ADMIN_ERROR_CODES)[keyof typeof ADMIN_ERROR_CODES];

export type ErrorCode = AuthErrorCode | CourseErrorCode | MatchErrorCode | AdminErrorCode;

/**
 * 에러 코드별 HTTP 상태 코드 매핑
 */
export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // AUTH
  [AUTH_ERROR_CODES.INVALID_STUDENT_NUMBER]: 400,
  [AUTH_ERROR_CODES.INVALID_PIN]: 400,
  [AUTH_ERROR_CODES.AUTH_FAILED]: 401,
  [AUTH_ERROR_CODES.CONFIG_ERROR]: 500,
  [AUTH_ERROR_CODES.REGISTRATION_FAILED]: 500,
  
  // COURSE
  [COURSE_ERROR_CODES.NOT_FOUND]: 404,
  [COURSE_ERROR_CODES.DEADLINE_PASSED]: 403,
  [COURSE_ERROR_CODES.CANNOT_MODIFY]: 403,
  [COURSE_ERROR_CODES.ALREADY_LOCKED]: 400,
  [COURSE_ERROR_CODES.CANNOT_MATCH]: 400,
  [COURSE_ERROR_CODES.FETCH_ERROR]: 500,
  [COURSE_ERROR_CODES.VALIDATION_ERROR]: 400,
  
  // MATCH
  [MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS]: 400,
  [MATCH_ERROR_CODES.ALREADY_CONFIRMED]: 400,
  [MATCH_ERROR_CODES.NOT_RUN]: 400,
  
  // ADMIN
  [ADMIN_ERROR_CODES.DUPLICATE_EMAIL]: 400,
  [ADMIN_ERROR_CODES.CANNOT_DELETE]: 400,
  [ADMIN_ERROR_CODES.FETCH_ERROR]: 500,
  [ADMIN_ERROR_CODES.NOT_FOUND]: 404,
};

/**
 * 에러 코드별 기본 메시지
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // AUTH
  [AUTH_ERROR_CODES.INVALID_STUDENT_NUMBER]: '학번은 9자리 숫자여야 합니다',
  [AUTH_ERROR_CODES.INVALID_PIN]: 'PIN은 4자리 숫자여야 합니다',
  [AUTH_ERROR_CODES.AUTH_FAILED]: '인증에 실패했습니다',
  [AUTH_ERROR_CODES.CONFIG_ERROR]: '인증 설정 오류가 발생했습니다',
  [AUTH_ERROR_CODES.REGISTRATION_FAILED]: '학생 등록에 실패했습니다',
  
  // COURSE
  [COURSE_ERROR_CODES.NOT_FOUND]: '코스를 찾을 수 없습니다',
  [COURSE_ERROR_CODES.DEADLINE_PASSED]: '프로필 입력 마감기한이 지났습니다',
  [COURSE_ERROR_CODES.CANNOT_MODIFY]: '해당 상태에서 수정할 수 없습니다',
  [COURSE_ERROR_CODES.ALREADY_LOCKED]: '이미 해당 상태입니다',
  [COURSE_ERROR_CODES.CANNOT_MATCH]: '해당 상태에서 매칭을 실행할 수 없습니다',
  [COURSE_ERROR_CODES.FETCH_ERROR]: '데이터 조회 중 오류가 발생했습니다',
  [COURSE_ERROR_CODES.VALIDATION_ERROR]: '입력값이 유효하지 않습니다',
  
  // MATCH
  [MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS]: '매칭을 실행하기에는 학생 수가 부족합니다',
  [MATCH_ERROR_CODES.ALREADY_CONFIRMED]: '이미 매칭이 확정되었습니다',
  [MATCH_ERROR_CODES.NOT_RUN]: '매칭이 실행되지 않았습니다',
  
  // ADMIN
  [ADMIN_ERROR_CODES.DUPLICATE_EMAIL]: '이미 등록된 이메일입니다',
  [ADMIN_ERROR_CODES.CANNOT_DELETE]: '연관된 데이터가 있어 삭제할 수 없습니다',
  [ADMIN_ERROR_CODES.FETCH_ERROR]: '데이터 조회 중 오류가 발생했습니다',
  [ADMIN_ERROR_CODES.NOT_FOUND]: '리소스를 찾을 수 없습니다',
};

