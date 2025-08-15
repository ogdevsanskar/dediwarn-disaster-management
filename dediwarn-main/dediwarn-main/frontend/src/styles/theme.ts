// Global design system for ClimaAid
export const theme = {
  // Color Gradients
  gradients: {
    primary: 'from-blue-500 via-purple-500 to-pink-500',
    secondary: 'from-green-400 to-blue-500', 
    tertiary: 'from-purple-400 to-pink-500',
    accent: 'from-yellow-400 to-orange-500',
    success: 'from-green-500 to-teal-600',
    warning: 'from-yellow-500 to-orange-600',
    danger: 'from-red-500 to-pink-600',
    info: 'from-blue-400 to-cyan-500',
    dark: 'from-slate-800 to-slate-900',
    light: 'from-slate-700 to-slate-800',
    environmental: 'from-green-400 via-teal-500 to-blue-600',
    ocean: 'from-blue-600 via-cyan-500 to-teal-400',
    forest: 'from-green-600 via-emerald-500 to-lime-400',
    fire: 'from-red-600 via-orange-500 to-yellow-400',
    ice: 'from-blue-300 via-cyan-200 to-slate-100'
  },

  // Background Patterns
  backgrounds: {
    main: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    page: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
    card: 'bg-gradient-to-br from-slate-800/50 to-slate-700/30',
    cardHover: 'bg-gradient-to-br from-slate-700/70 to-slate-600/50',
    overlay: 'bg-black/50',
    glass: 'bg-white/5 backdrop-blur-sm',
    glassCard: 'bg-slate-800/30 backdrop-blur-sm border border-slate-600',
  },

  // Text Colors
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    accent: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    gradient: {
      primary: 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
      environmental: 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent',
      ocean: 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent',
      fire: 'bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent'
    }
  },

  // Shadows and Effects
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glow: 'shadow-2xl shadow-blue-500/20',
    glowGreen: 'shadow-2xl shadow-green-500/20',
    glowPurple: 'shadow-2xl shadow-purple-500/20',
    glowRed: 'shadow-2xl shadow-red-500/20',
  },

  // Border Styles
  borders: {
    default: 'border border-slate-600',
    accent: 'border border-blue-400',
    success: 'border border-green-400',
    warning: 'border border-yellow-400',
    danger: 'border border-red-400',
    transparent: 'border border-transparent',
    gradient: 'border border-transparent bg-gradient-to-r from-blue-400 to-purple-400',
  },

  // Button Styles
  buttons: {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-600',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700',
    success: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-teal-600 hover:to-cyan-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-orange-600 hover:to-red-600',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-purple-600',
    ghost: 'bg-transparent border border-slate-600 hover:bg-slate-800 hover:border-blue-400',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20',
  },

  // Animation Classes
  animations: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up', 
    fadeInDown: 'animate-fade-in-down',
    fadeInLeft: 'animate-fade-in-left',
    fadeInRight: 'animate-fade-in-right',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    ping: 'animate-ping',
    float: 'animate-float',
    slideIn: 'animate-slide-in',
    scaleIn: 'animate-scale-in',
    delay100: 'animation-delay-100',
    delay200: 'animation-delay-200',
    delay300: 'animation-delay-300',
    delay500: 'animation-delay-500',
    delay1000: 'animation-delay-1000',
  },

  // Spacing and Sizing
  spacing: {
    sectionPadding: 'py-20 px-4',
    containerMax: 'max-w-7xl mx-auto',
    cardPadding: 'p-6',
    cardPaddingLg: 'p-8',
    buttonPadding: 'px-6 py-3',
    buttonPaddingLg: 'px-8 py-4',
  },

  // Grid Layouts
  grids: {
    responsive1: 'grid grid-cols-1',
    responsive2: 'grid grid-cols-1 md:grid-cols-2',
    responsive3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    responsive4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    responsive6: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    gap: 'gap-6',
    gapSm: 'gap-4',
    gapLg: 'gap-8',
  },

  // Typography
  typography: {
    h1: 'text-6xl md:text-8xl font-bold',
    h2: 'text-5xl font-bold',
    h3: 'text-4xl font-bold',
    h4: 'text-3xl font-bold',
    h5: 'text-2xl font-bold',
    h6: 'text-xl font-bold',
    lead: 'text-xl md:text-2xl',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  },

  // Rounded Corners
  rounded: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  },

  // Hover Effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-300',
    scaleDown: 'hover:scale-95 transition-transform duration-300',
    lift: 'hover:-translate-y-2 transition-transform duration-300',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300',
    rotate: 'hover:rotate-3 transition-transform duration-300',
    brightness: 'hover:brightness-110 transition-all duration-300',
  },

  // Environmental Theme Colors
  environmental: {
    forest: {
      light: '#10B981', // emerald-500
      dark: '#059669',  // emerald-600
      gradient: 'from-green-600 via-emerald-500 to-lime-400'
    },
    ocean: {
      light: '#06B6D4', // cyan-500
      dark: '#0891B2',  // cyan-600
      gradient: 'from-blue-600 via-cyan-500 to-teal-400'
    },
    sky: {
      light: '#3B82F6', // blue-500
      dark: '#2563EB',  // blue-600
      gradient: 'from-blue-400 via-sky-500 to-cyan-400'
    },
    earth: {
      light: '#A3A3A3', // neutral-400
      dark: '#737373',  // neutral-500
      gradient: 'from-stone-600 via-neutral-500 to-slate-400'
    },
    fire: {
      light: '#F97316', // orange-500
      dark: '#EA580C',  // orange-600
      gradient: 'from-red-600 via-orange-500 to-yellow-400'
    }
  }
};

// Utility functions for theme usage
export const getGradient = (name: keyof typeof theme.gradients) => {
  return `bg-gradient-to-r ${theme.gradients[name]}`;
};

export const getTextGradient = (name: keyof typeof theme.text.gradient) => {
  return theme.text.gradient[name];
};

export const getEnvironmentalGradient = (type: keyof typeof theme.environmental) => {
  return `bg-gradient-to-r ${theme.environmental[type].gradient}`;
};

// CSS Custom Properties for dynamic theming
export const cssVariables = `
  :root {
    --gradient-primary: linear-gradient(to right, rgb(59 130 246), rgb(147 51 234), rgb(236 72 153));
    --gradient-environmental: linear-gradient(to right, rgb(34 197 94), rgb(20 184 166), rgb(59 130 246));
    --gradient-ocean: linear-gradient(to right, rgb(37 99 235), rgb(6 182 212), rgb(20 184 166));
    --gradient-forest: linear-gradient(to right, rgb(22 163 74), rgb(16 185 129), rgb(132 204 22));
    --gradient-fire: linear-gradient(to right, rgb(220 38 38), rgb(249 115 22), rgb(250 204 21));
    
    --shadow-glow: 0 25px 50px -12px rgba(59, 130, 246, 0.2);
    --shadow-glow-green: 0 25px 50px -12px rgba(34, 197, 94, 0.2);
    --shadow-glow-red: 0 25px 50px -12px rgba(220, 38, 38, 0.2);
    
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
`;

export default theme;
