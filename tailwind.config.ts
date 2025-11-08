import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: ['./views/**/*.ejs', './src/presentation/**/*.{ts,js}', './public/js/**/*.js'],

  theme: {
    extend: {
      colors: {
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          'white-subtle': 'rgba(255, 255, 255, 0.05)',
          'white-strong': 'rgba(255, 255, 255, 0.25)',
          black: 'rgba(0, 0, 0, 0.1)',
          'black-subtle': 'rgba(0, 0, 0, 0.05)',
          'black-strong': 'rgba(0, 0, 0, 0.25)',
        },
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        taskflowLight: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          neutral: '#1f2937',
          'base-100': '#f9fafb',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'base-content': '#1f2937',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        taskflowDark: {
          primary: '#818cf8',
          secondary: '#a78bfa',
          accent: '#f472b6',
          neutral: '#f3f4f6',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#f1f5f9',
          info: '#60a5fa',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
    darkTheme: 'taskflowDark',
  },
};

export default config;
