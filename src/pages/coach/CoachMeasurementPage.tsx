import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, History, User } from 'lucide-react';
import { DiffBadge } from '../../components/common';
import { useStore } from '../../store';
import { formatDate } from '../../utils/date';
import type { Measurement } from '../../types';

interface FormData {
  date: string;
  weight: string;
  bodyFatRate: string;
  chest: string;
  waist: string;
  hip: string;
  heartRate: string;
}

interface FormErrors {
  date?: string;
  weight?: string;
  bodyFatRate?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  heartRate?: string;
}

const fields = [
  { key: 'weight', label: '体重', unit: 'kg', min: 20, max: 300, step: 0.1, inverse: true },
  { key: 'bodyFatRate', label: '体脂率', unit: '%', min: 3, max: 60, step: 0.1, inverse: true },
  { key: 'chest', label: '胸围', unit: 'cm', min: 30, max: 200, step: 0.1, inverse: false },
  { key: 'waist', label: '腰围', unit: 'cm', min: 30, max: 200, step: 0.1, inverse: true },
  { key: 'hip', label: '臀围', unit: 'cm', min: 30, max: 200, step: 0.1, inverse: false },
  { key: 'heartRate', label: '心率', unit: 'bpm', min: 30, max: 220, step: 1, inverse: true },
] as const;

export default function CoachMeasurementPage() {
  const { id } = useParams<{ id: string }>();
  const memberId = id;
  const navigate = useNavigate();
  const { members, measurements, addMeasurement } = useStore();

  const member = members.find((m) => m.id === memberId);

  const memberMeasurements = useMemo(() => {
    return measurements
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [measurements, memberId]);

  const lastMeasurement = memberMeasurements[0];

  const [formData, setFormData] = useState<FormData>({
    date: formatDate(new Date()),
    weight: '',
    bodyFatRate: '',
    chest: '',
    waist: '',
    hip: '',
    heartRate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = '请选择日期';
    }

    fields.forEach((field) => {
      const value = formData[field.key as keyof FormData];
      if (!value && value !== '0') {
        newErrors[field.key as keyof FormErrors] = '此字段必填';
      } else {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors[field.key as keyof FormErrors] = '请输入有效数字';
        } else if (num < field.min || num > field.max) {
          newErrors[field.key as keyof FormErrors] = `请输入 ${field.min} - ${field.max} 之间的值`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !memberId) return;

    const newMeasurement: Omit<Measurement, 'id'> = {
      memberId,
      date: formData.date,
      weight: parseFloat(formData.weight),
      bodyFatRate: parseFloat(formData.bodyFatRate),
      chest: parseFloat(formData.chest),
      waist: parseFloat(formData.waist),
      hip: parseFloat(formData.hip),
      heartRate: parseInt(formData.heartRate, 10),
    };

    addMeasurement(newMeasurement);

    setFormData({
      date: formatDate(new Date()),
      weight: '',
      bodyFatRate: '',
      chest: '',
      waist: '',
      hip: '',
      heartRate: '',
    });
    setErrors({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getDiff = (fieldKey: string): number | null => {
    if (!lastMeasurement) return null;
    const currentValue = parseFloat(formData[fieldKey as keyof FormData]);
    if (isNaN(currentValue)) return null;
    const lastValue = lastMeasurement[fieldKey as keyof Measurement] as number;
    return Number((currentValue - lastValue).toFixed(1));
  };

  const getHistoryDiff = (measurement: Measurement, index: number): Partial<Record<string, number>> => {
    if (index >= memberMeasurements.length - 1) return {};
    const prev = memberMeasurements[index + 1];
    return {
      weight: Number((measurement.weight - prev.weight).toFixed(1)),
      bodyFatRate: Number((measurement.bodyFatRate - prev.bodyFatRate).toFixed(1)),
      chest: Number((measurement.chest - prev.chest).toFixed(1)),
      waist: Number((measurement.waist - prev.waist).toFixed(1)),
      hip: Number((measurement.hip - prev.hip).toFixed(1)),
      heartRate: measurement.heartRate - prev.heartRate,
    };
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">会员不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回列表</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
                <p className="text-sm text-gray-500">
                  {member.age}岁 · {member.gender === 'male' ? '男' : '女'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
            体测数据保存成功！
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-600" />
              新体测数据录入
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}({field.unit})
                  </label>
                  <input
                    type="number"
                    step={field.step}
                    value={formData[field.key as keyof FormData]}
                    onChange={(e) => handleChange(field.key as keyof FormData, e.target.value)}
                    placeholder={`${field.min} - ${field.max}`}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[field.key as keyof FormErrors] ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors[field.key as keyof FormErrors] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.key as keyof FormErrors]}</p>
                  )}
                </div>
              ))}

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存体测数据
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">数据对比</h2>
            {!lastMeasurement ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                暂无历史数据
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  上次体测：{lastMeasurement.date}
                </p>
                {fields.map((field) => {
                  const currentStr = formData[field.key as keyof FormData];
                  const currentValue = currentStr !== '' ? parseFloat(currentStr) : null;
                  const diff = getDiff(field.key);
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-700 font-medium">{field.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-semibold">
                          {currentValue !== null ? `${currentValue}${field.unit}` : '--'}
                        </span>
                        {diff !== null && (
                          <DiffBadge value={diff} unit={field.unit} inverse={field.inverse} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            历史体测记录
          </h2>
          {memberMeasurements.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              暂无体测记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                    {fields.map((field) => (
                      <th key={field.key} className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        {field.label}({field.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memberMeasurements.map((measurement, index) => {
                    const historyDiffs = getHistoryDiff(measurement, index);
                    return (
                      <tr key={measurement.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{measurement.date}</td>
                        {fields.map((field) => {
                          const value = measurement[field.key as keyof Measurement] as number;
                          const diff = historyDiffs[field.key as keyof typeof historyDiffs];
                          return (
                            <td key={field.key} className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-900">{value}</span>
                                {diff !== undefined && (
                                  <DiffBadge value={diff} unit={field.unit} inverse={field.inverse} />
                                )}
                              </div>
                            </td>
                          );
                        })}
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
