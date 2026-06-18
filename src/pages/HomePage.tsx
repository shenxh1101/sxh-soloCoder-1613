import { useNavigate } from 'react-router-dom';
import { useGymStore } from '../store';
import { Dumbbell, UserCheck, Users, Activity, Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import { isThisWeek, formatDate } from '../utils/date';

export default function HomePage() {
  const navigate = useNavigate();
  const setRole = useGymStore((state) => state.setRole);
  const members = useGymStore((state) => state.members);
  const measurements = useGymStore((state) => state.measurements);
  const checkins = useGymStore((state) => state.checkins);
  const trainingPlans = useGymStore((state) => state.trainingPlans);

  const today = formatDate(new Date());

  const thisWeekMeasurements = measurements.filter((m) => isThisWeek(m.date));
  const activePlansCount = trainingPlans.filter(
    (p) => new Date(p.startDate) <= new Date(today) && new Date(p.endDate) >= new Date(today)
  ).length;

  const thisWeekCheckins = checkins.filter((c) => isThisWeek(c.checkinDate) && c.completed);
  const uniqueCheckinDates = [...new Set(thisWeekCheckins.map((c) => c.checkinDate))].sort();

  let consecutiveDays = 0;
  const sortedCheckinDates = uniqueCheckinDates.reverse();
  const todayDate = new Date(today);
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(todayDate);
    checkDate.setDate(todayDate.getDate() - i);
    const checkDateStr = formatDate(checkDate);
    if (sortedCheckinDates.includes(checkDateStr)) {
      consecutiveDays++;
    } else if (i > 0) {
      break;
    }
  }

  const memberWeeklyTrainingCount = thisWeekCheckins.length;

  const handleCoachClick = () => {
    setRole('coach');
    navigate('/coach/members');
  };

  const handleMemberClick = () => {
    setRole('member');
    navigate('/member/trends');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 animate-fade-in">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="text-center mb-16 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">健身体测管理系统</h1>
          <p className="text-gray-500 text-lg">请选择您的身份以继续</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            onClick={handleCoachClick}
            className="group relative cursor-pointer rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-green-800"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-400 via-green-500 to-green-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative p-10 text-white">
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-10 h-10" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-2">我是教练</h2>
              <p className="text-green-100 mb-10 text-lg">管理会员、制定训练计划、记录体测数据</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-green-100 text-sm">会员总数</span>
                  </div>
                  <p className="text-3xl font-bold">{members.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-green-100 text-sm">本周新体测</span>
                  </div>
                  <p className="text-3xl font-bold">{thisWeekMeasurements.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-green-100 text-sm">活跃计划</span>
                  </div>
                  <p className="text-3xl font-bold">{activePlansCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-green-100 text-sm">本周打卡</span>
                  </div>
                  <p className="text-3xl font-bold">{thisWeekCheckins.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={handleMemberClick}
            className="group relative cursor-pointer rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative p-10 text-white">
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-10 h-10" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-2">我是会员</h2>
              <p className="text-orange-100 mb-10 text-lg">查看体测趋势、训练计划、完成每日打卡</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-orange-100 text-sm">连续打卡</span>
                  </div>
                  <p className="text-3xl font-bold">{consecutiveDays}<span className="text-lg font-normal ml-1">天</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-orange-100 text-sm">本周训练</span>
                  </div>
                  <p className="text-3xl font-bold">{memberWeeklyTrainingCount}<span className="text-lg font-normal ml-1">次</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-orange-100 text-sm">体测记录</span>
                  </div>
                  <p className="text-3xl font-bold">{measurements.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <span className="text-orange-100 text-sm">训练计划</span>
                  </div>
                  <p className="text-3xl font-bold">{trainingPlans.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400 text-sm">专业健身体测管理系统 · 科学训练 · 高效管理</p>
        </div>
      </div>
    </div>
  );
}
