# 🔌 API_SPEC.md — TeamMatch API 명세

**참조:** PRD.md 섹션 12  
**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. Overview

### 1.1 Base URL

```
Development: http://localhost:3000/api
Production:  https://teammatch.vercel.app/api
```

### 1.2 공통 응답 형식

```typescript
// 성공 응답
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// 에러 응답
interface ErrorResponse {
  success: false;
  error: {
    code: string;      // AUTH_001, COURSE_001 등
    message: string;   // 사용자 친화적 메시지
  };
}
```

### 1.3 인증 헤더

```http
Cookie: token=<JWT_TOKEN>
```

### 1.4 공통 HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## 2. Authentication APIs

### 2.1 Admin Login

관리자 로그인

```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "email": "bklee@kdischool.ac.kr",
  "password": "1217"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "email": "bklee@kdischool.ac.kr"
  }
}
```

**Cookies Set:**
```
token=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=14400
```

**Errors:**
| Code | Message |
|------|---------|
| AUTH_003 | 이메일 또는 비밀번호가 올바르지 않습니다 |

---

### 2.2 Instructor Login

교수자 로그인

```http
POST /api/instructor/login
```

**Request Body:**
```json
{
  "email": "professor@kdischool.ac.kr",
  "pin": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructorId": "uuid",
    "email": "professor@kdischool.ac.kr",
    "name": "홍길동"
  }
}
```

**Cookies Set:**
```
token=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Errors:**
| Code | Message |
|------|---------|
| AUTH_002 | PIN은 4자리 숫자여야 합니다 |
| AUTH_003 | 이메일 또는 PIN이 올바르지 않습니다 |

---

### 2.3 Student Auth

학생 인증 (로그인 또는 신규 등록)

```http
POST /api/student/auth
```

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "studentNumber": "202400001",
  "pin": "1234",
  "isNewUser": false
}
```

**신규 등록 시 (isNewUser: true):**
```json
{
  "courseId": "course-uuid",
  "studentNumber": "202400001",
  "pin": "1234",
  "isNewUser": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "studentNumber": "202400001",
    "profileCompleted": false,
    "courseStatus": "OPEN"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| AUTH_001 | 학번은 9자리 숫자여야 합니다 |
| AUTH_002 | PIN은 4자리 숫자여야 합니다 |
| AUTH_003 | 학번 또는 PIN이 올바르지 않습니다 |
| COURSE_001 | 코스를 찾을 수 없습니다 |

---

## 3. Admin APIs

> 🔒 모든 Admin API는 Admin JWT 필요

### 3.1 List Instructors

교수자 목록 조회

```http
GET /api/admin/instructors
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "instructorId": "uuid",
      "email": "prof1@kdischool.ac.kr",
      "name": "김교수",
      "courseCount": 3,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 3.2 Create Instructor

교수자 계정 생성

```http
POST /api/admin/instructors
```

**Request Body:**
```json
{
  "email": "newprof@kdischool.ac.kr",
  "pin": "5678",
  "name": "이교수"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "instructorId": "uuid",
    "email": "newprof@kdischool.ac.kr",
    "name": "이교수"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| AUTH_002 | PIN은 4자리 숫자여야 합니다 |
| ADMIN_001 | 이미 등록된 이메일입니다 |

---

### 3.3 Update Instructor

교수자 정보 수정

```http
PUT /api/admin/instructors/:id
```

**Request Body:**
```json
{
  "name": "박교수",
  "pin": "9999"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructorId": "uuid",
    "email": "newprof@kdischool.ac.kr",
    "name": "박교수"
  }
}
```

---

### 3.4 Delete Instructor

교수자 계정 삭제

```http
DELETE /api/admin/instructors/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| ADMIN_002 | 진행 중인 코스가 있어 삭제할 수 없습니다 |

---

### 3.5 Reset Student PIN

학생 PIN 리셋

```http
PUT /api/admin/students/:id/reset-pin
```

**Request Body:**
```json
{
  "newPin": "0000"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "pinReset": true
  }
}
```

---

### 3.6 List All Courses

전체 코스 목록 조회

```http
GET /api/admin/courses
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | all | OPEN, LOCKED, CONFIRMED, all |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 개수 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "courseId": "uuid",
        "courseName": "Policy Analysis",
        "courseCode": "KPP101",
        "instructorName": "김교수",
        "status": "OPEN",
        "studentCount": 25,
        "deadline": "2025-01-15T23:59:59Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

---

### 3.7 Update Course Deadline

코스 마감기한 변경

```http
PUT /api/admin/courses/:id/deadline
```

**Request Body:**
```json
{
  "deadline": "2025-01-20T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "deadline": "2025-01-20T23:59:59Z"
  }
}
```

---

## 4. Instructor APIs

> 🔒 모든 Instructor API는 Instructor JWT 필요

### 4.1 List My Courses

내 코스 목록 조회

```http
GET /api/instructor/courses
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid",
      "courseName": "Policy Analysis",
      "courseCode": "KPP101",
      "teamSize": 4,
      "weightProfile": "balanced",
      "status": "OPEN",
      "deadline": "2025-01-15T23:59:59Z",
      "studentCount": 25,
      "completedCount": 20,
      "accessUrl": "/course/abc123-def456-..."
    }
  ]
}
```

---

### 4.2 Create Course

새 코스 생성

```http
POST /api/instructor/courses
```

**Request Body:**
```json
{
  "courseName": "Development Economics",
  "courseCode": "MDP201",
  "teamSize": 4,
  "weightProfile": "balanced",
  "deadline": "2025-02-01T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "courseName": "Development Economics",
    "courseCode": "MDP201",
    "accessUrl": "/course/new-uuid-here"
  }
}
```

**Validation:**
| Field | Rule |
|-------|------|
| courseName | 필수, 1-200자 |
| courseCode | 필수, 1-20자 |
| teamSize | 2-6 |
| weightProfile | balanced, skill_heavy, skill_role_focused, diversity_heavy |
| deadline | 현재 시간 이후 |

---

### 4.3 Update Course

코스 정보 수정

```http
PUT /api/instructor/courses/:id
```

**Request Body:**
```json
{
  "teamSize": 5,
  "weightProfile": "skill_heavy",
  "deadline": "2025-02-15T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "teamSize": 5,
    "weightProfile": "skill_heavy",
    "deadline": "2025-02-15T23:59:59Z"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| COURSE_003 | LOCKED 또는 CONFIRMED 상태에서는 수정할 수 없습니다 |

---

### 4.4 Get Course Students

코스 학생 목록 조회

```http
GET /api/instructor/courses/:id/students
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 20,
    "students": [
      {
        "studentId": "uuid",
        "studentNumber": "202400001",
        "name": "학생1",
        "email": "student1@email.com",
        "major": "MPP",
        "profileCompleted": true,
        "teamNumber": null
      }
    ]
  }
}
```

---

### 4.5 Lock Course

코스 마감 (OPEN → LOCKED)

```http
POST /api/instructor/courses/:id/lock
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "status": "LOCKED",
    "studentCount": 25
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| COURSE_004 | 이미 LOCKED 상태입니다 |
| MATCH_001 | 최소 2명의 학생이 필요합니다 |

---

### 4.6 Run Matching

매칭 실행 (미리보기)

```http
POST /api/instructor/courses/:id/match
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "teams": [
      {
        "teamNumber": 1,
        "memberCount": 4,
        "scoreTotal": 142.5,
        "scoreBreakdown": {
          "time": 40,
          "skill": 24,
          "role": 20,
          "major": 20,
          "goal": 10,
          "continent": 20,
          "gender": 8.5
        },
        "topFactors": ["time", "skill"],
        "members": [
          {
            "studentId": "uuid",
            "name": "학생1",
            "major": "MPP",
            "role": "leader",
            "skill": "data_analysis"
          }
        ]
      }
    ],
    "summary": {
      "teamCount": 7,
      "averageScore": 138.2,
      "scoreStdDev": 5.3,
      "minScore": 130.5,
      "maxScore": 145.0
    }
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| COURSE_005 | LOCKED 상태에서만 매칭을 실행할 수 있습니다 |
| MATCH_001 | 최소 2명의 프로필 완료 학생이 필요합니다 |

---

### 4.7 Confirm Teams

팀 확정 (LOCKED → CONFIRMED)

```http
POST /api/instructor/courses/:id/confirm
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "status": "CONFIRMED",
    "teamCount": 7
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| MATCH_002 | 이미 확정된 코스입니다 |
| MATCH_003 | 먼저 매칭을 실행해주세요 |

---

### 4.8 Get Teams

팀 결과 조회 (교수자용 - 전체 정보)

```http
GET /api/instructor/courses/:id/teams
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "CONFIRMED",
    "teams": [
      {
        "teamId": "uuid",
        "teamNumber": 1,
        "memberCount": 4,
        "scoreTotal": 142.5,
        "scoreBreakdown": {
          "time": 40,
          "skill": 24,
          "role": 20,
          "major": 20,
          "goal": 10,
          "continent": 20,
          "gender": 8.5
        },
        "topFactors": ["time", "skill"],
        "members": [
          {
            "studentId": "uuid",
            "name": "학생1",
            "email": "student1@email.com",
            "major": "MPP",
            "gender": "male",
            "continent": "asia",
            "role": "leader",
            "skill": "data_analysis",
            "times": ["weekday_daytime", "weekend"],
            "goal": "a_plus"
          }
        ]
      }
    ],
    "summary": {
      "teamCount": 7,
      "averageScore": 138.2,
      "scoreStdDev": 5.3
    }
  }
}
```

---

## 5. Student APIs

> 🔒 모든 Student API는 Student JWT 필요

### 5.1 Get Profile

내 프로필 조회

```http
GET /api/student/profile
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "studentId": "uuid",
    "studentNumber": "202400001",
    "courseId": "uuid",
    "courseStatus": "OPEN",
    "profile": {
      "name": "학생1",
      "email": "student1@email.com",
      "major": "MPP",
      "gender": "male",
      "continent": "asia",
      "role": "leader",
      "skill": "data_analysis",
      "times": ["weekday_daytime", "weekend"],
      "goal": "a_plus"
    },
    "profileCompleted": true
  }
}
```

---

### 5.2 Update Profile

프로필 입력/수정

```http
PUT /api/student/profile
```

**Request Body:**
```json
{
  "name": "학생1",
  "email": "student1@email.com",
  "major": "MPP",
  "gender": "male",
  "continent": "asia",
  "role": "leader",
  "skill": "data_analysis",
  "times": ["weekday_daytime", "weekend"],
  "goal": "a_plus"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profileCompleted": true,
    "message": "프로필이 저장되었습니다"
  }
}
```

**Validation:**
| Field | Type | Rule |
|-------|------|------|
| name | string | 필수, 1-100자 |
| email | string | 필수, 이메일 형식 |
| major | enum | MPP, MDP, MPM, MDS, MIPD, MPPM, PhD |
| gender | enum | male, female, other |
| continent | enum | asia, africa, europe, north_america, south_america, oceania |
| role | enum | leader, executor, ideator, coordinator |
| skill | enum | data_analysis, research, writing, visual, presentation |
| times | enum[] | 1개 이상 선택 필수 |
| goal | enum | a_plus, balanced, minimum |

**Errors:**
| Code | Message |
|------|---------|
| COURSE_002 | 프로필 입력 마감기한이 지났습니다 |

---

### 5.3 Get My Team

내 팀 결과 조회

```http
GET /api/student/team
```

**Response (200) - 매칭 확정 후:**
```json
{
  "success": true,
  "data": {
    "hasTeam": true,
    "teamNumber": 3,
    "topFactors": ["time", "skill"],
    "matchDescription": "이 팀은 시간대(Time) 및 역량 균형(Skill) 측면에서 가장 적합하게 매칭되었습니다.",
    "teammates": [
      {
        "name": "학생2",
        "major": "MDP",
        "email": "student2@email.com"
      },
      {
        "name": "학생3",
        "major": "MPM",
        "email": "student3@email.com"
      },
      {
        "name": "학생4",
        "major": "MDS",
        "email": "student4@email.com"
      }
    ]
  }
}
```

**Response (200) - 매칭 전:**
```json
{
  "success": true,
  "data": {
    "hasTeam": false,
    "courseStatus": "LOCKED",
    "message": "매칭 결과를 기다리고 있습니다"
  }
}
```

---

## 6. Public APIs

> 🔓 인증 불필요

### 6.1 Get Course Status

코스 상태 조회 (학생 URL 접속 시)

```http
GET /api/course/:uuid/status
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "courseName": "Policy Analysis",
    "courseCode": "KPP101",
    "instructorName": "김교수",
    "status": "OPEN",
    "deadline": "2025-01-15T23:59:59Z",
    "isDeadlinePassed": false
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| COURSE_001 | 코스를 찾을 수 없습니다 |

---

## 7. Error Code Reference

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_001 | 400 | 잘못된 학번 형식 (9자리 숫자 아님) |
| AUTH_002 | 400 | 잘못된 PIN 형식 (4자리 숫자 아님) |
| AUTH_003 | 401 | 인증 실패 |
| COURSE_001 | 404 | 코스를 찾을 수 없음 |
| COURSE_002 | 403 | 프로필 입력 마감됨 |
| COURSE_003 | 403 | 해당 상태에서 수정 불가 |
| COURSE_004 | 400 | 이미 해당 상태임 |
| COURSE_005 | 400 | 해당 상태에서 작업 불가 |
| MATCH_001 | 400 | 매칭 실행 불가 (학생 부족) |
| MATCH_002 | 400 | 이미 매칭 확정됨 |
| MATCH_003 | 400 | 매칭 미실행 |
| ADMIN_001 | 400 | 중복 이메일 |
| ADMIN_002 | 400 | 삭제 불가 (연관 데이터 존재) |

---

## 8. Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /api/*/login | 5 req/min per IP |
| POST /api/student/auth | 10 req/min per IP |
| Other endpoints | 60 req/min per token |

---

**END OF DOCUMENT**

*이 문서는 PRD.md 섹션 12를 기반으로 한 API 상세 명세입니다.*
