export type Role = 'coach' | 'member';

export interface Coach {
  id: string;
  name: string;
  avatar: string;
}

export interface Member {
  id: string;
  coachId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  avatar: string;
  phone: string;
  joinDate: string;
}

export interface Measurement {
  id: string;
  memberId: string;
  date: string;
  weight: number;
  bodyFatRate: number;
  chest: number;
  waist: number;
  hip: number;
  heartRate: number;
}

export interface PlanExercise {
  id: string;
  planId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  dayOfWeek: number;
}

export interface TrainingPlan {
  id: string;
  memberId: string;
  name: string;
  cycleType: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  exercises: PlanExercise[];
}

export interface Checkin {
  id: string;
  memberId: string;
  planId: string;
  exerciseId: string;
  checkinDate: string;
  checkinTime: string;
  completed: boolean;
}

export interface MeasurementDiff {
  weight: number;
  bodyFatRate: number;
  chest: number;
  waist: number;
  hip: number;
  heartRate: number;
}
