import React from 'react';
import './AnimatedBackground.css';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20" />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          const animationDelay = `${Math.random() * 5}s`;
          const animationDuration = `${3 + Math.random() * 4}s`;
          return (
            <div
              key={i}
              className="particle"
              data-left={left}
              data-top={top}
              data-delay={animationDelay}
              data-duration={animationDuration}
            />
          );
        })}
      </div>

      {/* Large floating orbs */}
      {[...Array(5)].map((_, i) => {
        const width = 100 + Math.random() * 200;
        const height = 100 + Math.random() * 200;
        const left = `${Math.random() * 100}%`;
        const top = `${Math.random() * 100}%`;
        const color = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)];
        const animationDelay = `${Math.random() * 3}s`;
        return (
          <div
            key={i}
            className="large-orb"
            data-orb-width={`${width}px`}
            data-orb-height={`${height}px`}
            data-orb-left={left}
            data-orb-top={top}
            data-orb-bg={`linear-gradient(135deg, ${color}, transparent)`}
            data-orb-delay={animationDelay}
          />
        );
      })}
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            className={`animate-pulse line-delay-${i}`}
          />
        ))}
      </svg>
    </div>
  );
};