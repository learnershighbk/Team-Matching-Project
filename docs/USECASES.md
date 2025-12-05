# 🎯 USECASES.md — TeamMatch 유스케이스

**참조:** PRD.md 전체  
**버전:** v1.0  

---

## 1. Actor Definitions

| Actor | Description | Entry Point |
|-------|-------------|-------------|
| **Admin** | 시스템 관리자 | `/admin` |
| **Instructor** | 코스 담당 교수자 | `/instructor` |
| **Student** | 팀 프로젝트 참여 학생 | `/course/{uuid}` |
| **System** | 자동화된 프로세스 | Cron/Trigger |

---

## 2. Admin Use Cases

### UC-A01: Admin Login
```
Precondition: Admin이 로그인 페이지에 접근
Flow:
  1. Admin이 이메일과 비밀번호 입력
  2. System이 환경변수와 비교
  3. 일치 시 JWT 발급 및 대시보드로 리다이렉트
Postcondition: Admin 세션 활성화 (4시간)
Exception:
  - E1: 잘못된 자격증명 → "인증 실패" 메시지
```

### UC-A02: Create Instructor Account
```
Precondition: Admin 로그인 상태
Flow:
  1. Admin이 "새 교수자 추가" 클릭
  2. 이메일, 이름, 4자리 PIN 입력
  3. System이 중복 이메일 확인
  4. PIN 해시 후 DB 저장
  5. 성공 메시지 표시
Postcondition: 새 교수자 계정 생성됨
Exception:
  - E1: 중복 이메일 → "이미 등록된 이메일입니다"
  - E2: 잘못된 PIN 형식 → "PIN은 4자리 숫자여야 합니다"
```

### UC-A03: Update Instructor PIN
```
Precondition: Admin 로그인, 교수자 존재
Flow:
  1. Admin이 교수자 목록에서 "수정" 클릭
  2. 새 PIN 입력
  3. System이 PIN 해시 후 업데이트
Postcondition: 교수자 PIN 변경됨
```

### UC-A04: Delete Instructor
```
Precondition: Admin 로그인, 교수자 존재
Flow:
  1. Admin이 "삭제" 클릭
  2. 확인 다이얼로그 표시
  3. 확인 시 교수자 및 관련 코스 삭제 (CASCADE)
Postcondition: 교수자 계정 삭제됨
Exception:
  - E1: 진행 중인 코스 존재 → 경고 후 확인 요청
```

### UC-A05: Reset Student PIN
```
Precondition: Admin 로그인, 학생 존재
Flow:
  1. Admin이 학생 검색 (학번 또는 코스)
  2. "PIN 리셋" 클릭
  3. 새 PIN 입력 또는 자동 생성
  4. System이 PIN 업데이트
Postcondition: 학생 PIN 변경됨
```

### UC-A06: Modify Course Deadline
```
Precondition: Admin 로그인, 코스 상태가 OPEN
Flow:
  1. Admin이 코스 목록에서 선택
  2. 새 마감일시 입력
  3. System이 deadline 업데이트
Postcondition: 코스 마감기한 변경됨
Exception:
  - E1: 이미 LOCKED/CONFIRMED → 수정 불가
```

---

## 3. Instructor Use Cases

### UC-I01: Instructor Login
```
Precondition: Instructor 계정이 Admin에 의해 생성됨
Flow:
  1. Instructor가 이메일과 4자리 PIN 입력
  2. System이 DB에서 조회 및 PIN 검증
  3. JWT 발급 및 대시보드로 리다이렉트
Postcondition: Instructor 세션 활성화 (24시간)
```

### UC-I02: Create Course
```
Precondition: Instructor 로그인 상태
Flow:
  1. "새 코스 생성" 클릭
  2. 코스명, 코스코드 입력
  3. 팀 인원수 선택 (3/4/5 또는 Custom 2-6)
  4. 가중치 프로파일 선택
  5. 프로필 입력 마감일시 설정
  6. System이 코스 생성 및 UUID 발급
  7. 학생 접속 URL 표시
Postcondition: 새 코스 생성, 상태=OPEN
Test Data:
  - courseName: "Policy Analysis 2025"
  - courseCode: "KPP101"
  - teamSize: 4
  - weightProfile: "balanced"
  - deadline: now + 7 days
```

### UC-I03: Share Course URL
```
Precondition: 코스 생성됨
Flow:
  1. Instructor가 코스 상세 페이지 접근
  2. "URL 복사" 버튼 클릭
  3. Clipboard에 /course/{uuid} 복사됨
  4. 학생들에게 공유 (이메일, LMS 등)
Postcondition: 학생들이 URL로 접근 가능
```

### UC-I04: Monitor Student Progress
```
Precondition: 코스 OPEN 상태
Flow:
  1. Instructor가 코스 상세 페이지 접근
  2. 학생 현황 조회 (총 인원, 프로필 완료 수)
  3. 개별 학생 프로필 완료 여부 확인
Postcondition: 현황 정보 표시됨
```

### UC-I05: Lock Course Manually
```
Precondition: 코스 OPEN 상태, 최소 2명 프로필 완료
Flow:
  1. Instructor가 "마감하기" 클릭
  2. 확인 다이얼로그
  3. System이 status = LOCKED 업데이트
Postcondition: 코스 LOCKED, 학생 프로필 수정 불가
```

### UC-I06: Run Matching
```
Precondition: 코스 LOCKED 상태
Flow:
  1. Instructor가 "Run Matching" 클릭
  2. System이 매칭 알고리즘 실행
  3. 결과 미리보기 표시 (팀 구성, 점수)
  4. Instructor가 결과 검토
Postcondition: 매칭 결과 미리보기 (DB 미저장)
```

### UC-I07: Confirm Teams
```
Precondition: 매칭 실행 완료
Flow:
  1. Instructor가 미리보기 검토 후 "팀 확정" 클릭
  2. System이 teams 테이블에 저장
  3. students.team_id 업데이트
  4. course.status = CONFIRMED
Postcondition: 팀 배정 완료, 학생 조회 가능
```

### UC-I08: Re-run Matching
```
Precondition: 매칭 미리보기 상태 (확정 전)
Flow:
  1. Instructor가 "다시 매칭" 클릭
  2. System이 새로운 셔플로 재매칭
  3. 새 결과 미리보기 표시
Postcondition: 새로운 매칭 결과 표시
```

---

## 4. Student Use Cases

### UC-S01: Access Course (First Time)
```
Precondition: 교수자로부터 URL 수령
Flow:
  1. Student가 /course/{uuid} 접속
  2. 코스 정보 확인 (코스명, 담당자, 마감일)
  3. 9자리 학번 입력
  4. System이 신규 사용자 확인
  5. 4자리 PIN 설정
  6. 프로필 입력 페이지로 이동
Postcondition: 학생 계정 생성, 세션 활성화
```

### UC-S02: Login (Returning)
```
Precondition: 이전에 PIN 설정함
Flow:
  1. Student가 /course/{uuid} 접속
  2. 학번 입력
  3. PIN 입력
  4. System이 검증 후 JWT 발급
Postcondition: 세션 활성화, 상태에 따른 페이지 표시
```

### UC-S03: Submit Profile
```
Precondition: 코스 OPEN, 로그인 상태
Flow:
  1. Student가 프로필 폼 접근
  2. 8개 항목 입력:
     - 이름, 이메일
     - 전공 (단일 선택)
     - 성별 (단일 선택)
     - 출신대륙 (단일 선택)
     - 역할 선호 (단일 선택)
     - 주요 역량 (단일 선택)
     - 선호 시간대 (복수 선택)
     - 목표 성향 (단일 선택)
  3. "저장" 클릭
  4. System이 검증 및 저장
Postcondition: profile_completed = true
Test Data:
  - name: "홍길동"
  - email: "hong@email.com"
  - major: "MPP"
  - gender: "male"
  - continent: "asia"
  - role: "leader"
  - skill: "data_analysis"
  - times: ["weekday_daytime", "weekend"]
  - goal: "balanced"
```

### UC-S04: Edit Profile
```
Precondition: 코스 OPEN, 프로필 제출됨
Flow:
  1. Student가 프로필 페이지 재접근
  2. 기존 데이터 로드됨
  3. 원하는 항목 수정
  4. "저장" 클릭
Postcondition: 프로필 업데이트됨
```

### UC-S05: View Waiting Screen
```
Precondition: 코스 LOCKED, 매칭 미확정
Flow:
  1. Student가 코스 접근
  2. "매칭 대기 중" 화면 표시
  3. 프로필 수정 불가
Postcondition: 대기 화면 표시
```

### UC-S06: View Team Result
```
Precondition: 코스 CONFIRMED
Flow:
  1. Student가 코스 접근
  2. 팀 번호 및 매칭 설명 표시
  3. 팀원 정보 표시 (이름, 전공, 이메일)
  4. 이메일 복사 기능
Postcondition: 팀 결과 조회 완료
```

---

## 5. System Use Cases

### UC-SYS01: Auto-Lock Course
```
Trigger: 마감 시간 도래
Flow:
  1. System이 deadline <= now인 OPEN 코스 조회
  2. status = LOCKED 업데이트
Postcondition: 해당 코스들 LOCKED
Implementation: pg_cron 또는 API 호출
```

### UC-SYS02: Calculate Profile Completion
```
Trigger: students 테이블 INSERT/UPDATE
Flow:
  1. Trigger 함수 실행
  2. 모든 필수 필드 NOT NULL 확인
  3. profile_completed 값 설정
Postcondition: profile_completed 자동 계산
```

---

## 6. Edge Cases & Test Scenarios

### 6.1 Authentication Edge Cases
| Scenario | Input | Expected |
|----------|-------|----------|
| 학번 8자리 | 20240001 | AUTH_001 에러 |
| 학번 10자리 | 2024000012 | AUTH_001 에러 |
| 학번 문자 포함 | 2024A0001 | AUTH_001 에러 |
| PIN 3자리 | 123 | AUTH_002 에러 |
| PIN 5자리 | 12345 | AUTH_002 에러 |
| PIN 문자 포함 | 12AB | AUTH_002 에러 |
| 잘못된 코스 UUID | invalid-uuid | COURSE_001 에러 |

### 6.2 Matching Edge Cases
| Scenario | Students | teamSize | Expected Teams |
|----------|----------|----------|----------------|
| 정확히 나눠짐 | 12 | 4 | 3팀 (4+4+4) |
| 1명 남음 | 13 | 4 | 4팀 (4+3+3+3) |
| 2명 남음 | 14 | 4 | 4팀 (4+4+3+3) |
| 최소 인원 | 2 | 4 | 1팀 (2) |
| 팀 사이즈보다 적음 | 3 | 5 | 1팀 (3) |

### 6.3 Deadline Edge Cases
| Scenario | Action | Expected |
|----------|--------|----------|
| 마감 1분 전 프로필 저장 | Submit | 성공 |
| 마감 직후 프로필 저장 | Submit | COURSE_002 에러 |
| 마감 후 재접속 | Login | 대기 화면 표시 |

### 6.4 Concurrent Access
| Scenario | Expected |
|----------|----------|
| 같은 학번으로 동시 등록 | 첫 번째만 성공 |
| 매칭 중 프로필 수정 시도 | COURSE_002 에러 |
| 동시에 Confirm 클릭 | 첫 번째만 성공 |

---

## 7. Acceptance Criteria

### 7.1 Authentication
- [ ] 9자리 숫자만 학번으로 허용
- [ ] 4자리 숫자만 PIN으로 허용
- [ ] 잘못된 입력 시 명확한 에러 메시지
- [ ] JWT 만료 시 자동 로그아웃

### 7.2 Course Management
- [ ] 코스 생성 후 즉시 URL 복사 가능
- [ ] 마감 시간 도래 시 자동 LOCKED
- [ ] LOCKED 후 프로필 수정 차단

### 7.3 Matching
- [ ] 1인 팀 절대 생성되지 않음
- [ ] 팀 간 인원 차이 최대 1명
- [ ] 매칭 시간 3초 이내 (50명 기준)
- [ ] 확정 전 재매칭 가능

### 7.4 Team Result
- [ ] 학생에게 이름/전공/이메일만 표시
- [ ] 점수 및 기타 정보 비공개
- [ ] 매칭 설명 템플릿 정상 생성

---

**END OF DOCUMENT**
