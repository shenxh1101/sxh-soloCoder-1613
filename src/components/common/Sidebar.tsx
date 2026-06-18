import { useNavigate } from 'react-router-dom';
import { useGymStore } from '../../store';
import {
  Users,
  BarChart3,
  TrendingUp,
  CalendarDays,
  ArrowLeftRight,
  Dumbbell,
} from 'lucide-react';

interface SidebarProps {
  role: 'coach' | 'member';
  currentPath: string;
  onNavigate: (path: string) => void;
}

const coachNavItems = [
  { path: '/coach/members', label: '会员列表', icon: Users },
  { path: '/coach/checkin-stats', label: '打卡统计', icon: BarChart3 },
];

const memberNavItems = [
  { path: '/member/trends', label: '体测趋势', icon: TrendingUp },
  { path: '/member/weekly-plan', label: '当周计划', icon: CalendarDays },
];

export default function Sidebar({ role, currentPath, onNavigate }: SidebarProps) {
  const setRole = useGymStore((state) => state.setRole);
  const navigate = useNavigate();

  const navItems = role === 'coach' ? coachNavItems : memberNavItems;
  const roleLabel = role === 'coach' ? '教练端' : '会员端';

  const handleSwitchRole = () => {
    const newRole = role === 'coach' ? 'member' : 'coach';
    setRole(newRole);
    navigate(newRole === 'coach' ? '/coach/members' : '/member/trends');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-green-800 to-green-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-green-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold">健身体测</h1>
            <p className="text-xs text-green-300">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-green-800 shadow-lg font-semibold'
                  : 'text-green-100 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>切换角色</span>
        </button>
      </div>
    </aside>
  );
}
