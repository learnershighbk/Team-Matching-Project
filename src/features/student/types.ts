/**
 * Student Feature 타입 정의
 */

export type StudentProfile = {
  studentId: string;
  courseId: string;
  studentNumber: string;
  name?: string;
  email?: string;
  major?: string;
  gender?: string;
  continent?: string;
  role?: string;
  skill?: string;
  times?: string[];
  goal?: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Team = {
  teamId: string;
  courseId: string;
  teamNumber: number;
  memberCount: number;
  topFactors?: string[];
  members: TeamMember[];
  createdAt: string;
};

export type TeamMember = {
  studentId: string;
  studentNumber: string;
  name?: string;
  email?: string;
};



