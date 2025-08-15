import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      default: return 'text-textSecondary';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 group ${
      gradient ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'bg-surface'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${gradient ? 'text-white opacity-90' : 'text-textSecondary'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold mt-1 ${gradient ? 'text-white' : 'text-text'}`}>
              {value}
            </p>
            {change && (
              <p className={`text-sm mt-1 ${gradient ? 'text-white opacity-80' : getChangeColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${gradient ? 'bg-white bg-opacity-20' : 'bg-primary bg-opacity-10'}`}>
            <Icon className={`h-6 w-6 ${gradient ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
    </div>
  );
};