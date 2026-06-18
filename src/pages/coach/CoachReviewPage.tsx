import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  CheckCircle,
  XCircle,
  Flame,
  ClipboardCheck,
  Users,
  GitCompare,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useStore } from '../../store';
import {
  formatDate,
  getWeekDates,
  isExerciseOnDate,
  isDateInRange,
} from '../../utils/date';
import { cn } from '../../lib/utils';

type ViewMode = 'week' | 'month';

interface DayRecord {
  date: string;
  expected: number;
  completed: number;
  missedExercises: string[];
}

interface PeriodStats {
  totalExpected: number;
  totalCompleted: number;
  totalMissed: number;
  completionRate: number;
  missedDays: number;
  streak: number;
  rangeLabel: string;
  dailyRecords: DayRecord[];
}

const getDateRange = (baseDate: string, mode: ViewMode): string[] => {
  if (mode === 'week') return getWeekDates(baseDate);
  const base = new Date(baseDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    result.push(formatDate(date));
  }
  return result;
};

const getRangeLabel = (baseDate: string, mode: ViewMode): string => {
  if (mode === 'week') {
    const dates = getWeekDates(baseDate);
    return `${dates[0]} ~ ${dates[6]}`;
  }
  const d = new Date(baseDate);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
};

const computeDailyRecords = (
  dateRange: string[],
  plans: Array<{
    id: string;
    memberId: string;
    cycleType: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    exercises: Array<{
      id: string;
      name: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    }>;
  }>,
  checkins: Array<{
    memberId: string;
    planId: string;
    exerciseId: string;
    checkinDate: string;
    completed: boolean;
  }>,
  memberId: string
): DayRecord[] => {
  const today = formatDate(new Date());
  return dateRange.map((date) => {
    if (date > today) {
      return { date, expected: 0, completed: 0, missedExercises: [] };
    }
    let expected = 0;
    let completed = 0;
    const missed: string[] = [];
    plans.forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        if (
          isExerciseOnDate(exercise, plan.cycleType, date) &&
          isDateInRange(date, plan.startDate, plan.endDate)
        ) {
          expected++;
          const checkin = checkins.find(
            (c) =>
              c.memberId === memberId &&
              c.planId === plan.id &&
              c.exerciseId === exercise.id &&
              c.checkinDate === date &&
              c.completed
          );
          if (checkin) {
            completed++;
          } else {
            missed.push(exercise.name);
          }
        }
      });
    });
    return { date, expected, completed, missedExercises: missed };
  });
};

const computeStreak = (dailyRecords: DayRecord[]): number => {
  const today = formatDate(new Date());
  let count = 0;
  const pastDays = dailyRecords
    .filter((d) => d.date <= today && d.expected > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const day of pastDays) {
    if (day.expected > 0 && day.completed === day.expected) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

const computePeriodStats = (
  baseDate: string,
  viewMode: ViewMode,
  plans: Parameters<typeof computeDailyRecords>[1],
  checkins: Parameters<typeof computeDailyRecords>[2],
  memberId: string
): PeriodStats => {
  const dateRange = getDateRange(baseDate, viewMode);
  const dailyRecords = computeDailyRecords(dateRange, plans, checkins, memberId);
  const totalExpected = dailyRecords.reduce((s, d) => s + d.expected, 0);
  const totalCompleted = dailyRecords.reduce((s, d) => s + d.completed, 0);
  const totalMissed = totalExpected - totalCompleted;
  const missedDays = dailyRecords.filter((d) => d.missedExercises.length > 0).length;
  const completionRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
  const streak = computeStreak(dailyRecords);
  return {
    totalExpected,
    totalCompleted,
    totalMissed,
    missedDays,
    completionRate,
    streak,
    rangeLabel: getRangeLabel(baseDate, viewMode),
    dailyRecords,
  };
};

const DiffBadge = ({ value, unit }: { value: number; unit?: string }) => {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px] font-medium">
        <Minus className="w-3 h-3" />
        持平
      </span>
    );
  }
  const isGood = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium',
        isGood ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
      )}
    >
      {isGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isGood ? '+' : ''}
      {value}
      {unit || ''}
    </span>
  );
};

export default function CoachReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, trainingPlans, checkins } = useStore();

  const member = useMemo(() => members.find((m) => m.id === id), [members, id]);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [baseDate, setBaseDate] = useState<string>(formatDate(new Date()));
  const [selectedMemberId, setSelectedMemberId] = useState<string>(id || '');
  const [compareMode, setCompareMode] = useState(false);
  const [compareBaseDate, setCompareBaseDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  });

  const currentMemberId = selectedMemberId || id || '';
  const currentMember = useMemo(
    () => members.find((m) => m.id === currentMemberId) || member,
    [members, currentMemberId, member]
  );
  const currentPlans = useMemo(
    () => trainingPlans.filter((p) => p.memberId === currentMemberId),
    [trainingPlans, currentMemberId]
  );

  const shiftDate = (direction: number, isCompare = false) => {
    const target = isCompare ? compareBaseDate : baseDate;
    const setter = isCompare ? setCompareBaseDate : setBaseDate;
    const d = new Date(target);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setter(formatDate(d));
  };

  const goToToday = () => setBaseDate(formatDate(new Date()));

  const statsA = useMemo(
    () => computePeriodStats(baseDate, viewMode, currentPlans, checkins, currentMemberId),
    [baseDate, viewMode, currentPlans, checkins, currentMemberId]
  );

  const statsB = useMemo(
    () =>
      compareMode
        ? computePeriodStats(compareBaseDate, viewMode, currentPlans, checkins, currentMemberId)
        : null,
    [compareMode, compareBaseDate, viewMode, currentPlans, checkins, currentMemberId]
  );

  const diffs = useMemo(() => {
    if (!statsB) return null;
    return {
      expected: statsA.totalExpected - statsB.totalExpected,
      completed: statsA.totalCompleted - statsB.totalCompleted,
      missed: statsA.totalMissed - statsB.totalMissed,
      rate: statsA.completionRate - statsB.completionRate,
      streak: statsA.streak - statsB.streak,
    };
  }, [statsA, statsB]);

  const handleMemberChange = (newId: string) => {
    setSelectedMemberId(newId);
    navigate(`/coach/members/${newId}/review`, { replace: true });
  };

  if (!currentMember) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-500">会员不存在</p>
        </div>
      </div>
    );
  }

  const renderStatCard = (
    stats: PeriodStats,
    isCompare: boolean,
    diff?: { expected: number; completed: number; missed: number; rate: number; streak: number } | null
  ) => (
    <div className="space-y-4">
      {isCompare && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">对比时间段</p>
              <p className="text-xs text-gray-500">{stats.rangeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftDate(-1, true)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => shiftDate(1, true)}
              className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={cn('grid gap-4', compareMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}>
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-500">应练次数</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-800">{stats.totalExpected}</p>
            {diff && <DiffBadge value={diff.expected} />}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-500">完成次数</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-600">{stats.totalCompleted}</p>
            {diff && <DiffBadge value={diff.completed} />}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            完成率
            <span
              className={cn(
                'font-semibold ml-1',
                stats.completionRate >= 80
                  ? 'text-emerald-600'
                  : stats.completionRate >= 60
                  ? 'text-amber-600'
                  : 'text-red-500'
              )}
            >
              {stats.completionRate}%
            </span>
            {diff && (
              <span className="ml-1">
                <DiffBadge value={diff.rate} unit="%" />
              </span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-500">漏练动作</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-red-500">{stats.totalMissed}</p>
            {diff && <DiffBadge value={-diff.missed} />}
          </div>
          <p className="text-xs text-gray-400 mt-1">涉及 {stats.missedDays} 个训练日有未完成动作</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-500">连续打卡</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
            {diff && <DiffBadge value={diff.streak} unit="天" />}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {stats.streak > 0 ? '连续完成全部训练的天数' : '当前无连续完成记录'}
          </p>
        </div>
      </div>
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-800">训练复盘</h1>
            <p className="text-sm text-gray-500">
              {currentMember.name} · {currentMember.age}岁 ·{' '}
              {currentMember.gender === 'male' ? '男' : '女'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              compareMode
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <GitCompare className="w-4 h-4" />
            {compareMode ? '关闭对比' : '时间段对比'}
          </button>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={currentMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[140px] text-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
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
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                按周查看
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  viewMode === 'month'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                按月查看
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              本期
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftDate(-1)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 min-w-[160px] text-center">
                <span className="font-bold text-gray-800">{statsA.rangeLabel}</span>
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
      </div>

      {renderStatCard(statsA, false)}

      {compareMode && statsB && (
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5">
          {renderStatCard(statsB, true, diffs)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(() => {
          type Col = { label: string; stats: PeriodStats; tone: 'default' | 'compare' };
          const cols: Col[] = [{ label: '本期明细', stats: statsA, tone: 'default' }];
          if (compareMode && statsB) {
            cols.push({ label: `对比期 (${statsB.rangeLabel})`, stats: statsB, tone: 'compare' });
          }
          return cols;
        })().map((col) => (
          <div
            key={col.label}
            className={cn(
              'bg-white rounded-2xl shadow-sm border overflow-hidden',
              col.tone === 'compare' ? 'border-purple-200' : 'border-gray-100'
            )}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Dumbbell
                  className={cn(
                    'w-5 h-5',
                    col.tone === 'compare' ? 'text-purple-600' : 'text-amber-600'
                  )}
                />
                {col.label}
              </h2>
            </div>
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-600">日期</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-600">应练</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-600">完成</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-600">完成率</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {col.stats.dailyRecords.map((day) => {
                    const rate =
                      day.expected > 0 ? Math.round((day.completed / day.expected) * 100) : -1;
                    const isPast = day.date <= formatDate(new Date());
                    return (
                      <tr
                        key={day.date}
                        className={cn(
                          'transition-colors',
                          rate === 100
                            ? 'bg-emerald-50/40'
                            : rate >= 0 && rate < 100
                            ? 'bg-red-50/30'
                            : '',
                          !isPast && 'opacity-50'
                        )}
                      >
                        <td className="py-2.5 px-3 text-xs text-gray-900 font-medium">{day.date}</td>
                        <td className="py-2.5 px-3 text-xs text-center text-gray-700">
                          {day.expected > 0 ? day.expected : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-center text-gray-700">
                          {day.expected > 0 ? (
                            <span
                              className={cn(
                                'font-semibold',
                                day.completed === day.expected ? 'text-emerald-600' : 'text-gray-800'
                              )}
                            >
                              {day.completed}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-center">
                          {day.expected > 0 ? (
                            <span
                              className={cn(
                                'font-semibold',
                                rate >= 80
                                  ? 'text-emerald-600'
                                  : rate >= 60
                                  ? 'text-amber-600'
                                  : 'text-red-500'
                              )}
                            >
                              {rate}%
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {!isPast ? (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[11px] rounded-full">
                              未到
                            </span>
                          ) : day.expected === 0 ? (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-full">
                              休息
                            </span>
                          ) : rate === 100 ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] rounded-full font-medium">
                              达标
                            </span>
                          ) : rate > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] rounded-full font-medium">
                              部分
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] rounded-full font-medium">
                              未完成
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {col.stats.dailyRecords.every((d) => d.expected === 0) && (
                <div className="py-10 text-center text-gray-400 text-sm">该时段无训练安排</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {compareMode && statsB && diffs && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            对比变化总结
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">应练次数变化</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">
                  {diffs.expected > 0 ? `+${diffs.expected}` : diffs.expected}
                </span>
                <DiffBadge value={diffs.expected} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">完成次数变化</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">
                  {diffs.completed > 0 ? `+${diffs.completed}` : diffs.completed}
                </span>
                <DiffBadge value={diffs.completed} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">完成率变化</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">
                  {diffs.rate > 0 ? `+${diffs.rate}` : diffs.rate}%
                </span>
                <DiffBadge value={diffs.rate} unit="%" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">漏练变化</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">
                  {diffs.missed > 0 ? `+${diffs.missed}` : diffs.missed}
                </span>
                <DiffBadge value={-diffs.missed} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">负数为改善</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">连续打卡变化</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">
                  {diffs.streak > 0 ? `+${diffs.streak}` : diffs.streak}
                </span>
                <DiffBadge value={diffs.streak} unit="天" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
