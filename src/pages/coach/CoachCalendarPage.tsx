import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Dumbbell,
  CheckCircle,
  Clock,
  ArrowLeft,
  X,
  ClipboardCheck,
  Users,
} from 'lucide-react';
import { useStore } from '../../store';
import {
  formatDate,
  getWeekDates,
  getDayName,
  getExerciseDayLabel,
  isExerciseOnDate,
  isDateInRange,
  formatTimeOnly,
  isToday,
} from '../../utils/date';
import { cn } from '../../lib/utils';
import type { PlanExercise } from '../../types';

type ViewMode = 'week' | 'month';

interface DayData {
  date: string;
  isCurrentMonth: boolean;
  exercises: Array<{
    planId: string;
    planName: string;
    exercise: PlanExercise;
    cycleType: 'weekly' | 'monthly';
    checkin?: { completed: boolean; checkinTime?: string };
  }>;
}

const getMonthDates = (baseDate: string | Date): { date: string; isCurrentMonth: boolean }[] => {
  const base = typeof baseDate === 'string' ? new Date(baseDate) : baseDate;
  const year = base.getFullYear();
  const month = base.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstDayWeekday = firstDay.getDay();
  const diffToMonday = firstDayWeekday === 0 ? -6 : 1 - firstDayWeekday;
  const startCalendar = new Date(firstDay);
  startCalendar.setDate(firstDay.getDate() + diffToMonday);

  const result: { date: string; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startCalendar);
    d.setDate(startCalendar.getDate() + i);
    result.push({
      date: formatDate(d),
      isCurrentMonth: d.getMonth() === month,
    });
  }
  return result;
};

const getMonthLabel = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};

export default function CoachCalendarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, trainingPlans, checkins } = useStore();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(id || '');

  const currentMemberId = selectedMemberId || id || '';
  const member = useMemo(() => members.find((m) => m.id === currentMemberId), [members, currentMemberId]);
  const memberPlans = useMemo(
    () => trainingPlans.filter((p) => p.memberId === currentMemberId),
    [trainingPlans, currentMemberId]
  );

  const handleMemberChange = (newId: string) => {
    setSelectedMemberId(newId);
    navigate(`/coach/members/${newId}/calendar`, { replace: true });
  };

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [baseDate, setBaseDate] = useState<string>(formatDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const shiftDate = (direction: number) => {
    const d = new Date(baseDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setBaseDate(formatDate(d));
  };

  const goToToday = () => {
    setBaseDate(formatDate(new Date()));
  };

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const monthDates = useMemo(() => getMonthDates(baseDate), [baseDate]);

  const getExercisesForDate = (dateStr: string): DayData['exercises'] => {
    const result: DayData['exercises'] = [];
    memberPlans.forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        if (
          isExerciseOnDate(exercise, plan.cycleType, dateStr) &&
          isDateInRange(dateStr, plan.startDate, plan.endDate)
        ) {
          const checkin = checkins.find(
            (c) =>
              c.memberId === currentMemberId &&
              c.planId === plan.id &&
              c.exerciseId === exercise.id &&
              c.checkinDate === dateStr
          );
          result.push({
            planId: plan.id,
            planName: plan.name,
            exercise,
            cycleType: plan.cycleType,
            checkin,
          });
        }
      });
    });
    return result;
  };

  const weekDaysData = useMemo(() => {
    return weekDates.map((date) => ({
      date,
      exercises: getExercisesForDate(date),
    }));
  }, [weekDates, memberPlans, checkins, currentMemberId]);

  const monthDaysData = useMemo(() => {
    return monthDates.map(({ date, isCurrentMonth }) => ({
      date,
      isCurrentMonth,
      exercises: getExercisesForDate(date),
    }));
  }, [monthDates, memberPlans, checkins, currentMemberId]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return {
      date: selectedDate,
      exercises: getExercisesForDate(selectedDate),
    };
  }, [selectedDate, memberPlans, checkins, currentMemberId]);

  const totalExercisesWeek = weekDaysData.reduce((sum, d) => sum + d.exercises.length, 0);
  const completedExercisesWeek = weekDaysData.reduce(
    (sum, d) => sum + d.exercises.filter((e) => e.checkin?.completed).length,
    0
  );

  if (!member) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-500">会员不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/coach/members')}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{member.name}</h1>
            <p className="text-sm text-gray-500">
              {member.age}岁 · {member.gender === 'male' ? '男' : '女'} · 训练计划日历
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={currentMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[140px] text-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate(`/coach/members/${currentMemberId}/review`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            训练复盘
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  viewMode === 'week'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                周视图
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  viewMode === 'month'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                月视图
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              今天
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftDate(-1)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 min-w-[140px] text-center">
                <span className="font-bold text-gray-800">
                  {viewMode === 'week'
                    ? `${weekDates[0]} ~ ${weekDates[6]}`
                    : getMonthLabel(baseDate)}
                </span>
              </div>
              <button
                onClick={() => shiftDate(1)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'week' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-6 text-sm">
            <span className="text-gray-500">
              本周应打卡：
              <span className="font-semibold text-gray-800">{totalExercisesWeek}次</span>
            </span>
            <span className="text-gray-500">
              已完成：
              <span className="font-semibold text-emerald-600">{completedExercisesWeek}次</span>
            </span>
            <span className="text-gray-500">
              完成率：
              <span
                className={cn(
                  'font-semibold',
                  totalExercisesWeek > 0 &&
                    (completedExercisesWeek / totalExercisesWeek) * 100 < 60
                    ? 'text-red-500'
                    : 'text-emerald-600'
                )}
              >
                {totalExercisesWeek > 0
                  ? Math.round((completedExercisesWeek / totalExercisesWeek) * 100)
                  : 0}
                %
              </span>
            </span>
          </div>
        )}
      </div>

      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDaysData.map((day, idx) => {
            const completedCount = day.exercises.filter((e) => e.checkin?.completed).length;
            const totalCount = day.exercises.length;
            return (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  'bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md',
                  isToday(day.date)
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-gray-100',
                  selectedDate === day.date && 'ring-2 ring-green-300 border-green-300'
                )}
              >
                <div className="mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{getDayName(idx)}</h3>
                    {isToday(day.date) && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                        今
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{day.date}</p>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {day.exercises.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center pt-8">无训练</p>
                  ) : (
                    day.exercises.map(({ exercise, checkin }, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-2 rounded-lg text-xs',
                          checkin?.completed
                            ? 'bg-emerald-50 border border-emerald-100'
                            : 'bg-gray-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={cn(
                              'font-medium',
                              checkin?.completed ? 'text-emerald-700' : 'text-gray-700'
                            )}
                          >
                            {exercise.name}
                          </span>
                          {checkin?.completed && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {exercise.sets}×{exercise.reps}
                          {exercise.weight > 0 && ` ·${exercise.weight}kg`}
                        </p>
                        {checkin?.completed && checkin.checkinTime && (
                          <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeOnly(checkin.checkinTime)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {totalCount > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">完成度</span>
                      <span
                        className={cn(
                          'font-semibold',
                          completedCount === totalCount
                            ? 'text-emerald-600'
                            : completedCount === 0
                            ? 'text-gray-400'
                            : 'text-orange-500'
                        )}
                      >
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['一', '二', '三', '四', '五', '六', '日'].map((name, i) => (
              <div
                key={name}
                className={cn(
                  'px-3 py-2.5 text-center text-sm font-medium border-r border-gray-100',
                  i === 6 ? 'text-red-500' : 'text-gray-600'
                )}
              >
                周{name}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDaysData.map((day, idx) => {
              const completedCount = day.exercises.filter((e) => e.checkin?.completed).length;
              const totalCount = day.exercises.length;
              return (
                <div
                  key={`${day.date}-${idx}`}
                  onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  className={cn(
                    'min-h-[96px] border-r border-b border-gray-100 p-2 transition-all',
                    day.isCurrentMonth
                      ? 'bg-white cursor-pointer hover:bg-gray-50'
                      : 'bg-gray-50/60 cursor-default',
                    isToday(day.date) && 'bg-emerald-50/50',
                    selectedDate === day.date &&
                      day.isCurrentMonth &&
                      'bg-green-50 ring-2 ring-inset ring-green-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        'text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center',
                        isToday(day.date)
                          ? 'bg-emerald-500 text-white'
                          : day.isCurrentMonth
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      )}
                    >
                      {new Date(day.date).getDate()}
                    </span>
                    {totalCount > 0 && day.isCurrentMonth && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          completedCount === totalCount
                            ? 'bg-emerald-100 text-emerald-700'
                            : completedCount > 0
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {completedCount}/{totalCount}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {day.exercises.slice(0, 3).map(({ exercise, checkin }, i) => (
                      <div
                        key={i}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded truncate',
                          checkin?.completed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        )}
                        title={exercise.name}
                      >
                        · {exercise.name}
                      </div>
                    ))}
                    {day.exercises.length > 3 && (
                      <p className="text-[10px] text-gray-400 px-1.5">
                        +{day.exercises.length - 3} 更多
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDayData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedDayData.date}</h3>
                <p className="text-sm text-gray-500">
                  共 {selectedDayData.exercises.length} 个训练动作
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {selectedDayData.exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">当日无训练计划</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayData.exercises.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        item.checkin?.completed
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-gray-50 border-gray-100'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              item.checkin?.completed
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-500'
                            )}
                          >
                            <Dumbbell className="w-5 h-5" />
                          </div>
                          <div>
                            <h4
                              className={cn(
                                'font-semibold',
                                item.checkin?.completed
                                  ? 'text-emerald-700'
                                  : 'text-gray-800'
                              )}
                            >
                              {item.exercise.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.planName} ·{' '}
                              {getExerciseDayLabel(item.exercise, item.cycleType)}
                            </p>
                          </div>
                        </div>
                        {item.checkin?.completed && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-13 text-sm text-gray-600 pl-13">
                        <span className="px-2.5 py-1 bg-white rounded-md border border-gray-200">
                          {item.exercise.sets} 组
                        </span>
                        <span className="px-2.5 py-1 bg-white rounded-md border border-gray-200">
                          {item.exercise.reps} 次
                        </span>
                        {item.exercise.weight > 0 && (
                          <span className="px-2.5 py-1 bg-white rounded-md border border-gray-200">
                            {item.exercise.weight} kg
                          </span>
                        )}
                      </div>
                      {item.checkin?.completed && (
                        <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center gap-2 pl-13">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">
                            打卡时间：{formatTimeOnly(item.checkin.checkinTime || '')}
                          </span>
                        </div>
                      )}
                      {!item.checkin?.completed && (
                        <div className="mt-3 pt-3 border-t border-gray-100 pl-13">
                          <span className="text-sm text-gray-400">未打卡</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
