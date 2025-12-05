// TeamMatch Database Types
// 참조: DATABASE.md

export type WeightProfile = 'balanced' | 'skill_heavy' | 'skill_role_focused' | 'diversity_heavy';
export type CourseStatus = 'OPEN' | 'LOCKED' | 'CONFIRMED';
export type Major = 'MPP' | 'MDP' | 'MPM' | 'MDS' | 'MIPD' | 'MPPM' | 'PhD';
export type Gender = 'male' | 'female' | 'other';
export type Continent = 'asia' | 'africa' | 'europe' | 'north_america' | 'south_america' | 'oceania';
export type Role = 'leader' | 'executor' | 'ideator' | 'coordinator';
export type Skill = 'data_analysis' | 'research' | 'writing' | 'visual' | 'presentation';
export type TimePreference = 'weekday_daytime' | 'weekday_evening' | 'weekend';
export type Goal = 'a_plus' | 'balanced' | 'minimum';

export interface Instructor {
  instructor_id: string;
  email: string;
  pin_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  course_id: string;
  instructor_id: string;
  course_name: string;
  course_code: string;
  team_size: number;
  weight_profile: WeightProfile;
  deadline: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export interface Team {
  team_id: string;
  course_id: string;
  team_number: number;
  member_count: number;
  score_total: number;
  score_time: number;
  score_skill: number;
  score_role: number;
  score_major: number;
  score_goal: number;
  score_continent: number;
  score_gender: number;
  top_factors: string[];
  created_at: string;
}

export interface Student {
  student_id: string;
  course_id: string;
  team_id: string | null;
  student_number: string;
  pin_hash: string;
  name: string | null;
  email: string | null;
  major: Major | null;
  gender: Gender | null;
  continent: Continent | null;
  role: Role | null;
  skill: Skill | null;
  times: TimePreference[];
  goal: Goal | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Supabase Database 타입 (Supabase 클라이언트용)
export interface Database {
  public: {
    Tables: {
      instructors: {
        Row: Instructor;
        Insert: Omit<Instructor, 'instructor_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Instructor, 'instructor_id' | 'created_at'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'course_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Course, 'course_id' | 'created_at'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'team_id' | 'created_at'>;
        Update: Partial<Omit<Team, 'team_id' | 'created_at'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'student_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'student_id' | 'created_at'>>;
      };
    };
  };
}

export type SupabaseUserMetadata = Record<string, unknown>;

