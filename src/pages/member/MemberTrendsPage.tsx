import { useMemo } from 'react';
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
import { Scale, TrendingUp, History, User } from 'lucide-react';
import { StatCard, DiffBadge } from '../../components/common';
import { useStore } from '../../store';

export default function MemberTrendsPage() {
  const { members, measurements, currentMemberId } = useStore();

  const member = members.find((m) => m.id === currentMemberId);

  const memberMeasurements = useMemo(() => {
    return measurements
      .filter((m) => m.memberId === currentMemberId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, currentMemberId]);

  const chartData = memberMeasurements.map((m) => ({
    date: m.date,
    weight: m.weight,
    bodyFatRate: m.bodyFatRate,
  }));

  const current = memberMeasurements[memberMeasurements.length - 1];
  const first = memberMeasurements[0];
  const previous = memberMeasurements.length > 1
    ? memberMeasurements[memberMeasurements.length - 2]
    : null;

  const weightDiffVsFirst = current && first
    ? Number((current.weight - first.weight).toFixed(1))
    : null;
  const weightDiffVsPrev = current && previous
    ? Number((current.weight - previous.weight).toFixed(1))
    : null;
  const bodyFatDiffVsFirst = current && first
    ? Number((current.bodyFatRate - first.bodyFatRate).toFixed(1))
    : null;
  const bodyFatDiffVsPrev = current && previous
    ? Number((current.bodyFatRate - previous.bodyFatRate).toFixed(1))
    : null;

  const recentRecords = [...memberMeasurements].reverse().slice(0, 10);

  const getHistoryDiff = (index: number) => {
    if (index >= recentRecords.length - 1) return { weight: null, bodyFatRate: null };
    const currentRecord = recentRecords[index];
    const prevRecord = recentRecords[index + 1];
    return {
      weight: Number((currentRecord.weight - prevRecord.weight).toFixed(1)),
      bodyFatRate: Number((currentRecord.bodyFatRate - prevRecord.bodyFatRate).toFixed(1)),
    };
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">请先选择会员</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                {weightDiffVsFirst !== null ? (
                  <DiffBadge value={weightDiffVsFirst} unit="kg" inverse />
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">对比上次</span>
                {weightDiffVsPrev !== null ? (
                  <DiffBadge value={weightDiffVsPrev} unit="kg" inverse />
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
                {bodyFatDiffVsFirst !== null ? (
                  <DiffBadge value={bodyFatDiffVsFirst} unit="%" inverse />
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">对比上次</span>
                {bodyFatDiffVsPrev !== null ? (
                  <DiffBadge value={bodyFatDiffVsPrev} unit="%" inverse />
                ) : (
                  <span className="text-sm text-gray-400">--</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">趋势图</h2>
          {chartData.length < 2 ? (
            <div className="flex items-center justify-center h-80 text-gray-400">
              至少需要2次体测数据才能显示趋势图
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ value: '体重(kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#10b981' } }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ value: '体脂率(%)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#f97316' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="体重(kg)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyFatRate"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="体脂率(%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            体测历史记录
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">体重(kg)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">体脂率(%)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">胸围(cm)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">腰围(cm)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">臀围(cm)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">心率(bpm)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record, index) => {
                    const diffs = getHistoryDiff(index);
                    return (
                      <tr key={record.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{record.weight}</span>
                            {diffs.weight !== null && (
                              <DiffBadge value={diffs.weight} unit="kg" inverse />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{record.bodyFatRate}</span>
                            {diffs.bodyFatRate !== null && (
                              <DiffBadge value={diffs.bodyFatRate} unit="%" inverse />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.chest}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.waist}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.hip}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.heartRate}</td>
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
