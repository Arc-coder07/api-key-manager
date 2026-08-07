/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app':          '#0e0e10',
        'sidebar':      '#111113',
        'card':         '#1a1a1f',
        'card-hover':   '#222226',
        'overlay':      'rgba(0, 0, 0, 0.6)',
        'border-subtle':'#2a2a30',
        'border-active':'#3a3a42',
        'text-primary': '#f5f5f5',
        'text-secondary':'#a1a1aa',
        'text-muted':   '#71717a',
        'accent': {
          DEFAULT:      '#10b981',
          hover:        '#059669',
          muted:        'rgba(16, 185, 129, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
};
