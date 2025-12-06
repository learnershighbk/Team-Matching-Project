/**
 * Matching Feature 타입 정의
 */

import type { ScoreBreakdown } from './scoring';

export type Team = {
  teamId: string;
  courseId: string;
  teamNumber: number;
  memberCount: number;
  topFactors?: string[];
  members: TeamMember[];
  scores?: ScoreBreakdown;
  totalScore?: number;
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

