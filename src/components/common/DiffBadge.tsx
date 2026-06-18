import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DiffBadgeProps {
  value: number;
  unit?: string;
  inverse?: boolean;
}

export default function DiffBadge({ value, unit = '', inverse = false }: DiffBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;

  const goodColor = inverse ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  const badColor = inverse ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

  let colorClass = 'text-gray-500 bg-gray-50';
  if (isPositive) {
    colorClass = inverse ? badColor : goodColor;
  } else if (isNegative) {
    colorClass = inverse ? goodColor : badColor;
  }

  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
        colorClass
      )}
    >
      <Icon className="w-3 h-3" />
      {isPositive ? '+' : ''}
      {value}
      {unit}
    </span>
  );
}
