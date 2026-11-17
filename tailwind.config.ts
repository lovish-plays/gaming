import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#030306',
        'brand-surface': '#090912',
        'brand-card': '#0d0d18',
        'brand-card-glass': 'rgba(13, 13, 24, 0.8)',
        'brand-border': '#1e1e2f',
        'brand-border-glow': 'rgba(255, 255, 255, 0.1)',
        'neon-green': '#10b981',
        'neon-green-bright': '#00ff87',
        'neon-green-dim': '#059669',
        'crimson': '#f43f5e',
        'crimson-dim': '#e11d48',
        'gold': '#f59e0b',
        'gold-dim': '#d97706',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,255,135,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,255,135,0.7), 0 0 40px rgba(0,255,135,0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
