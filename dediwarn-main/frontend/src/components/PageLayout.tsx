import React, { ReactNode } from 'react';
import theme from '../styles/theme';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  titleIcon?: string;
  className?: string;
  headerActions?: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  titleIcon,
  className = '',
  headerActions
}) => {
  return (
    <div className={`min-h-screen ${theme.backgrounds.page} ${className}`}>
      <div className={`${theme.spacing.containerMax} ${theme.spacing.sectionPadding}`}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        {/* Page Header */}
        <div className="relative z-10 mb-8 animate-fade-in-up">
          <div className={`${theme.backgrounds.glassCard} rounded-2xl ${theme.spacing.cardPaddingLg} ${theme.shadows.glow}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className={`${theme.typography.h3} ${theme.text.gradient.primary} mb-2 flex items-center gap-3`}>
                  {titleIcon && <span className="text-4xl">{titleIcon}</span>}
                  {title}
                </h1>
                {subtitle && (
                  <p className={`${theme.text.secondary} ${theme.typography.lead} max-w-4xl`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex-shrink-0 ml-6">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: keyof typeof theme.gradients;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  gradient,
  onClick
}) => {
  const baseClasses = `${theme.backgrounds.glassCard} rounded-xl ${theme.spacing.cardPadding} ${theme.borders.default}`;
  const hoverClasses = hover ? `${theme.hover.scale} ${theme.hover.glow} cursor-pointer` : '';
  const gradientClasses = gradient ? `bg-gradient-to-br ${theme.gradients[gradient]}/10` : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className} transition-all duration-300`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm space-x-2',
    md: 'px-6 py-3 text-base space-x-2',
    lg: 'px-8 py-4 text-lg space-x-3'
  };

  const variantClasses = {
    primary: `bg-gradient-to-r ${theme.gradients.primary} ${theme.hover.scale} ${theme.shadows.glow}`,
    secondary: `bg-gradient-to-r ${theme.gradients.dark} ${theme.hover.scale} ${theme.borders.default}`,
    success: `bg-gradient-to-r ${theme.gradients.success} ${theme.hover.scale} ${theme.shadows.glowGreen}`,
    warning: `bg-gradient-to-r ${theme.gradients.warning} ${theme.hover.scale}`,
    danger: `bg-gradient-to-r ${theme.gradients.danger} ${theme.hover.scale} ${theme.shadows.glowRed}`,
    ghost: `${theme.backgrounds.glass} ${theme.borders.default} ${theme.hover.scale} hover:bg-slate-700/50`
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const variantClasses = {
    primary: `bg-gradient-to-r ${theme.gradients.primary} text-white`,
    secondary: 'bg-slate-700 text-slate-300',
    success: `bg-gradient-to-r ${theme.gradients.success} text-white`,
    warning: `bg-gradient-to-r ${theme.gradients.warning} text-white`,
    danger: `bg-gradient-to-r ${theme.gradients.danger} text-white`,
    info: `bg-gradient-to-r ${theme.gradients.info} text-white`
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  gradient?: keyof typeof theme.gradients;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = '',
  gradient = 'primary'
}) => {
  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➡️'
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <Card className={className} gradient={gradient}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${theme.text.muted} text-sm font-medium`}>{title}</p>
          <p className={`${theme.text.primary} text-2xl font-bold mt-1`}>{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
              <span className="mr-1">{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`text-3xl opacity-80`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default PageLayout;
