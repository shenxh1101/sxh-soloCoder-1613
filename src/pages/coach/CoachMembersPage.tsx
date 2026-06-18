import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  FileText,
  Dumbbell,
  AlertTriangle,
  Users,
  Activity,
  Target,
  TrendingUp,
  User,
  CalendarDays,
  Percent,
  CalendarClock,
} from 'lucide-react';
import { useStore } from '../../store';
import { StatCard, DiffBadge } from '../../components/common';
import { exportMeasurementsToExcel, exportAllMembersMeasurementsToExcel } from '../../utils/export';
import { getWeekDates, isExerciseOnDate, isDateInRange, formatDate } from '../../utils/date';
import { cn } from '../../lib/utils';
import type { Member, Measurement } from '../../types';

type FilterType = 'all' | 'rebound' | 'overfat' | 'attention';
type CheckinRateFilter = 'all' | 'lt60' | '60to80' | 'gte80';
type LastMeasurementFilter = 'all' | 'within7' | 'within30' | 'over30' | 'never';

interface MemberSummary {
  member: Member;
  latestMeasurement: Measurement | null;
  previousMeasurement: Measurement | null;
  weightDiff: number | null;
  bodyFatDiff: number | null;
  isWeightRebound: boolean;
  isOverFat: boolean;
  needsAttention: boolean;
  checkinRate: number;
  daysSinceLastMeasurement: number | null;
}

export default function CoachMembersPage() {
  const navigate = useNavigate();
  const members = useStore((s) => s.members);
  const measurements = useStore((s) => s.measurements);
  const plans = useStore((s) => s.trainingPlans);
  const checkins = useStore((s) => s.checkins);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [checkinRateFilter, setCheckinRateFilter] = useState<CheckinRateFilter>('all');
  const [lastMeasurementFilter, setLastMeasurementFilter] = useState<LastMeasurementFilter>('all');

  const weekDates = useMemo(() => getWeekDates(), []);
  const today = useMemo(() => new Date(formatDate(new Date())), []);

  const getMemberMeasurements = (memberId: string): Measurement[] => {
    return measurements
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateCheckinRate = (memberId: string): number => {
    const memberPlans = plans.filter((p) => p.memberId === memberId);
    const memberPlanIds = memberPlans.map((p) => p.id);
    const memberExerciseIds = memberPlans.flatMap((p) =>
      p.exercises.map((e) => e.id)
    );

    let expectedThisWeek = 0;
    memberPlans.forEach((plan) => {
      plan.exercises.forEach((exercise) => {
        weekDates.forEach((date) => {
          if (
            isExerciseOnDate(exercise, plan.cycleType, date) &&
            isDateInRange(date, plan.startDate, plan.endDate)
          ) {
            expectedThisWeek++;
          }
        });
      });
    });

    const weekCheckins = checkins.filter(
      (c) =>
        c.memberId === memberId &&
        memberPlanIds.includes(c.planId) &&
        memberExerciseIds.includes(c.exerciseId) &&
        weekDates.includes(c.checkinDate) &&
        c.completed
    );

    return expectedThisWeek > 0
      ? (weekCheckins.length / expectedThisWeek) * 100
      : 0;
  };

  const memberSummaries: MemberSummary[] = useMemo(() => {
    return members.map((member) => {
      const memberMeasurements = getMemberMeasurements(member.id);
      const latest = memberMeasurements[0] || null;
      const previous = memberMeasurements[1] || null;

      const weightDiff =
        latest && previous
          ? Number((latest.weight - previous.weight).toFixed(1))
          : null;
      const bodyFatDiff =
        latest && previous
          ? Number((latest.bodyFatRate - previous.bodyFatRate).toFixed(1))
          : null;

      const isWeightRebound = weightDiff !== null && weightDiff > 0.5;
      const isOverFat =
        latest !== null &&
        ((member.gender === 'male' && latest.bodyFatRate > 25) ||
          (member.gender === 'female' && latest.bodyFatRate > 30));
      const needsAttention = isWeightRebound || isOverFat;

      let daysSinceLastMeasurement: number | null = null;
      if (latest) {
        const latestDate = new Date(latest.date);
        daysSinceLastMeasurement = Math.floor(
          (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        member,
        latestMeasurement: latest,
        previousMeasurement: previous,
        weightDiff,
        bodyFatDiff,
        isWeightRebound,
        isOverFat,
        needsAttention,
        checkinRate: calculateCheckinRate(member.id),
        daysSinceLastMeasurement,
      };
    });
  }, [members, measurements, plans, checkins, today]);

  const totalMembers = members.length;

  const newMeasurementsThisWeek = useMemo(() => {
    return measurements.filter((m) => weekDates.includes(m.date)).length;
  }, [measurements, weekDates]);

  const attentionCount = memberSummaries.filter((s) => s.needsAttention).length;

  const avgCheckinRate = useMemo(() => {
    if (memberSummaries.length === 0) return 0;
    const total = memberSummaries.reduce((sum, s) => sum + s.checkinRate, 0);
    return total / memberSummaries.length;
  }, [memberSummaries]);

  const filteredSummaries = useMemo(() => {
    let result = memberSummaries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.member.name.toLowerCase().includes(q));
    }

    if (filterType === 'rebound') {
      result = result.filter((s) => s.isWeightRebound);
    } else if (filterType === 'overfat') {
      result = result.filter((s) => s.isOverFat);
    } else if (filterType === 'attention') {
      result = result.filter((s) => s.needsAttention);
    }

    if (checkinRateFilter === 'lt60') {
      result = result.filter((s) => s.checkinRate < 60);
    } else if (checkinRateFilter === '60to80') {
      result = result.filter((s) => s.checkinRate >= 60 && s.checkinRate < 80);
    } else if (checkinRateFilter === 'gte80') {
      result = result.filter((s) => s.checkinRate >= 80);
    }

    if (lastMeasurementFilter === 'within7') {
      result = result.filter(
        (s) => s.daysSinceLastMeasurement !== null && s.daysSinceLastMeasurement <= 7
      );
    } else if (lastMeasurementFilter === 'within30') {
      result = result.filter(
        (s) => s.daysSinceLastMeasurement !== null && s.daysSinceLastMeasurement <= 30
      );
    } else if (lastMeasurementFilter === 'over30') {
      result = result.filter(
        (s) => s.daysSinceLastMeasurement !== null && s.daysSinceLastMeasurement > 30
      );
    } else if (lastMeasurementFilter === 'never') {
      result = result.filter((s) => s.daysSinceLastMeasurement === null);
    }

    return result;
  }, [memberSummaries, searchQuery, filterType, checkinRateFilter, lastMeasurementFilter]);

  const isFiltered =
    filterType !== 'all' ||
    checkinRateFilter !== 'all' ||
    lastMeasurementFilter !== 'all' ||
    searchQuery.trim() !== '';

  const handleExportAll = () => {
    const exportTargets = isFiltered ? filteredSummaries.map((s) => s.member) : members;
    const memberList = exportTargets.map((m) => ({ id: m.id, name: m.name }));
    exportAllMembersMeasurementsToExcel(memberList, measurements);
  };

  const handleExportMember = (summary: MemberSummary) => {
    const memberMeasurements = getMemberMeasurements(summary.member.id);
    exportMeasurementsToExcel(summary.member.name, memberMeasurements);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">会员体测汇总</h1>
          <p className="text-gray-500 mt-1">
            管理所有会员的体测数据与健康状态
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总会员数"
          value={totalMembers}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="本周新体测数"
          value={newMeasurementsThisWeek}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="需要关注会员数"
          value={attentionCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={attentionCount > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="平均打卡率"
          value={`${Math.round(avgCheckinRate)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={avgCheckinRate >= 80 ? 'green' : avgCheckinRate >= 60 ? 'orange' : 'red'}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索会员姓名..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
                >
                  <option value="all">全部会员</option>
                  <option value="rebound">体重反弹</option>
                  <option value="overfat">体脂超标</option>
                  <option value="attention">需要关注</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isFiltered && (
                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium whitespace-nowrap">
                  已筛选 {filteredSummaries.length}/{members.length} 人
                </span>
              )}
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {isFiltered ? `导出筛选结果(${filteredSummaries.length})` : '导出全部Excel'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center pt-1 border-t border-gray-50">
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={checkinRateFilter}
                onChange={(e) => setCheckinRateFilter(e.target.value as CheckinRateFilter)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[180px] text-sm"
              >
                <option value="all">打卡率：全部</option>
                <option value="lt60">打卡率＜60%</option>
                <option value="60to80">打卡率 60%~80%</option>
                <option value="gte80">打卡率≥80%</option>
              </select>
            </div>
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={lastMeasurementFilter}
                onChange={(e) => setLastMeasurementFilter(e.target.value as LastMeasurementFilter)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px] text-sm"
              >
                <option value="all">最近体测：全部</option>
                <option value="within7">最近 7 天内</option>
                <option value="within30">最近 30 天内</option>
                <option value="over30">超过 30 天</option>
                <option value="never">从未体测</option>
              </select>
            </div>
            {isFiltered && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setCheckinRateFilter('all');
                  setLastMeasurementFilter('all');
                }}
                className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">会员</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">年龄</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">性别</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">最新体重</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">体重变化</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">最新体脂率</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">体脂变化</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">最近体测日期</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSummaries.map((summary) => (
                <tr
                  key={summary.member.id}
                  className={cn(
                    'transition-colors',
                    summary.needsAttention
                      ? 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {summary.member.avatar ? (
                          <img
                            src={summary.member.avatar}
                            alt={summary.member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {summary.member.name}
                          </span>
                          {summary.needsAttention && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(summary.checkinRate)}% 打卡率
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {summary.member.age}岁
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {summary.member.gender === 'male' ? '男' : '女'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">
                    {summary.latestMeasurement
                      ? `${summary.latestMeasurement.weight} kg`
                      : '--'}
                  </td>
                  <td className="py-4 px-4">
                    {summary.weightDiff !== null ? (
                      <DiffBadge value={summary.weightDiff} unit="kg" inverse />
                    ) : (
                      <span className="text-xs text-gray-400">--</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">
                    {summary.latestMeasurement
                      ? `${summary.latestMeasurement.bodyFatRate}%`
                      : '--'}
                  </td>
                  <td className="py-4 px-4">
                    {summary.bodyFatDiff !== null ? (
                      <DiffBadge value={summary.bodyFatDiff} unit="%" inverse />
                    ) : (
                      <span className="text-xs text-gray-400">--</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {summary.latestMeasurement ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{summary.latestMeasurement.date}</span>
                        {summary.daysSinceLastMeasurement !== null && (
                          <span
                            className={cn(
                              'text-[11px] mt-0.5',
                              summary.daysSinceLastMeasurement <= 7
                                ? 'text-emerald-600'
                                : summary.daysSinceLastMeasurement <= 30
                                ? 'text-amber-600'
                                : 'text-red-500'
                            )}
                          >
                            {summary.daysSinceLastMeasurement === 0
                              ? '今天'
                              : `${summary.daysSinceLastMeasurement} 天前`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">从未体测</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/coach/members/${summary.member.id}/measurements`
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        录入体测
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/coach/members/${summary.member.id}/plans`)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        训练计划
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/coach/members/${summary.member.id}/calendar`)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        计划日历
                      </button>
                      <button
                        onClick={() => handleExportMember(summary)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        导出
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSummaries.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              暂无符合条件的会员数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
