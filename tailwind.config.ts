import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1b1c3e',
        'bg-secondary': '#222d50',
        'bg-tertiary': '#1e2848',
        'glass-surface': 'rgba(255,255,255,0.08)',
        'glass-border': 'rgba(255,255,255,0.14)',
        'glass-hover': 'rgba(255,255,255,0.12)',
        'accent-cyan': '#00dfff',
        'accent-teal': '#00ffd0',
        'accent-purple': '#8b5cf6',
        'accent-purple-light': '#c4b5fd',
        'alert-warning': '#fbbf24',
        'alert-danger': '#f87171',
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
