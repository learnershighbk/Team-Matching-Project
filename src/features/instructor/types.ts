/**
 * Instructor Feature 타입 정의
 */

export type Course = {
  courseId: string;
  instructorId?: string;
  courseName: string;
  courseCode: string;
  teamSize: number;
  weightProfile: string;
  deadline: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  studentCount?: number;
  completedCount?: number;
  accessUrl?: string;
};

export type StudentStatus = {
  studentId: string;
  studentNumber: string;
  name?: string;
  email?: string;
  major?: string;
  profileCompleted: boolean;
  teamNumber?: number | null;
};

export type Team = {
  teamId: string;
  courseId: string;
  teamNumber: number;
  memberCount: number;
  scoreTotal?: number;
  scoreBreakdown?: {
    time: number;
    skill: number;
    role: number;
    major: number;
    goal: number;
    continent: number;
    gender: number;
  };
  topFactors?: string[];
  members: TeamMember[];
  createdAt: string;
};

export type TeamMember = {
  studentId: string;
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

