import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon | React.ReactNode;
  badge?: string | {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  iconBgColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  iconBgColor = 'bg-indigo-50 text-indigo-600 border-indigo-100',
  onClick
}) => {
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'neutral' as const } : badge;

  const getBadgeStyle = () => {
    switch (badgeObj?.variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'info':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-lg border ${iconBgColor} flex items-center justify-center`}>
          {renderIcon()}
        </div>
      </div>

      {(subtitle || badgeObj || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {subtitle ? (
            <span className="text-slate-500 font-medium truncate" title={subtitle}>
              {subtitle}
            </span>
          ) : <span />}
          <div className="flex items-center gap-2 shrink-0">
            {trend && (
              <span className={`font-semibold flex items-center gap-0.5 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
                {trend.label && <span className="text-slate-400 font-normal ml-1">{trend.label}</span>}
              </span>
            )}
            {badgeObj && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle()}`}>
                {badgeObj.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
