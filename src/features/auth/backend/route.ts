import type { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { failure, success, respond } from "@/backend/http/response";
import type { AppEnv } from "@/backend/hono/context";
import { getSupabase } from "@/backend/hono/context";
import {
  verifyToken,
  signToken,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  type TokenPayload,
  type InstructorPayload,
  type StudentPayload,
} from "./jwt";
import { verifyPassword } from "@/lib/auth/hash";

/**
 * TeamMatch 인증 라우트
 *
 * - GET /auth/me: 현재 사용자 조회
 * - POST /auth/logout: 로그아웃
 * - POST /admin/login: Admin 로그인
 * - POST /instructor/login: Instructor 로그인 (TODO)
 * - POST /student/auth: Student 인증 (TODO)
 */

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  // 현재 사용자 조회
  app.get("/auth/me", async (c) => {
    const token = getCookie(c, COOKIE_NAME);

    if (!token) {
      return respond(c, success(null));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // 유효하지 않은 토큰은 삭제
      deleteCookie(c, COOKIE_NAME);
      return respond(c, success(null));
    }

    return respond(c, success(payload));
  });

  // 로그아웃
  app.post("/auth/logout", async (c) => {
    deleteCookie(c, COOKIE_NAME, { path: "/" });
    return respond(c, success(null));
  });

  // Admin 로그인
  app.post("/admin/login", async (c) => {
    const body = await c.req.json<{ email: string; password: string }>();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return respond(
        c,
        failure(500, "AUTH_CONFIG_ERROR", "Admin 계정이 설정되지 않았습니다.")
      );
    }

    if (body.email !== adminEmail || body.password !== adminPassword) {
      return respond(
        c,
        failure(401, "AUTH_003", "인증에 실패했습니다.")
      );
    }

    const payload: TokenPayload = {
      role: "admin",
      email: body.email,
    };

    const token = await signToken(payload);

    setCookie(c, COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 4 * 60 * 60, // 4시간
    });

    return respond(
      c,
      success({
        role: "admin" as const,
        email: body.email,
      })
    );
  });

  // Instructor 로그인
  app.post("/instructor/login", async (c) => {
    const body = await c.req.json<{ email: string; pin: string }>();

    // PIN 형식 검증 (4자리 숫자)
    if (!/^\d{4}$/.test(body.pin)) {
      return respond(
        c,
        failure(400, "AUTH_002", "PIN은 4자리 숫자여야 합니다")
      );
    }

    const supabase = getSupabase(c);

    // DB에서 instructor 조회
    const { data: instructor, error } = await supabase
      .from("instructors")
      .select("instructor_id, email, pin_hash, name")
      .eq("email", body.email)
      .single();

    if (error || !instructor) {
      return respond(
        c,
        failure(401, "AUTH_003", "이메일 또는 PIN이 올바르지 않습니다")
      );
    }

    // PIN 검증
    const isValid = await verifyPassword(body.pin, instructor.pin_hash);
    if (!isValid) {
      return respond(
        c,
        failure(401, "AUTH_003", "이메일 또는 PIN이 올바르지 않습니다")
      );
    }

    // JWT 생성
    const payload: InstructorPayload = {
      role: "instructor",
      instructorId: instructor.instructor_id,
      email: instructor.email,
    };

    const token = await signToken(payload);

    setCookie(c, COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60, // 24시간
    });

    return respond(
      c,
      success({
        instructorId: instructor.instructor_id,
        email: instructor.email,
        name: instructor.name,
      })
    );
  });

  // Student 인증
  app.post("/student/auth", async (c) => {
    const body = await c.req.json<{
      courseId: string;
      studentNumber: string;
      pin: string;
      isNewUser: boolean;
    }>();

    // 학번 형식 검증 (9자리 숫자)
    if (!/^\d{9}$/.test(body.studentNumber)) {
      return respond(
        c,
        failure(400, "AUTH_001", "학번은 9자리 숫자여야 합니다")
      );
    }

    // PIN 형식 검증 (4자리 숫자)
    if (!/^\d{4}$/.test(body.pin)) {
      return respond(
        c,
        failure(400, "AUTH_002", "PIN은 4자리 숫자여야 합니다")
      );
    }

    const supabase = getSupabase(c);

    // 코스 존재 확인
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("course_id, status")
      .eq("course_id", body.courseId)
      .single();

    if (courseError || !course) {
      return respond(
        c,
        failure(404, "COURSE_001", "코스를 찾을 수 없습니다")
      );
    }

    if (body.isNewUser) {
      // 신규 사용자 등록
      const { hashPassword } = await import("@/lib/auth/hash");
      const pinHash = await hashPassword(body.pin);

      const { data: student, error: insertError } = await supabase
        .from("students")
        .insert({
          course_id: body.courseId,
          student_number: body.studentNumber,
          pin_hash: pinHash,
        })
        .select("student_id, profile_completed")
        .single();

      if (insertError || !student) {
        // 중복 학번 등록 시도
        if (insertError?.code === "23505") {
          return respond(
            c,
            failure(400, "AUTH_003", "이미 등록된 학번입니다")
          );
        }
        return respond(
          c,
          failure(500, "AUTH_004", "학생 등록에 실패했습니다")
        );
      }

      // JWT 생성
      const payload: StudentPayload = {
        role: "student",
        studentId: student.student_id,
        courseId: body.courseId,
        studentNumber: body.studentNumber,
      };

      const token = await signToken(payload);

      setCookie(c, COOKIE_NAME, token, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60, // 24시간
      });

      return respond(
        c,
        success({
          studentId: student.student_id,
          studentNumber: body.studentNumber,
          profileCompleted: student.profile_completed,
          courseStatus: course.status,
        })
      );
    } else {
      // 기존 사용자 로그인
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("student_id, pin_hash, profile_completed")
        .eq("course_id", body.courseId)
        .eq("student_number", body.studentNumber)
        .single();

      if (studentError || !student) {
        return respond(
          c,
          failure(401, "AUTH_003", "학번 또는 PIN이 올바르지 않습니다")
        );
      }

      // PIN 검증
      const isValid = await verifyPassword(body.pin, student.pin_hash);
      if (!isValid) {
        return respond(
          c,
          failure(401, "AUTH_003", "학번 또는 PIN이 올바르지 않습니다")
        );
      }

      // JWT 생성
      const payload: StudentPayload = {
        role: "student",
        studentId: student.student_id,
        courseId: body.courseId,
        studentNumber: body.studentNumber,
      };

      const token = await signToken(payload);

      setCookie(c, COOKIE_NAME, token, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60, // 24시간
      });

      return respond(
        c,
        success({
          studentId: student.student_id,
          studentNumber: body.studentNumber,
          profileCompleted: student.profile_completed,
          courseStatus: course.status,
        })
      );
    }
  });
};
