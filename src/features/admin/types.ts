/**
 * Admin Feature 타입 정의
 */

export type Instructor = {
  instructorId: string;
  email: string;
  name: string;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Course = {
  courseId: string;
  instructorId: string;
  instructorName?: string;
  courseName: string;
  courseCode: string;
  teamSize: number;
  weightProfile: string;
  deadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Student = {
  studentId: string;
  courseId: string;
  studentNumber: string;
  name?: string;
  email?: string;
  profileCompleted: boolean;
  createdAt: string;
};



