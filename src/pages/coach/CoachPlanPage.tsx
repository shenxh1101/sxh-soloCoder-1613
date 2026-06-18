import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowLeft,
  Dumbbell,
  RotateCcw,
  X,
  Pencil,
} from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../lib/utils';
import { getDayName, getExerciseDayLabel } from '../../utils/date';
import type { PlanExercise } from '../../types';

const EXERCISE_OPTIONS = [
  '深蹲',
  '卧推',
  '硬拉',
  '引体向上',
  '哑铃弯举',
  '平板支撑',
  '跑步',
  '划船机',
  '臀桥',
  '推举',
];

const DAY_OPTIONS = [
  { value: 0, label: '周一' },
  { value: 1, label: '周二' },
  { value: 2, label: '周三' },
  { value: 3, label: '周四' },
  { value: 4, label: '周五' },
  { value: 5, label: '周六' },
  { value: 6, label: '周日' },
];

interface ExerciseFormData {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  daysOfWeek: number[];
  daysOfMonth: number[];
}

const emptyExercise = (): ExerciseFormData => ({
  id: Math.random().toString(36).substring(2, 15),
  name: '',
  sets: 3,
  reps: 12,
  weight: 0,
  daysOfWeek: [],
  daysOfMonth: [],
});

export default function CoachPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const members = useStore((s) => s.members);
  const trainingPlans = useStore((s) => s.trainingPlans);
  const addTrainingPlan = useStore((s) => s.addTrainingPlan);
  const updateTrainingPlan = useStore((s) => s.updateTrainingPlan);
  const deleteTrainingPlan = useStore((s) => s.deleteTrainingPlan);

  const member = useMemo(() => members.find((m) => m.id === id), [members, id]);
  const plans = useMemo(
    () => trainingPlans.filter((p) => p.memberId === id),
    [trainingPlans, id]
  );

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [planName, setPlanName] = useState('');
  const [cycleType, setCycleType] = useState<'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exercises, setExercises] = useState<ExerciseFormData[]>([
    emptyExercise(),
  ]);

  const resetForm = () => {
    setPlanName('');
    setCycleType('weekly');
    setStartDate('');
    setEndDate('');
    setExercises([emptyExercise()]);
    setFormErrors({});
    setShowForm(false);
    setEditingPlanId(null);
  };

  const handleEdit = (planId: string) => {
    const plan = trainingPlans.find((p) => p.id === planId);
    if (!plan) return;

    setEditingPlanId(planId);
    setPlanName(plan.name);
    setCycleType(plan.cycleType);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);

    const grouped: Record<string, ExerciseFormData> = {};
    plan.exercises.forEach((ex) => {
      const key = `${ex.name}-${ex.sets}-${ex.reps}-${ex.weight}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: Math.random().toString(36).substring(2, 15),
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          daysOfWeek: [],
          daysOfMonth: [],
        };
      }
      if (ex.dayOfWeek !== undefined) {
        grouped[key].daysOfWeek.push(ex.dayOfWeek);
      }
      if (ex.dayOfMonth !== undefined) {
        grouped[key].daysOfMonth.push(ex.dayOfMonth);
      }
    });
    setExercises(Object.values(grouped));
    setShowForm(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!planName.trim()) errors.planName = '请输入计划名称';
    if (!startDate) errors.startDate = '请选择开始日期';
    if (!endDate) errors.endDate = '请选择结束日期';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.endDate = '结束日期必须晚于开始日期';
    }
    if (exercises.length === 0) {
      errors.exercises = '至少添加一个训练动作';
    }
    exercises.forEach((ex, idx) => {
      if (!ex.name.trim()) errors[`ex-name-${idx}`] = '请选择动作名称';
      if (ex.sets <= 0) errors[`ex-sets-${idx}`] = '组数必须大于0';
      if (ex.reps <= 0) errors[`ex-reps-${idx}`] = '次数必须大于0';
      if (cycleType === 'weekly' && ex.daysOfWeek.length === 0)
        errors[`ex-days-${idx}`] = '至少选择一个训练日';
      if (cycleType === 'monthly' && ex.daysOfMonth.length === 0)
        errors[`ex-days-${idx}`] = '至少选择一个训练日';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !id) return;

    const flatExercises: Omit<PlanExercise, 'id' | 'planId'>[] = exercises.flatMap((ex) => {
      if (cycleType === 'weekly') {
        return ex.daysOfWeek.map((day) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          dayOfWeek: day,
          dayOfMonth: undefined,
        }));
      } else {
        return ex.daysOfMonth.map((day) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          dayOfWeek: undefined,
          dayOfMonth: day,
        }));
      }
    });

    if (editingPlanId) {
      updateTrainingPlan(editingPlanId, {
        name: planName.trim(),
        cycleType,
        startDate,
        endDate,
        exercises: flatExercises,
      });
    } else {
      addTrainingPlan({
        memberId: id,
        name: planName.trim(),
        cycleType,
        startDate,
        endDate,
        exercises: flatExercises,
      });
    }

    resetForm();
  };

  const addExercise = () => {
    setExercises([...exercises, emptyExercise()]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((e) => e.id !== exerciseId));
  };

  const updateExercise = (
    exerciseId: string,
    field: keyof ExerciseFormData,
    value: unknown
  ) => {
    setExercises(
      exercises.map((e) => (e.id === exerciseId ? { ...e, [field]: value } : e))
    );
  };

  const toggleDay = (exerciseId: string, day: number) => {
    setExercises(
      exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const hasDay = e.daysOfWeek.includes(day);
        return {
          ...e,
          daysOfWeek: hasDay
            ? e.daysOfWeek.filter((d) => d !== day)
            : [...e.daysOfWeek, day].sort(),
        };
      })
    );
  };

  const toggleDayOfMonth = (exerciseId: string, day: number) => {
    setExercises(
      exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const hasDay = e.daysOfMonth.includes(day);
        return {
          ...e,
          daysOfMonth: hasDay
            ? e.daysOfMonth.filter((d) => d !== day)
            : [...e.daysOfMonth, day].sort((a, b) => a - b),
        };
      })
    );
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/coach/members')}
            className="w-10 h-10 rounded-xl bg-white border shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">训练计划管理</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gray-600 font-medium">{member.name}</span>
              <span className="text-sm text-gray-400">
                {member.gender === 'male' ? '男' : '女'} · {member.age}岁 ·{' '}
                {member.phone}
              </span>
            </div>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingPlanId(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>创建计划</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingPlanId ? '编辑训练计划' : '创建训练计划'}
            </h2>
            <button
              onClick={resetForm}
              className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  计划名称
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="例如：减脂增肌计划"
                  className={cn(
                    'input-field',
                    formErrors.planName && 'border-red-400 focus:border-red-500'
                  )}
                />
                {formErrors.planName && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.planName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  周期类型
                </label>
                <div className="flex gap-2">
                  {(['weekly', 'monthly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCycleType(type)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 border-2',
                        cycleType === type
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>{type === 'weekly' ? '周计划' : '月计划'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  开始日期
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cn(
                      'input-field pl-10',
                      formErrors.startDate &&
                        'border-red-400 focus:border-red-500'
                    )}
                  />
                </div>
                {formErrors.startDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  结束日期
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={cn(
                      'input-field pl-10',
                      formErrors.endDate &&
                        'border-red-400 focus:border-red-500'
                    )}
                  />
                </div>
                {formErrors.endDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  训练动作
                </label>
                <button
                  onClick={addExercise}
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加动作</span>
                </button>
              </div>
              {formErrors.exercises && (
                <p className="mb-3 text-sm text-red-500">
                  {formErrors.exercises}
                </p>
              )}

              <div className="space-y-4">
                {exercises.map((exercise, idx) => (
                  <div
                    key={exercise.id}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 animate-scale-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">
                          动作 {idx + 1}
                        </span>
                      </div>
                      {exercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(exercise.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div className="md:col-span-1">
                        <select
                          value={exercise.name}
                          onChange={(e) =>
                            updateExercise(exercise.id, 'name', e.target.value)
                          }
                          className={cn(
                            'input-field text-sm',
                            formErrors[`ex-name-${idx}`] &&
                              'border-red-400 focus:border-red-500'
                          )}
                        >
                          <option value="">选择动作</option>
                          {EXERCISE_OPTIONS.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        {formErrors[`ex-name-${idx}`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors[`ex-name-${idx}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              'sets',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="组数"
                          className={cn(
                            'input-field text-sm',
                            formErrors[`ex-sets-${idx}`] &&
                              'border-red-400 focus:border-red-500'
                          )}
                        />
                        {formErrors[`ex-sets-${idx}`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors[`ex-sets-${idx}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              'reps',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="次数"
                          className={cn(
                            'input-field text-sm',
                            formErrors[`ex-reps-${idx}`] &&
                              'border-red-400 focus:border-red-500'
                          )}
                        />
                        {formErrors[`ex-reps-${idx}`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors[`ex-reps-${idx}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              'weight',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="重量(kg)"
                          className="input-field text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        {cycleType === 'weekly' ? '训练日（周几）' : '训练日（每月几号）'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cycleType === 'weekly'
                          ? DAY_OPTIONS.map((day) => (
                              <button
                                key={day.value}
                                onClick={() => toggleDay(exercise.id, day.value)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                                  exercise.daysOfWeek.includes(day.value)
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                                )}
                              >
                                {day.label}
                              </button>
                            ))
                          : Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <button
                                key={day}
                                onClick={() => toggleDayOfMonth(exercise.id, day)}
                                className={cn(
                                  'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 border',
                                  exercise.daysOfMonth.includes(day)
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                                )}
                              >
                                {day}
                              </button>
                            ))}
                      </div>
                      {formErrors[`ex-days-${idx}`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors[`ex-days-${idx}`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex-1">
                保存计划
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          当前训练计划 ({plans.length})
        </h2>
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无训练计划，点击上方按钮创建</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up"
              >
                <div
                  className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedPlanId(
                      expandedPlanId === plan.id ? null : plan.id
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{plan.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          {plan.cycleType === 'weekly' ? '周计划' : '月计划'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {plan.startDate} ~ {plan.endDate}
                        </span>
                        <span>{plan.exercises.length} 个动作</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(plan.id);
                      }}
                      className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                      title="编辑计划"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('确定删除该训练计划？')) {
                          deleteTrainingPlan(plan.id);
                        }
                      }}
                      className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      {expandedPlanId === plan.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedPlanId === plan.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 animate-slide-up">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {plan.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="font-medium text-gray-800 mb-2">
                            {exercise.name}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200">
                              {exercise.sets}组
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200">
                              {exercise.reps}次
                            </span>
                            {exercise.weight > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200">
                                {exercise.weight}kg
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                              {getExerciseDayLabel(exercise, plan.cycleType)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
