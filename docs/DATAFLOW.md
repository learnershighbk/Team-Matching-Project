# 📊 DATAFLOW.md — TeamMatch 데이터 흐름

**참조:** PRD.md 섹션 10  
**버전:** v1.0  

---

## 1. Overview

| 프로세스 | 주요 데이터 | 관련 테이블 |
|----------|------------|------------|
| **인증** | JWT, Credentials | instructors, students |
| **코스 관리** | Course Settings | courses |
| **프로필 수집** | Student Profile | students |
| **매칭** | Teams, Scores | teams, students |

---

## 2. Authentication Flow

### 2.1 Admin Login
```
Client → POST /api/admin/login { email, password }
       → Validate vs ENV (ADMIN_EMAIL, ADMIN_PASSWORD)
       → Generate JWT { role: 'admin', exp: 4h }
       → Set Cookie (HttpOnly)
```

### 2.2 Instructor Login
```
Client → POST /api/instructor/login { email, pin }
       → Query: SELECT * FROM instructors WHERE email = ?
       → bcrypt.compare(pin, pin_hash)
       → Generate JWT { role: 'instructor', instructorId, exp: 24h }
       → Set Cookie
```

### 2.3 Student Auth
```
Client → POST /api/student/auth { courseId, studentNumber, pin, isNewUser }
       → Query: SELECT * FROM courses WHERE course_id = ?
       → If new: INSERT INTO students + hash PIN
       → If existing: Verify PIN
       → Generate JWT { role: 'student', studentId, courseId, exp: 24h }
```

---

## 3. Course Management Flow

### 3.1 Course Creation
```
Instructor → POST /api/instructor/courses
           { courseName, courseCode, teamSize, weightProfile, deadline }
           
Server → Extract instructorId from JWT
       → Validate: teamSize 2-6, deadline > now
       → INSERT INTO courses (course_id=UUID, status='OPEN', ...)
       → Return { courseId, accessUrl: /course/{uuid} }
```

### 3.2 Course Status Transitions
```
┌────────┐   deadline/lock   ┌────────┐   confirm   ┌───────────┐
│  OPEN  │ ───────────────→  │ LOCKED │ ─────────→  │ CONFIRMED │
└────────┘                   └────────┘             └───────────┘
   │                            │                        │
   │ Students can               │ No profile             │ Students see
   │ edit profiles              │ changes                │ team results
```

---

## 4. Profile Data Flow

### 4.1 Profile Submission
```
Student → PUT /api/student/profile
        { name, email, major, gender, continent, role, skill, times[], goal }

Server → Extract studentId, courseId from JWT
       → Check: course.status == 'OPEN'?
       → Validate all fields (Zod schema)
       → UPDATE students SET ... WHERE student_id = ?
       → Trigger: profile_completed = true (auto-calculated)
```

### 4.2 Profile Data Structure
```typescript
{
  // Identity (공개)
  name: string,
  email: string,
  major: enum,
  
  // Matching factors (비공개)
  gender: enum,
  continent: enum,
  role: enum,
  skill: enum,
  times: enum[],
  goal: enum
}
```

---

## 5. Matching Data Flow

### 5.1 Matching Execution (Preview)
```
Instructor → POST /api/instructor/courses/:id/match

Server → Verify: owner + status == 'LOCKED'
       → Query: SELECT * FROM students WHERE course_id = ? AND profile_completed
       → Run Algorithm:
           1. Shuffle students (Fisher-Yates)
           2. Create team slots (no orphans)
           3. Initial assignment
           4. Calculate scores (7 rules × weights)
           5. Optimize via local swaps
           6. Extract top 2 factors per team
       → Return preview (NOT saved to DB)
```

### 5.2 Matching Confirmation
```
Instructor → POST /api/instructor/courses/:id/confirm

Server → BEGIN TRANSACTION
       → INSERT INTO teams (team_id, course_id, scores, top_factors)
       → UPDATE students SET team_id = ? (for each member)
       → UPDATE courses SET status = 'CONFIRMED'
       → COMMIT
```

### 5.3 Score Calculation Flow
```
Team Members → calculateScores()
             │
             ├→ Time Score (0-10): Overlap check
             ├→ Skill Score (0-10): Unique skills count
             ├→ Role Score (0-10): Role diversity
             ├→ Major Score (0-10): Major diversity
             ├→ Goal Score (0-10): Alignment check
             ├→ Continent Score (0-10): Geographic diversity
             └→ Gender Score (0-10): Gender mix
             
Weighted Total = Σ(Score × Weight[profile])
```

---

## 6. Team Result Data Flow

### 6.1 Student View
```
Student → GET /api/student/team

Server → Extract studentId from JWT
       → Query: SELECT t.*, s2.name, s2.major, s2.email
                FROM students s
                JOIN teams t ON s.team_id = t.team_id
                JOIN students s2 ON t.team_id = s2.team_id
                WHERE s.student_id = ?
       → Filter: Only expose name, major, email of teammates
       → Return { teamNumber, topFactors, teammates[] }
```

### 6.2 Instructor View
```
Instructor → GET /api/instructor/courses/:id/teams

Server → Query: Full team data with all scores
       → Return {
           teams: [{ members, scores, breakdown }],
           summary: { avg, stdDev, min, max }
         }
```

---

## 7. Data Access Matrix

| Data | Admin | Instructor | Student (Self) | Student (Teammate) |
|------|-------|------------|----------------|-------------------|
| name | ✅ | ✅ | ✅ | ✅ |
| email | ✅ | ✅ | ✅ | ✅ |
| major | ✅ | ✅ | ✅ | ✅ |
| gender | ✅ | ✅ | ✅ | ❌ |
| continent | ✅ | ✅ | ✅ | ❌ |
| role | ✅ | ✅ | ✅ | ❌ |
| skill | ✅ | ✅ | ✅ | ❌ |
| times | ✅ | ✅ | ✅ | ❌ |
| goal | ✅ | ✅ | ✅ | ❌ |
| team_score | ✅ | ✅ | ❌ | ❌ |

---

## 8. Database Write Operations

| Operation | Table | Trigger | Cascade |
|-----------|-------|---------|---------|
| Create Instructor | instructors | - | - |
| Create Course | courses | - | - |
| Create Student | students | profile_completed check | - |
| Update Profile | students | profile_completed check | - |
| Create Team | teams | - | - |
| Assign Team | students.team_id | member_count sync | - |
| Delete Instructor | instructors | - | CASCADE courses |
| Delete Course | courses | - | CASCADE students, teams |

---

**END OF DOCUMENT**
