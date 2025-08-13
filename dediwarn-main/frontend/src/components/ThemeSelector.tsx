import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-surface border border-border hover:bg-opacity-80 transition-all duration-200 hover:scale-105"
      >
        <Palette className="h-5 w-5 text-primary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-surface border border-border rounded-xl shadow-2xl p-4 min-w-[200px] z-50 animate-scale-in">
          <h3 className="text-sm font-semibold text-text mb-3">Choose Theme</h3>
          <div className="space-y-2">
            {Object.entries(themes).map(([key, themeConfig]) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key as keyof typeof themes);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-4 h-4 rounded-full border-2 border-border theme-gradient-${key}`}
                  />
                  <span className="text-text text-sm">{themeConfig.name}</span>
                </div>
                {theme === key && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};