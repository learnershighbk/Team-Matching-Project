/**
 * Course Feature 타입 정의
 */

export type CourseStatus = {
  courseId: string;
  courseName: string;
  courseCode: string;
  status: string;
  deadline: string;
  isDeadlinePassed: boolean;
  teamSize: number;
  studentCount?: number;
  profileCompletionRate?: number;
};

