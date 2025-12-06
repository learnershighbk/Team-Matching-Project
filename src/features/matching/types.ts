/**
 * Matching Feature 타입 정의
 */

export type Team = {
  teamId: string;
  courseId: string;
  teamNumber: number;
  memberCount: number;
  topFactors?: string[];
  members: TeamMember[];
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

export type MatchingResult = {
  teams: Team[];
  statistics: {
    totalStudents: number;
    totalTeams: number;
    averageTeamSize: number;
    profileCompletionRate: number;
  };
};

export type WeightProfile = {
  time: number;
  skill: number;
  role: number;
  major: number;
  goal: number;
  continent: number;
  gender: number;
};

