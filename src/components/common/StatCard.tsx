import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'green' | 'orange' | 'blue' | 'red';
}

const colorClasses = {
  green: 'bg-green-50 text-green-600 border-green-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  red: 'bg-red-50 text-red-600 border-red-100',
};

const iconBgClasses = {
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'green',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend > 0
                    ? 'text-green-600'
                    : trend < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                )}
              >
                {trend > 0 ? '+' : ''}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBgClasses[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
