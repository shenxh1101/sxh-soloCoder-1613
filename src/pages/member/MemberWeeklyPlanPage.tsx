import { useMemo, useState } from 'react';
import { Check, Clock, Dumbbell, CheckCircle, Calendar } from 'lucide-react';
import { useStore } from '../../store';
import { getWeekDates, getDayName, formatDateTime, isToday } from '../../utils/date';
import type { PlanExercise } from '../../types';

interface DayExercises {
  date: string;
  dayOfWeek: number;
  exercises: Array<{
    planId: string;
    exercise: PlanExercise;
  }>;
}

export default function MemberWeeklyPlanPage() {
  const { members, currentMemberId, trainingPlans, checkins, toggleCheckin } = useStore();
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const member = members.find((m) => m.id === currentMemberId);
  const weekDates = getWeekDates();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const weekPlans = useMemo(() => {
    return trainingPlans.filter(
      (plan) =>
        plan.memberId === currentMemberId &&
        new Date(plan.endDate) >= new Date(weekStart) &&
        new Date(plan.startDate) <= new Date(weekEnd)
    );
  }, [trainingPlans, currentMemberId, weekStart, weekEnd]);

  const daysWithExercises: DayExercises[] = useMemo(() => {
    return weekDates.map((date, index) => {
      const dayOfWeek = index;
      const exercises: DayExercises['exercises'] = [];
      weekPlans.forEach((plan) => {
        plan.exercises.forEach((exercise) => {
          if (exercise.dayOfWeek === dayOfWeek) {
            exercises.push({ planId: plan.id, exercise });
          }
        });
      });
      return { date, dayOfWeek, exercises };
    });
  }, [weekDates, weekPlans]);

  const getCheckin = (planId: string, exerciseId: string, date: string) => {
    return checkins.find(
      (c) =>
        c.memberId === currentMemberId &&
        c.planId === planId &&
        c.exerciseId === exerciseId &&
        c.checkinDate === date
    );
  };

  const handleCheckin = (planId: string, exerciseId: string, date: string) => {
    if (!currentMemberId) return;
    const key = `${planId}-${exerciseId}-${date}`;
    setAnimatingIds((prev) => new Set(prev).add(key));
    toggleCheckin(currentMemberId, planId, exerciseId, date);
    setTimeout(() => {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 500);
  };

  const totalExercises = daysWithExercises.reduce((sum, day) => sum + day.exercises.length, 0);
  const completedExercises = daysWithExercises.reduce((sum, day) => {
    return (
      sum +
      day.exercises.filter(({ planId, exercise }) => {
        const checkin = getCheckin(planId, exercise.id, day.date);
        return checkin?.completed;
      }).length
    );
  }, 0);
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">请先选择会员</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">当周训练计划</h1>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {weekStart} ~ {weekEnd}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">本周完成进度</span>
          <span className="text-sm font-semibold text-emerald-600">
            {completedExercises}/{totalExercises} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {daysWithExercises.map((day) => (
          <div
            key={day.date}
            className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
              isToday(day.date) ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isToday(day.date)
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{getDayName(day.dayOfWeek)}</h3>
                  <p className="text-sm text-gray-500">{day.date}</p>
                </div>
              </div>
              {isToday(day.date) && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                  今天
                </span>
              )}
            </div>

            {day.exercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Dumbbell className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">当日无训练计划</p>
              </div>
            ) : (
              <div className="space-y-3">
                {day.exercises.map(({ planId, exercise }) => {
                  const checkin = getCheckin(planId, exercise.id, day.date);
                  const isCompleted = checkin?.completed;
                  const key = `${planId}-${exercise.id}-${day.date}`;
                  const isAnimating = animatingIds.has(key);

                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-500'
                          }`}
                        >
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isCompleted ? 'text-emerald-700' : 'text-gray-900'
                            }`}
                          >
                            {exercise.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {exercise.sets}组 × {exercise.reps}次
                            {exercise.weight > 0 && ` · ${exercise.weight}kg`}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isCompleted ? (
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium transition-all duration-300 ${
                              isAnimating ? 'scale-110' : 'scale-100'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3" />
                              {checkin?.checkinTime
                                ? formatDateTime(checkin.checkinTime).split(' ')[1]
                                : ''}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCheckin(planId, exercise.id, day.date)}
                            className={`px-5 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                              isAnimating ? 'scale-110' : 'scale-100'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>打卡</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
