import { Coach, Member, Measurement, TrainingPlan, Checkin } from '../types';

export const mockCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: '张教练',
    avatar: ''
  }
];

export const mockMembers: Member[] = [
  {
    id: 'member-1',
    coachId: 'coach-1',
    name: '李明',
    age: 32,
    gender: 'male',
    avatar: '',
    phone: '13812345678',
    joinDate: '2025-01-15'
  },
  {
    id: 'member-2',
    coachId: 'coach-1',
    name: '王芳',
    age: 28,
    gender: 'female',
    avatar: '',
    phone: '13987654321',
    joinDate: '2025-02-20'
  },
  {
    id: 'member-3',
    coachId: 'coach-1',
    name: '张伟',
    age: 41,
    gender: 'male',
    avatar: '',
    phone: '13756781234',
    joinDate: '2025-03-10'
  },
  {
    id: 'member-4',
    coachId: 'coach-1',
    name: '刘娜',
    age: 35,
    gender: 'female',
    avatar: '',
    phone: '13623456789',
    joinDate: '2025-04-05'
  },
  {
    id: 'member-5',
    coachId: 'coach-1',
    name: '陈强',
    age: 26,
    gender: 'male',
    avatar: '',
    phone: '13598765432',
    joinDate: '2025-05-18'
  },
  {
    id: 'member-6',
    coachId: 'coach-1',
    name: '赵丽',
    age: 43,
    gender: 'female',
    avatar: '',
    phone: '13434567890',
    joinDate: '2025-06-22'
  }
];

export const mockMeasurements: Measurement[] = [
  {
    id: 'measurement-1-1',
    memberId: 'member-1',
    date: '2025-02-01',
    weight: 85.5,
    bodyFatRate: 26.8,
    chest: 102,
    waist: 92,
    hip: 100,
    heartRate: 78
  },
  {
    id: 'measurement-1-2',
    memberId: 'member-1',
    date: '2025-04-01',
    weight: 82.3,
    bodyFatRate: 24.5,
    chest: 104,
    waist: 88,
    hip: 98,
    heartRate: 72
  },
  {
    id: 'measurement-1-3',
    memberId: 'member-1',
    date: '2025-06-01',
    weight: 79.8,
    bodyFatRate: 22.1,
    chest: 106,
    waist: 85,
    hip: 96,
    heartRate: 68
  },
  {
    id: 'measurement-1-4',
    memberId: 'member-1',
    date: '2025-08-01',
    weight: 78.2,
    bodyFatRate: 20.5,
    chest: 108,
    waist: 83,
    hip: 95,
    heartRate: 65
  },
  {
    id: 'measurement-2-1',
    memberId: 'member-2',
    date: '2025-03-01',
    weight: 62.5,
    bodyFatRate: 28.2,
    chest: 88,
    waist: 76,
    hip: 94,
    heartRate: 82
  },
  {
    id: 'measurement-2-2',
    memberId: 'member-2',
    date: '2025-05-01',
    weight: 60.8,
    bodyFatRate: 26.5,
    chest: 89,
    waist: 73,
    hip: 93,
    heartRate: 76
  },
  {
    id: 'measurement-2-3',
    memberId: 'member-2',
    date: '2025-07-01',
    weight: 58.9,
    bodyFatRate: 24.8,
    chest: 90,
    waist: 70,
    hip: 92,
    heartRate: 71
  },
  {
    id: 'measurement-2-4',
    memberId: 'member-2',
    date: '2025-09-01',
    weight: 57.5,
    bodyFatRate: 23.2,
    chest: 91,
    waist: 68,
    hip: 91,
    heartRate: 68
  },
  {
    id: 'measurement-3-1',
    memberId: 'member-3',
    date: '2025-04-01',
    weight: 92.3,
    bodyFatRate: 30.5,
    chest: 108,
    waist: 100,
    hip: 106,
    heartRate: 85
  },
  {
    id: 'measurement-3-2',
    memberId: 'member-3',
    date: '2025-06-01',
    weight: 90.8,
    bodyFatRate: 29.2,
    chest: 109,
    waist: 98,
    hip: 105,
    heartRate: 80
  },
  {
    id: 'measurement-3-3',
    memberId: 'member-3',
    date: '2025-08-01',
    weight: 88.5,
    bodyFatRate: 27.8,
    chest: 110,
    waist: 95,
    hip: 103,
    heartRate: 75
  },
  {
    id: 'measurement-3-4',
    memberId: 'member-3',
    date: '2025-10-01',
    weight: 86.9,
    bodyFatRate: 26.5,
    chest: 111,
    waist: 93,
    hip: 102,
    heartRate: 72
  },
  {
    id: 'measurement-3-5',
    memberId: 'member-3',
    date: '2025-12-01',
    weight: 89.2,
    bodyFatRate: 27.9,
    chest: 110,
    waist: 96,
    hip: 104,
    heartRate: 78
  },
  {
    id: 'measurement-4-1',
    memberId: 'member-4',
    date: '2025-05-01',
    weight: 68.2,
    bodyFatRate: 31.2,
    chest: 92,
    waist: 82,
    hip: 98,
    heartRate: 79
  },
  {
    id: 'measurement-4-2',
    memberId: 'member-4',
    date: '2025-07-01',
    weight: 66.5,
    bodyFatRate: 29.8,
    chest: 93,
    waist: 80,
    hip: 97,
    heartRate: 75
  },
  {
    id: 'measurement-4-3',
    memberId: 'member-4',
    date: '2025-09-01',
    weight: 64.8,
    bodyFatRate: 28.1,
    chest: 94,
    waist: 77,
    hip: 95,
    heartRate: 71
  },
  {
    id: 'measurement-4-4',
    memberId: 'member-4',
    date: '2025-11-01',
    weight: 63.2,
    bodyFatRate: 26.5,
    chest: 95,
    waist: 75,
    hip: 94,
    heartRate: 68
  },
  {
    id: 'measurement-5-1',
    memberId: 'member-5',
    date: '2025-06-01',
    weight: 72.8,
    bodyFatRate: 18.5,
    chest: 98,
    waist: 80,
    hip: 94,
    heartRate: 70
  },
  {
    id: 'measurement-5-2',
    memberId: 'member-5',
    date: '2025-08-01',
    weight: 74.5,
    bodyFatRate: 17.2,
    chest: 101,
    waist: 79,
    hip: 95,
    heartRate: 66
  },
  {
    id: 'measurement-5-3',
    memberId: 'member-5',
    date: '2025-10-01',
    weight: 76.2,
    bodyFatRate: 16.1,
    chest: 104,
    waist: 78,
    hip: 96,
    heartRate: 63
  },
  {
    id: 'measurement-5-4',
    memberId: 'member-5',
    date: '2025-12-01',
    weight: 78.0,
    bodyFatRate: 15.2,
    chest: 107,
    waist: 77,
    hip: 97,
    heartRate: 60
  },
  {
    id: 'measurement-6-1',
    memberId: 'member-6',
    date: '2025-07-01',
    weight: 72.5,
    bodyFatRate: 32.8,
    chest: 96,
    waist: 88,
    hip: 100,
    heartRate: 82
  },
  {
    id: 'measurement-6-2',
    memberId: 'member-6',
    date: '2025-09-01',
    weight: 70.8,
    bodyFatRate: 31.5,
    chest: 97,
    waist: 86,
    hip: 99,
    heartRate: 78
  },
  {
    id: 'measurement-6-3',
    memberId: 'member-6',
    date: '2025-11-01',
    weight: 69.2,
    bodyFatRate: 30.1,
    chest: 98,
    waist: 84,
    hip: 98,
    heartRate: 75
  },
  {
    id: 'measurement-6-4',
    memberId: 'member-6',
    date: '2026-01-01',
    weight: 68.5,
    bodyFatRate: 29.2,
    chest: 98,
    waist: 83,
    hip: 97,
    heartRate: 73
  },
  {
    id: 'measurement-6-5',
    memberId: 'member-6',
    date: '2026-03-01',
    weight: 70.1,
    bodyFatRate: 30.5,
    chest: 97,
    waist: 85,
    hip: 99,
    heartRate: 77
  }
];

export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'plan-1-1',
    memberId: 'member-1',
    name: '减脂增肌计划',
    cycleType: 'weekly',
    startDate: '2025-08-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-1-1-1', planId: 'plan-1-1', name: '深蹲', sets: 4, reps: 12, weight: 60, dayOfWeek: 0 },
      { id: 'exercise-1-1-2', planId: 'plan-1-1', name: '卧推', sets: 4, reps: 10, weight: 50, dayOfWeek: 0 },
      { id: 'exercise-1-1-3', planId: 'plan-1-1', name: '硬拉', sets: 3, reps: 8, weight: 70, dayOfWeek: 2 },
      { id: 'exercise-1-1-4', planId: 'plan-1-1', name: '引体向上', sets: 3, reps: 8, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-1-1-5', planId: 'plan-1-1', name: '哑铃弯举', sets: 3, reps: 12, weight: 12, dayOfWeek: 4 },
      { id: 'exercise-1-1-6', planId: 'plan-1-1', name: '平板支撑', sets: 4, reps: 60, weight: 0, dayOfWeek: 4 }
    ]
  },
  {
    id: 'plan-1-2',
    memberId: 'member-1',
    name: '有氧耐力计划',
    cycleType: 'monthly',
    startDate: '2025-09-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-1-2-1', planId: 'plan-1-2', name: '跑步', sets: 1, reps: 5000, weight: 0, dayOfWeek: 1 },
      { id: 'exercise-1-2-2', planId: 'plan-1-2', name: '划船机', sets: 1, reps: 3000, weight: 0, dayOfWeek: 3 },
      { id: 'exercise-1-2-3', planId: 'plan-1-2', name: '动感单车', sets: 1, reps: 45, weight: 0, dayOfWeek: 5 }
    ]
  },
  {
    id: 'plan-2-1',
    memberId: 'member-2',
    name: '塑形减脂计划',
    cycleType: 'weekly',
    startDate: '2025-09-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-2-1-1', planId: 'plan-2-1', name: '深蹲', sets: 3, reps: 15, weight: 30, dayOfWeek: 0 },
      { id: 'exercise-2-1-2', planId: 'plan-2-1', name: '哑铃弯举', sets: 3, reps: 15, weight: 6, dayOfWeek: 0 },
      { id: 'exercise-2-1-3', planId: 'plan-2-1', name: '平板支撑', sets: 3, reps: 45, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-2-1-4', planId: 'plan-2-1', name: '跑步', sets: 1, reps: 3000, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-2-1-5', planId: 'plan-2-1', name: '臀桥', sets: 4, reps: 15, weight: 20, dayOfWeek: 4 },
      { id: 'exercise-2-1-6', planId: 'plan-2-1', name: '划船机', sets: 1, reps: 2000, weight: 0, dayOfWeek: 4 }
    ]
  },
  {
    id: 'plan-3-1',
    memberId: 'member-3',
    name: '中年健康计划',
    cycleType: 'monthly',
    startDate: '2025-10-01',
    endDate: '2026-04-01',
    exercises: [
      { id: 'exercise-3-1-1', planId: 'plan-3-1', name: '跑步', sets: 1, reps: 3000, weight: 0, dayOfWeek: 0 },
      { id: 'exercise-3-1-2', planId: 'plan-3-1', name: '深蹲', sets: 3, reps: 10, weight: 40, dayOfWeek: 1 },
      { id: 'exercise-3-1-3', planId: 'plan-3-1', name: '卧推', sets: 3, reps: 10, weight: 35, dayOfWeek: 1 },
      { id: 'exercise-3-1-4', planId: 'plan-3-1', name: '划船机', sets: 1, reps: 2500, weight: 0, dayOfWeek: 3 },
      { id: 'exercise-3-1-5', planId: 'plan-3-1', name: '平板支撑', sets: 3, reps: 45, weight: 0, dayOfWeek: 5 }
    ]
  },
  {
    id: 'plan-3-2',
    memberId: 'member-3',
    name: '力量恢复计划',
    cycleType: 'weekly',
    startDate: '2025-11-01',
    endDate: '2026-05-01',
    exercises: [
      { id: 'exercise-3-2-1', planId: 'plan-3-2', name: '硬拉', sets: 3, reps: 8, weight: 55, dayOfWeek: 2 },
      { id: 'exercise-3-2-2', planId: 'plan-3-2', name: '引体向上', sets: 3, reps: 6, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-3-2-3', planId: 'plan-3-2', name: '哑铃弯举', sets: 3, reps: 12, weight: 10, dayOfWeek: 4 },
      { id: 'exercise-3-2-4', planId: 'plan-3-2', name: '动感单车', sets: 1, reps: 30, weight: 0, dayOfWeek: 6 }
    ]
  },
  {
    id: 'plan-4-1',
    memberId: 'member-4',
    name: '产后恢复计划',
    cycleType: 'weekly',
    startDate: '2025-09-01',
    endDate: '2026-03-01',
    exercises: [
      { id: 'exercise-4-1-1', planId: 'plan-4-1', name: '平板支撑', sets: 3, reps: 30, weight: 0, dayOfWeek: 0 },
      { id: 'exercise-4-1-2', planId: 'plan-4-1', name: '臀桥', sets: 4, reps: 15, weight: 15, dayOfWeek: 0 },
      { id: 'exercise-4-1-3', planId: 'plan-4-1', name: '深蹲', sets: 3, reps: 12, weight: 20, dayOfWeek: 2 },
      { id: 'exercise-4-1-4', planId: 'plan-4-1', name: '哑铃弯举', sets: 3, reps: 12, weight: 5, dayOfWeek: 2 },
      { id: 'exercise-4-1-5', planId: 'plan-4-1', name: '跑步', sets: 1, reps: 2500, weight: 0, dayOfWeek: 4 },
      { id: 'exercise-4-1-6', planId: 'plan-4-1', name: '划船机', sets: 1, reps: 2000, weight: 0, dayOfWeek: 6 }
    ]
  },
  {
    id: 'plan-5-1',
    memberId: 'member-5',
    name: '增肌力量计划',
    cycleType: 'monthly',
    startDate: '2025-10-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-5-1-1', planId: 'plan-5-1', name: '深蹲', sets: 5, reps: 8, weight: 80, dayOfWeek: 0 },
      { id: 'exercise-5-1-2', planId: 'plan-5-1', name: '卧推', sets: 5, reps: 8, weight: 65, dayOfWeek: 0 },
      { id: 'exercise-5-1-3', planId: 'plan-5-1', name: '硬拉', sets: 4, reps: 6, weight: 90, dayOfWeek: 2 },
      { id: 'exercise-5-1-4', planId: 'plan-5-1', name: '引体向上', sets: 4, reps: 10, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-5-1-5', planId: 'plan-5-1', name: '哑铃弯举', sets: 4, reps: 12, weight: 16, dayOfWeek: 4 },
      { id: 'exercise-5-1-6', planId: 'plan-5-1', name: '平板支撑', sets: 4, reps: 90, weight: 0, dayOfWeek: 4 },
      { id: 'exercise-5-1-7', planId: 'plan-5-1', name: '划船机', sets: 1, reps: 3000, weight: 0, dayOfWeek: 5 },
      { id: 'exercise-5-1-8', planId: 'plan-5-1', name: '跑步', sets: 1, reps: 4000, weight: 0, dayOfWeek: 6 }
    ]
  },
  {
    id: 'plan-6-1',
    memberId: 'member-6',
    name: '更年期健康计划',
    cycleType: 'weekly',
    startDate: '2025-11-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-6-1-1', planId: 'plan-6-1', name: '跑步', sets: 1, reps: 2500, weight: 0, dayOfWeek: 0 },
      { id: 'exercise-6-1-2', planId: 'plan-6-1', name: '深蹲', sets: 3, reps: 12, weight: 25, dayOfWeek: 1 },
      { id: 'exercise-6-1-3', planId: 'plan-6-1', name: '平板支撑', sets: 3, reps: 40, weight: 0, dayOfWeek: 1 },
      { id: 'exercise-6-1-4', planId: 'plan-6-1', name: '划船机', sets: 1, reps: 2000, weight: 0, dayOfWeek: 3 },
      { id: 'exercise-6-1-5', planId: 'plan-6-1', name: '臀桥', sets: 3, reps: 12, weight: 15, dayOfWeek: 4 }
    ]
  },
  {
    id: 'plan-6-2',
    memberId: 'member-6',
    name: '柔韧拉伸计划',
    cycleType: 'monthly',
    startDate: '2025-12-01',
    endDate: '2026-12-31',
    exercises: [
      { id: 'exercise-6-2-1', planId: 'plan-6-2', name: '平板支撑', sets: 3, reps: 60, weight: 0, dayOfWeek: 2 },
      { id: 'exercise-6-2-2', planId: 'plan-6-2', name: '动感单车', sets: 1, reps: 30, weight: 0, dayOfWeek: 5 },
      { id: 'exercise-6-2-3', planId: 'plan-6-2', name: '哑铃弯举', sets: 3, reps: 12, weight: 4, dayOfWeek: 6 }
    ]
  }
];

export const mockCheckins: Checkin[] = [
  { id: 'checkin-1', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-1', checkinDate: '2026-06-08', checkinTime: '18:30', completed: true },
  { id: 'checkin-2', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-2', checkinDate: '2026-06-08', checkinTime: '18:50', completed: true },
  { id: 'checkin-3', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-3', checkinDate: '2026-06-10', checkinTime: '19:15', completed: true },
  { id: 'checkin-4', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-4', checkinDate: '2026-06-10', checkinTime: '19:35', completed: false },
  { id: 'checkin-5', memberId: 'member-1', planId: 'plan-1-2', exerciseId: 'exercise-1-2-1', checkinDate: '2026-06-09', checkinTime: '07:00', completed: true },
  { id: 'checkin-6', memberId: 'member-1', planId: 'plan-1-2', exerciseId: 'exercise-1-2-2', checkinDate: '2026-06-11', checkinTime: '18:00', completed: true },
  { id: 'checkin-7', memberId: 'member-1', planId: 'plan-1-2', exerciseId: 'exercise-1-2-3', checkinDate: '2026-06-13', checkinTime: '17:45', completed: true },
  { id: 'checkin-8', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-1', checkinDate: '2026-06-15', checkinTime: '18:20', completed: true },
  { id: 'checkin-9', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-2', checkinDate: '2026-06-15', checkinTime: '18:45', completed: true },
  { id: 'checkin-10', memberId: 'member-1', planId: 'plan-1-2', exerciseId: 'exercise-1-2-1', checkinDate: '2026-06-16', checkinTime: '06:50', completed: true },
  { id: 'checkin-11', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-3', checkinDate: '2026-06-17', checkinTime: '19:00', completed: true },
  { id: 'checkin-12', memberId: 'member-1', planId: 'plan-1-1', exerciseId: 'exercise-1-1-4', checkinDate: '2026-06-17', checkinTime: '19:25', completed: true },
  { id: 'checkin-13', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-1', checkinDate: '2026-06-08', checkinTime: '19:00', completed: true },
  { id: 'checkin-14', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-2', checkinDate: '2026-06-08', checkinTime: '19:20', completed: true },
  { id: 'checkin-15', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-3', checkinDate: '2026-06-10', checkinTime: '18:30', completed: false },
  { id: 'checkin-16', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-4', checkinDate: '2026-06-10', checkinTime: '19:00', completed: true },
  { id: 'checkin-17', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-5', checkinDate: '2026-06-12', checkinTime: '18:45', completed: true },
  { id: 'checkin-18', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-6', checkinDate: '2026-06-12', checkinTime: '19:10', completed: true },
  { id: 'checkin-19', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-1', checkinDate: '2026-06-15', checkinTime: '19:05', completed: true },
  { id: 'checkin-20', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-2', checkinDate: '2026-06-15', checkinTime: '19:25', completed: false },
  { id: 'checkin-21', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-3', checkinDate: '2026-06-17', checkinTime: '18:40', completed: true },
  { id: 'checkin-22', memberId: 'member-2', planId: 'plan-2-1', exerciseId: 'exercise-2-1-4', checkinDate: '2026-06-17', checkinTime: '19:05', completed: true },
  { id: 'checkin-23', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-1', checkinDate: '2026-06-08', checkinTime: '06:30', completed: true },
  { id: 'checkin-24', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-2', checkinDate: '2026-06-09', checkinTime: '18:00', completed: true },
  { id: 'checkin-25', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-3', checkinDate: '2026-06-09', checkinTime: '18:25', completed: false },
  { id: 'checkin-26', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-4', checkinDate: '2026-06-11', checkinTime: '18:30', completed: true },
  { id: 'checkin-27', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-5', checkinDate: '2026-06-13', checkinTime: '17:00', completed: false },
  { id: 'checkin-28', memberId: 'member-3', planId: 'plan-3-2', exerciseId: 'exercise-3-2-1', checkinDate: '2026-06-10', checkinTime: '18:15', completed: true },
  { id: 'checkin-29', memberId: 'member-3', planId: 'plan-3-2', exerciseId: 'exercise-3-2-2', checkinDate: '2026-06-10', checkinTime: '18:40', completed: true },
  { id: 'checkin-30', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-1', checkinDate: '2026-06-15', checkinTime: '06:40', completed: true },
  { id: 'checkin-31', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-2', checkinDate: '2026-06-16', checkinTime: '18:05', completed: true },
  { id: 'checkin-32', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-3', checkinDate: '2026-06-16', checkinTime: '18:30', completed: true },
  { id: 'checkin-33', memberId: 'member-3', planId: 'plan-3-1', exerciseId: 'exercise-3-1-4', checkinDate: '2026-06-18', checkinTime: '18:20', completed: false },
  { id: 'checkin-34', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-1', checkinDate: '2026-06-08', checkinTime: '19:30', completed: true },
  { id: 'checkin-35', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-2', checkinDate: '2026-06-08', checkinTime: '19:50', completed: true },
  { id: 'checkin-36', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-3', checkinDate: '2026-06-10', checkinTime: '19:00', completed: true },
  { id: 'checkin-37', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-4', checkinDate: '2026-06-10', checkinTime: '19:20', completed: true },
  { id: 'checkin-38', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-5', checkinDate: '2026-06-12', checkinTime: '18:30', completed: false },
  { id: 'checkin-39', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-6', checkinDate: '2026-06-14', checkinTime: '17:00', completed: true },
  { id: 'checkin-40', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-1', checkinDate: '2026-06-15', checkinTime: '19:20', completed: true },
  { id: 'checkin-41', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-2', checkinDate: '2026-06-15', checkinTime: '19:40', completed: true },
  { id: 'checkin-42', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-3', checkinDate: '2026-06-17', checkinTime: '19:10', completed: true },
  { id: 'checkin-43', memberId: 'member-4', planId: 'plan-4-1', exerciseId: 'exercise-4-1-4', checkinDate: '2026-06-17', checkinTime: '19:30', completed: true },
  { id: 'checkin-44', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-1', checkinDate: '2026-06-08', checkinTime: '17:30', completed: true },
  { id: 'checkin-45', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-2', checkinDate: '2026-06-08', checkinTime: '17:55', completed: true },
  { id: 'checkin-46', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-3', checkinDate: '2026-06-10', checkinTime: '17:30', completed: true },
  { id: 'checkin-47', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-4', checkinDate: '2026-06-10', checkinTime: '18:00', completed: true },
  { id: 'checkin-48', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-5', checkinDate: '2026-06-12', checkinTime: '17:45', completed: true },
  { id: 'checkin-49', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-6', checkinDate: '2026-06-12', checkinTime: '18:10', completed: true },
  { id: 'checkin-50', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-7', checkinDate: '2026-06-13', checkinTime: '16:00', completed: true },
  { id: 'checkin-51', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-8', checkinDate: '2026-06-14', checkinTime: '07:00', completed: true },
  { id: 'checkin-52', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-1', checkinDate: '2026-06-15', checkinTime: '17:25', completed: true },
  { id: 'checkin-53', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-2', checkinDate: '2026-06-15', checkinTime: '17:50', completed: true },
  { id: 'checkin-54', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-3', checkinDate: '2026-06-17', checkinTime: '17:30', completed: true },
  { id: 'checkin-55', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-4', checkinDate: '2026-06-17', checkinTime: '18:00', completed: false },
  { id: 'checkin-56', memberId: 'member-5', planId: 'plan-5-1', exerciseId: 'exercise-5-1-5', checkinDate: '2026-06-18', checkinTime: '17:45', completed: true },
  { id: 'checkin-57', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-1', checkinDate: '2026-06-08', checkinTime: '07:30', completed: true },
  { id: 'checkin-58', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-2', checkinDate: '2026-06-09', checkinTime: '18:00', completed: false },
  { id: 'checkin-59', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-3', checkinDate: '2026-06-09', checkinTime: '18:20', completed: false },
  { id: 'checkin-60', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-4', checkinDate: '2026-06-11', checkinTime: '18:30', completed: true },
  { id: 'checkin-61', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-5', checkinDate: '2026-06-12', checkinTime: '18:15', completed: true },
  { id: 'checkin-62', memberId: 'member-6', planId: 'plan-6-2', exerciseId: 'exercise-6-2-1', checkinDate: '2026-06-10', checkinTime: '19:00', completed: true },
  { id: 'checkin-63', memberId: 'member-6', planId: 'plan-6-2', exerciseId: 'exercise-6-2-2', checkinDate: '2026-06-13', checkinTime: '17:30', completed: false },
  { id: 'checkin-64', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-1', checkinDate: '2026-06-15', checkinTime: '07:40', completed: true },
  { id: 'checkin-65', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-2', checkinDate: '2026-06-16', checkinTime: '18:05', completed: true },
  { id: 'checkin-66', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-3', checkinDate: '2026-06-16', checkinTime: '18:25', completed: true },
  { id: 'checkin-67', memberId: 'member-6', planId: 'plan-6-1', exerciseId: 'exercise-6-1-4', checkinDate: '2026-06-18', checkinTime: '18:20', completed: true },
  { id: 'checkin-68', memberId: 'member-6', planId: 'plan-6-2', exerciseId: 'exercise-6-2-1', checkinDate: '2026-06-17', checkinTime: '19:05', completed: true }
];
