import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a2e',
        'bg-secondary': '#1a1040',
        'bg-tertiary': '#0d1137',
        'glass-surface': 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.1)',
        'glass-hover': 'rgba(255,255,255,0.08)',
        'accent-cyan': '#00d4ff',
        'accent-teal': '#00ffc8',
        'accent-purple': '#7c3aed',
        'accent-purple-light': '#a78bfa',
        'alert-warning': '#f59e0b',
        'alert-danger': '#f43f5e',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.4)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
