import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Scale, TrendingUp, History, User, Filter, Download, Calendar } from 'lucide-react';
import { StatCard, DiffBadge } from '../../components/common';
import { useStore } from '../../store';
import { cn } from '../../lib/utils';
import { exportMeasurementsToExcel } from '../../utils/export';
import type { Measurement } from '../../types';

type MetricKey = 'weight' | 'bodyFatRate' | 'chest' | 'waist' | 'hip' | 'heartRate';
type TimeRange = 'all' | '3m' | '6m';

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  all: '全部',
  '3m': '最近3个月',
  '6m': '最近半年',
};

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  yAxis: 'left' | 'right';
  group: 'body' | 'circumference' | 'cardio';
}

const ALL_METRICS: MetricConfig[] = [
  { key: 'weight', label: '体重', unit: 'kg', color: '#10b981', yAxis: 'left', group: 'body' },
  { key: 'bodyFatRate', label: '体脂率', unit: '%', color: '#f97316', yAxis: 'right', group: 'body' },
  { key: 'chest', label: '胸围', unit: 'cm', color: '#6366f1', yAxis: 'left', group: 'circumference' },
  { key: 'waist', label: '腰围', unit: 'cm', color: '#ec4899', yAxis: 'left', group: 'circumference' },
  { key: 'hip', label: '臀围', unit: 'cm', color: '#8b5cf6', yAxis: 'left', group: 'circumference' },
  { key: 'heartRate', label: '心率', unit: 'bpm', color: '#ef4444', yAxis: 'right', group: 'cardio' },
];

const GROUP_LABELS: Record<string, string> = {
  body: '身体指标',
  circumference: '围度指标',
  cardio: '心肺指标',
};

type MetricDiffMap = Partial<Record<MetricKey, number | null>>;

const computeDiffs = (
  measurements: Measurement[],
  metrics: MetricKey[]
): { vsFirst: MetricDiffMap; vsPrev: MetricDiffMap } => {
  const current = measurements[measurements.length - 1];
  const first = measurements[0];
  const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;
  const vsFirst: MetricDiffMap = {};
  const vsPrev: MetricDiffMap = {};
  metrics.forEach((key) => {
    if (current && first && current[key] != null && first[key] != null) {
      vsFirst[key] = Number(((current[key] as number) - (first[key] as number)).toFixed(1));
    } else {
      vsFirst[key] = null;
    }
    if (current && previous && current[key] != null && previous[key] != null) {
      vsPrev[key] = Number(((current[key] as number) - (previous[key] as number)).toFixed(1));
    } else {
      vsPrev[key] = null;
    }
  });
  return { vsFirst, vsPrev };
};

export default function MemberTrendsPage() {
  const { members, measurements, currentMemberId } = useStore();

  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    'weight',
    'bodyFatRate',
  ]);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const member = members.find((m) => m.id === currentMemberId);

  const allMemberMeasurements = useMemo(() => {
    return measurements
      .filter((m) => m.memberId === currentMemberId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, currentMemberId]);

  const memberMeasurements = useMemo(() => {
    if (timeRange === 'all') return allMemberMeasurements;
    const now = new Date();
    const cutoff = new Date(now);
    if (timeRange === '3m') {
      cutoff.setMonth(cutoff.getMonth() - 3);
    } else if (timeRange === '6m') {
      cutoff.setMonth(cutoff.getMonth() - 6);
    }
    const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    return allMemberMeasurements.filter((m) => m.date >= cutoffStr);
  }, [allMemberMeasurements, timeRange]);

  const selectedMetricConfigs = useMemo(
    () => ALL_METRICS.filter((m) => selectedMetrics.includes(m.key)),
    [selectedMetrics]
  );

  const chartData = useMemo(
    () =>
      memberMeasurements.map((m) => {
        const row: Record<string, number | string> = { date: m.date };
        selectedMetrics.forEach((key) => {
          row[key] = m[key] as number;
        });
        return row;
      }),
    [memberMeasurements, selectedMetrics]
  );

  const current = memberMeasurements[memberMeasurements.length - 1];
  const first = memberMeasurements[0];
  const previous =
    memberMeasurements.length > 1
      ? memberMeasurements[memberMeasurements.length - 2]
      : null;

  const { vsFirst: allDiffsFirst, vsPrev: allDiffsPrev } = computeDiffs(
    memberMeasurements,
    ALL_METRICS.map((m) => m.key)
  );

  const recentRecords = [...memberMeasurements].reverse().slice(0, 10);

  const handleExport = () => {
    if (!member) return;
    exportMeasurementsToExcel(member.name, [...memberMeasurements].reverse());
  };

  const getHistoryDiff = (index: number): MetricDiffMap => {
    if (index >= recentRecords.length - 1) {
      const empty: MetricDiffMap = {};
      selectedMetrics.forEach((k) => (empty[k] = null));
      return empty;
    }
    const currentRecord = recentRecords[index];
    const prevRecord = recentRecords[index + 1];
    const diffs: MetricDiffMap = {};
    selectedMetrics.forEach((key) => {
      if (currentRecord[key] != null && prevRecord[key] != null) {
        diffs[key] = Number(
          (((currentRecord[key] as number) - (prevRecord[key] as number)) as number).toFixed(1)
        );
      } else {
        diffs[key] = null;
      }
    });
    return diffs;
  };

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const groupedMetrics = useMemo(() => {
    const groups: Record<string, MetricConfig[]> = {};
    ALL_METRICS.forEach((m) => {
      if (!groups[m.group]) groups[m.group] = [];
      groups[m.group].push(m);
    });
    return groups;
  }, []);

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">请先选择会员</p>
      </div>
    );
  }

  const showLeftAxis = selectedMetricConfigs.some((m) => m.yAxis === 'left');
  const showRightAxis = selectedMetricConfigs.some((m) => m.yAxis === 'right');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的体测趋势</h1>
          <p className="text-sm text-gray-500">{member.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Filter className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">指标选择</h3>
              <p className="text-xs text-gray-400">
                已选择 {selectedMetrics.length}/{ALL_METRICS.length} 项
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(groupedMetrics).map(([group, metrics]) => (
                <div key={group}>
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">
                    {GROUP_LABELS[group]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((metric) => {
                      const selected = selectedMetrics.includes(metric.key);
                      return (
                        <button
                          key={metric.key}
                          onClick={() => toggleMetric(metric.key)}
                          className={cn(
                            'relative pl-9 pr-3 py-2 rounded-lg text-sm font-medium transition-all border',
                            selected
                              ? 'bg-white shadow-sm border-gray-200 text-gray-800'
                              : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                              selected
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-gray-300 bg-white'
                            )}
                          >
                            {selected && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{
                              backgroundColor: selected ? metric.color : '#d1d5db',
                            }}
                          />
                          {metric.label}
                          <span
                            className={cn(
                              'ml-1 text-[11px]',
                              selected ? 'text-gray-400' : 'text-gray-300'
                            )}
                          >
                            ({metric.unit})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700">时间范围</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(['all', '3m', '6m'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    timeRange === range
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {TIME_RANGE_LABELS[range]}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400">
              共 {memberMeasurements.length} 条记录
            </span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            导出{timeRange !== 'all' ? TIME_RANGE_LABELS[timeRange] : ''}数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="当前体重"
          value={current ? `${current.weight}kg` : '--'}
          icon={<Scale className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="当前体脂率"
          value={current ? `${current.bodyFatRate}%` : '--'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
        />
        <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">体重变化</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">对比首次</span>
              {allDiffsFirst.weight !== null ? (
                <DiffBadge value={allDiffsFirst.weight} unit="kg" inverse />
              ) : (
                <span className="text-sm text-gray-400">--</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">对比上次</span>
              {allDiffsPrev.weight !== null ? (
                <DiffBadge value={allDiffsPrev.weight} unit="kg" inverse />
              ) : (
                <span className="text-sm text-gray-400">--</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">体脂率变化</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">对比首次</span>
              {allDiffsFirst.bodyFatRate !== null ? (
                <DiffBadge value={allDiffsFirst.bodyFatRate} unit="%" inverse />
              ) : (
                <span className="text-sm text-gray-400">--</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">对比上次</span>
              {allDiffsPrev.bodyFatRate !== null ? (
                <DiffBadge value={allDiffsPrev.bodyFatRate} unit="%" inverse />
              ) : (
                <span className="text-sm text-gray-400">--</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">趋势图</h2>
          <div className="flex flex-wrap gap-3">
            {selectedMetricConfigs.map((m) => (
              <div key={m.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span>
                  {m.label} ({m.unit})
                </span>
              </div>
            ))}
          </div>
        </div>
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center h-80 text-gray-400">
            至少需要2次体测数据才能显示趋势图
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                {showLeftAxis && (
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{
                      value: selectedMetricConfigs
                        .filter((m) => m.yAxis === 'left')
                        .map((m) => `${m.label}(${m.unit})`)
                        .join(' / '),
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11, fill: '#6b7280' },
                    }}
                  />
                )}
                {showRightAxis && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{
                      value: selectedMetricConfigs
                        .filter((m) => m.yAxis === 'right')
                        .map((m) => `${m.label}(${m.unit})`)
                        .join(' / '),
                      angle: 90,
                      position: 'insideRight',
                      style: { fontSize: 11, fill: '#6b7280' },
                    }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => {
                    const cfg = ALL_METRICS.find((m) => m.key === name);
                    return cfg
                      ? [`${value}${cfg.unit}`, `${cfg.label}`]
                      : [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => {
                    const cfg = ALL_METRICS.find((m) => m.key === value);
                    return cfg ? `${cfg.label}(${cfg.unit})` : value;
                  }}
                />
                {selectedMetricConfigs.map((m) => (
                  <Line
                    key={m.key}
                    yAxisId={m.yAxis}
                    type="monotone"
                    dataKey={m.key}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={{ fill: m.color, r: 4 }}
                    activeDot={{ r: 6 }}
                    name={m.key}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          体测历史记录
          <span className="ml-2 text-xs font-normal text-gray-400">
            （与图表同一批数据，已选中指标显示环比变化）
          </span>
        </h2>
        {recentRecords.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            暂无体测记录
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    日期
                  </th>
                  {ALL_METRICS.map((m) => (
                    <th
                      key={m.key}
                      className={cn(
                        'text-left py-3 px-4 text-sm font-medium',
                        selectedMetrics.includes(m.key)
                          ? 'text-gray-700 bg-gray-50/50'
                          : 'text-gray-400'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            selectedMetrics.includes(m.key)
                              ? ''
                              : 'bg-gray-300'
                          )}
                          style={{
                            backgroundColor: selectedMetrics.includes(m.key)
                              ? m.color
                              : undefined,
                          }}
                        />
                        {m.label}({m.unit})
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record, index) => {
                  const diffs = getHistoryDiff(index);
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {record.date}
                      </td>
                      {ALL_METRICS.map((m) => (
                        <td
                          key={m.key}
                          className={cn(
                            'py-3 px-4',
                            selectedMetrics.includes(m.key) && 'bg-gray-50/30'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-sm',
                                selectedMetrics.includes(m.key)
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-400'
                              )}
                            >
                              {(record[m.key] as number | undefined) ?? '--'}
                            </span>
                            {selectedMetrics.includes(m.key) &&
                              diffs[m.key] !== null &&
                              diffs[m.key] !== undefined && (
                                <DiffBadge value={diffs[m.key] as number} unit={m.unit} inverse />
                              )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
