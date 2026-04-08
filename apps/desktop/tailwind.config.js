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
        // ─── Backgrounds ────────────────────────────
        'app':          '#0e0e10',
        'sidebar':      '#111113',
        'card':         '#1a1a1f',
        'card-hover':   '#222226',
        'overlay':      'rgba(0, 0, 0, 0.6)',

        // ─── Borders ───────────────────────────────
        'border-subtle':'#2a2a30',
        'border-active':'#3a3a42',

        // ─── Text ──────────────────────────────────
        'text-primary': '#f5f5f5',
        'text-secondary':'#a1a1aa',
        'text-muted':   '#71717a',

        // ─── Accent ────────────────────────────────
        'accent': {
          DEFAULT:      '#10b981',
          hover:        '#059669',
          muted:        'rgba(16, 185, 129, 0.15)',
        },

        // ─── Status ────────────────────────────────
        'status': {
          red:          '#ef4444',
          amber:        '#f59e0b',
          yellow:       '#eab308',
          green:        '#10b981',
        },

        // ─── Tier badges ───────────────────────────
        'tier': {
          free:         '#10b981',
          paid:         '#8b5cf6',
          trial:        '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xxs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'drawer': '-8px 0 30px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
