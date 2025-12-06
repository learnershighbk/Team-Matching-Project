/**
 * Instructor Feature 타입 정의
 */

export type Course = {
  courseId: string;
  instructorId: string;
  courseName: string;
  courseCode: string;
  teamSize: number;
  weightProfile: string;
  deadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentStatus = {
  studentId: string;
  studentNumber: string;
  name?: string;
  email?: string;
  profileCompleted: boolean;
  teamId?: string;
  createdAt: string;
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

export type MatchingPreview = {
  teams: Team[];
  statistics: {
    totalStudents: number;
    totalTeams: number;
    averageTeamSize: number;
    profileCompletionRate: number;
  };
};

