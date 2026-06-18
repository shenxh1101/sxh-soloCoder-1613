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

export default function CoachReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, trainingPlans, checkins } = useStore();

  const member = useMemo(() => members.find((m) => m.id === id), [members, id]);
  const memberPlans = useMemo(
    () => trainingPlans.filter((p) => p.memberId === id),
    [trainingPlans, id]
  );

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [baseDate, setBaseDate] = useState<string>(formatDate(new Date()));
  const [selectedMemberId, setSelectedMemberId] = useState<string>(id || '');

  const currentMemberId = selectedMemberId || id || '';
  const currentMember = useMemo(
    () => members.find((m) => m.id === currentMemberId) || member,
    [members, currentMemberId, member]
  );
  const currentPlans = useMemo(
    () => trainingPlans.filter((p) => p.memberId === currentMemberId),
    [trainingPlans, currentMemberId]
  );

  const shiftDate = (direction: number) => {
    const d = new Date(baseDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setBaseDate(formatDate(d));
  };

  const goToToday = () => setBaseDate(formatDate(new Date()));

  const dateRange = useMemo(() => getDateRange(baseDate, viewMode), [baseDate, viewMode]);
  const rangeLabel = useMemo(() => getRangeLabel(baseDate, viewMode), [baseDate, viewMode]);

  const dailyRecords = useMemo((): DayRecord[] => {
    const today = formatDate(new Date());
    return dateRange.map((date) => {
      if (date > today) {
        return { date, expected: 0, completed: 0, missedExercises: [] };
      }
      let expected = 0;
      let completed = 0;
      const missed: string[] = [];
      currentPlans.forEach((plan) => {
        plan.exercises.forEach((exercise) => {
          if (
            isExerciseOnDate(exercise, plan.cycleType, date) &&
            isDateInRange(date, plan.startDate, plan.endDate)
          ) {
            expected++;
            const checkin = checkins.find(
              (c) =>
                c.memberId === currentMemberId &&
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
  }, [dateRange, currentPlans, checkins, currentMemberId]);

  const totalExpected = dailyRecords.reduce((s, d) => s + d.expected, 0);
  const totalCompleted = dailyRecords.reduce((s, d) => s + d.completed, 0);
  const allMissed = dailyRecords.filter((d) => d.missedExercises.length > 0);
  const completionRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

  const streak = useMemo((): number => {
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
  }, [dailyRecords]);

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
                <span className="font-bold text-gray-800">{rangeLabel}</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500">应练次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalExpected}</p>
          <p className="text-xs text-gray-400 mt-1">本期内有安排的训练动作总数</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500">完成次数</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
          <p className="text-xs text-gray-400 mt-1">
            完成率
            <span
              className={cn(
                'font-semibold ml-1',
                completionRate >= 80 ? 'text-emerald-600' : completionRate >= 60 ? 'text-amber-600' : 'text-red-500'
              )}
            >
              {completionRate}%
            </span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500">漏练动作</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{totalExpected - totalCompleted}</p>
          <p className="text-xs text-gray-400 mt-1">
            涉及 {allMissed.length} 个训练日有未完成动作
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-500">连续打卡</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">{streak}</p>
          <p className="text-xs text-gray-400 mt-1">
            {streak > 0 ? '连续完成全部训练的天数' : '当前无连续完成记录'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-amber-600" />
            每日训练明细
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">日期</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">应练</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">完成</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">完成率</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">漏练动作</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dailyRecords.map((day) => {
                const rate = day.expected > 0 ? Math.round((day.completed / day.expected) * 100) : -1;
                const isPast = day.date <= formatDate(new Date());
                return (
                  <tr
                    key={day.date}
                    className={cn(
                      'transition-colors',
                      rate === 100 ? 'bg-emerald-50/40' : rate >= 0 && rate < 100 ? 'bg-red-50/30' : '',
                      !isPast && 'opacity-50'
                    )}
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{day.date}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-700">
                      {day.expected > 0 ? day.expected : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-gray-700">
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
                    <td className="py-3 px-4 text-sm text-center">
                      {day.expected > 0 ? (
                        <span
                          className={cn(
                            'font-semibold',
                            rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-500'
                          )}
                        >
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {day.missedExercises.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {day.missedExercises.map((name, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-md"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : day.expected > 0 ? (
                        <span className="text-emerald-600 text-xs font-medium">全部完成</span>
                      ) : (
                        <span className="text-gray-300 text-xs">无安排</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!isPast ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                          未到
                        </span>
                      ) : day.expected === 0 ? (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs rounded-full">
                          休息
                        </span>
                      ) : rate === 100 ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                          达标
                        </span>
                      ) : rate > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          部分完成
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                          未完成
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {dailyRecords.every((d) => d.expected === 0) && (
            <div className="py-12 text-center text-gray-400">
              该时段无训练安排
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
