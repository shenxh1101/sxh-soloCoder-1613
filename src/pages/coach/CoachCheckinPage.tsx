import {
  Users,
  CalendarCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../../store';
import { StatCard } from '../../components/common';
import { cn } from '../../lib/utils';
import { getWeekDates, formatDate, isExerciseOnDate } from '../../utils/date';

const getRateColor = (rate: number) => {
  if (rate < 60) return '#ef4444';
  if (rate < 80) return '#f59e0b';
  return '#22c55e';
};

const getRateBgColor = (rate: number) => {
  if (rate < 60) return 'bg-red-50 border-red-100';
  if (rate < 80) return 'bg-orange-50 border-orange-100';
  return 'bg-green-50 border-green-100';
};

interface RingProgressProps {
  rate: number;
  size?: number;
}

function RingProgress({ rate, size = 80 }: RingProgressProps) {
  const color = getRateColor(rate);
  const data = [
    { name: 'completed', value: rate },
    { name: 'remaining', value: 100 - rate },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.48}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-lg font-bold"
          style={{ color }}
        >
          {Math.round(rate)}%
        </span>
      </div>
    </div>
  );
}

export default function CoachCheckinPage() {
  const members = useStore((s) => s.members);
  const plans = useStore((s) => s.trainingPlans);
  const checkins = useStore((s) => s.checkins);

  const weekDates = getWeekDates();
  const today = formatDate(new Date());

  const memberStats = members.map((member) => {
    const memberPlans = plans.filter((p) => p.memberId === member.id);
    const memberPlanIds = memberPlans.map((p) => p.id);
    const memberExerciseIds = memberPlans.flatMap((p) =>
      p.exercises.map((e) => e.id)
    );

    let expectedThisWeek = 0;
    memberPlans.forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        weekDates.forEach((date) => {
          if (isExerciseOnDate(exercise, plan.cycleType, date)) {
            expectedThisWeek++;
          }
        });
      });
    });

    const weekCheckins = checkins.filter(
      (c) =>
        c.memberId === member.id &&
        memberPlanIds.includes(c.planId) &&
        memberExerciseIds.includes(c.exerciseId) &&
        weekDates.includes(c.checkinDate) &&
        c.completed
    );

    const completedThisWeek = weekCheckins.length;
    const rate =
      expectedThisWeek > 0 ? (completedThisWeek / expectedThisWeek) * 100 : 0;

    const todayCheckins = checkins.filter(
      (c) =>
        c.memberId === member.id &&
        memberPlanIds.includes(c.planId) &&
        memberExerciseIds.includes(c.exerciseId) &&
        c.checkinDate === today &&
        c.completed
    );

    return {
      member,
      expectedThisWeek,
      completedThisWeek,
      rate,
      checkedToday: todayCheckins.length > 0,
    };
  });

  const totalMembers = members.length;
  const totalWeekCheckins = memberStats.reduce(
    (sum, s) => sum + s.completedThisWeek,
    0
  );
  const avgRate =
    totalMembers > 0
      ? memberStats.reduce((sum, s) => sum + s.rate, 0) / totalMembers
      : 0;
  const todayCheckedCount = memberStats.filter((s) => s.checkedToday).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">会员打卡统计</h1>
        <p className="text-gray-500 mt-1">
          本周：{weekDates[0]} ~ {weekDates[6]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总会员数"
          value={totalMembers}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="本周总打卡次数"
          value={totalWeekCheckins}
          icon={<CalendarCheck className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="平均完成率"
          value={`${Math.round(avgRate)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={avgRate >= 80 ? 'green' : avgRate >= 60 ? 'orange' : 'red'}
        />
        <StatCard
          title="今日打卡人数"
          value={todayCheckedCount}
          icon={<UserCheck className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">会员完成率</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {memberStats.map((stat, idx) => (
            <div
              key={stat.member.id}
              className={cn(
                'p-5 flex items-center gap-4 transition-all duration-300 hover:bg-gray-50 animate-slide-up',
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <RingProgress rate={stat.rate} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">
                    {stat.member.name}
                  </h3>
                  {stat.checkedToday && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      今日已打卡
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>
                    {stat.member.gender === 'male' ? '男' : '女'} ·{' '}
                    {stat.member.age}岁
                  </span>
                  <span>·</span>
                  <span>
                    本周应打卡{' '}
                    <span className="font-medium text-gray-700">
                      {stat.expectedThisWeek}
                    </span>{' '}
                    次
                  </span>
                  <span>·</span>
                  <span>
                    已完成{' '}
                    <span
                      className="font-medium"
                      style={{ color: getRateColor(stat.rate) }}
                    >
                      {stat.completedThisWeek}
                    </span>{' '}
                    次
                  </span>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(stat.rate, 100)}%`,
                        backgroundColor: getRateColor(stat.rate),
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  'px-4 py-2 rounded-xl border font-bold text-lg',
                  getRateBgColor(stat.rate)
                )}
                style={{ color: getRateColor(stat.rate) }}
              >
                {Math.round(stat.rate)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
