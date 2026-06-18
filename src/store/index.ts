import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as types from '../types';
import {
  mockCoaches,
  mockMembers,
  mockMeasurements,
  mockTrainingPlans,
  mockCheckins,
} from '../data/mockData';

type Role = types.Role;
type Coach = types.Coach;
type Member = types.Member;
type Measurement = types.Measurement;
type TrainingPlan = types.TrainingPlan;
type PlanExercise = types.PlanExercise;
type Checkin = types.Checkin;

interface GymState {
  currentRole: Role;
  currentCoachId: string;
  currentMemberId: string | null;
  coaches: Coach[];
  members: Member[];
  measurements: Measurement[];
  trainingPlans: TrainingPlan[];
  checkins: Checkin[];
  setRole: (role: Role) => void;
  setCurrentMemberId: (id: string | null) => void;
  addMeasurement: (measurement: Omit<Measurement, 'id'>) => void;
  addTrainingPlan: (plan: Omit<TrainingPlan, 'id' | 'exercises'> & { exercises: Omit<PlanExercise, 'id' | 'planId'>[] }) => void;
  deleteTrainingPlan: (planId: string) => void;
  toggleCheckin: (memberId: string, planId: string, exerciseId: string, date: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<GymState>()(
  persist(
    (set) => ({
      currentRole: 'coach',
      currentCoachId: mockCoaches[0].id,
      currentMemberId: mockMembers[0].id,
      coaches: mockCoaches,
      members: mockMembers,
      measurements: mockMeasurements,
      trainingPlans: mockTrainingPlans,
      checkins: mockCheckins,
      setRole: (role) => set({ currentRole: role }),
      setCurrentMemberId: (id) => set({ currentMemberId: id }),
      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [...state.measurements, { ...measurement, id: generateId() }],
        })),
      addTrainingPlan: (plan) =>
        set((state) => {
          const planId = generateId();
          const exercises: PlanExercise[] = plan.exercises.map((exercise) => ({
            ...exercise,
            id: generateId(),
            planId,
          }));
          const newPlan: TrainingPlan = {
            ...plan,
            id: planId,
            exercises,
          };
          return { trainingPlans: [...state.trainingPlans, newPlan] };
        }),
      deleteTrainingPlan: (planId) =>
        set((state) => ({
          trainingPlans: state.trainingPlans.filter((p) => p.id !== planId),
          checkins: state.checkins.filter((c) => c.planId !== planId),
        })),
      toggleCheckin: (memberId, planId, exerciseId, date) =>
        set((state) => {
          const existingIndex = state.checkins.findIndex(
            (c) =>
              c.memberId === memberId &&
              c.planId === planId &&
              c.exerciseId === exerciseId &&
              c.checkinDate === date
          );
          if (existingIndex >= 0) {
            const newCheckins = [...state.checkins];
            newCheckins[existingIndex] = {
              ...newCheckins[existingIndex],
              completed: !newCheckins[existingIndex].completed,
            };
            return { checkins: newCheckins };
          } else {
            const newCheckin: Checkin = {
              id: generateId(),
              memberId,
              planId,
              exerciseId,
              checkinDate: date,
              checkinTime: new Date().toISOString(),
              completed: true,
            };
            return { checkins: [...state.checkins, newCheckin] };
          }
        }),
    }),
    {
      name: 'gym-app-state-v3',
    }
  )
);

export { useStore as useGymStore };
