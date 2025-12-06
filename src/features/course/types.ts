/**
 * Course Feature 타입 정의
 */

export type CourseStatus = {
  courseId: string;
  courseName: string;
  courseCode: string;
  status: 'OPEN' | 'CLOSED' | 'MATCHED' | 'ARCHIVED';
  deadline: string;
  teamSize: number;
  studentCount?: number;
  profileCompletionRate?: number;
};

