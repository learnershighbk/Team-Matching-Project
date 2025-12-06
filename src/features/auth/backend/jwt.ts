import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * TeamMatch JWT 유틸리티
 *
 * - Admin: 4시간 만료
 * - Instructor: 24시간 만료
 * - Student: 24시간 만료
 */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-min-32-chars"
);
const JWT_ISSUER = process.env.JWT_ISSUER || "teammatch";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "teammatch-users";

const EXPIRATION = {
  admin: "4h",
  instructor: "24h",
  student: "24h",
} as const;

type Role = keyof typeof EXPIRATION;

export type AdminPayload = {
  role: "admin";
  email: string;
};

export type InstructorPayload = {
  role: "instructor";
  instructorId: string;
  email: string;
};

export type StudentPayload = {
  role: "student";
  studentId: string;
  courseId: string;
  studentNumber: string;
};

export type TokenPayload = AdminPayload | InstructorPayload | StudentPayload;

export async function signToken(payload: TokenPayload): Promise<string> {
  const role = payload.role as Role;

  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(EXPIRATION[role])
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // 타입 검증
    const role = payload.role as string;
    if (!["admin", "instructor", "student"].includes(role)) {
      return null;
    }

    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export const COOKIE_NAME = "teammatch_token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};
