/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        school: {
          bg: '#0f0f1a',
          surface: '#1a1a2e',
          card: '#16213e',
          amber: '#f59e0b',
          'amber-light': '#fef3c7',
          teal: '#0d9488',
          'teal-light': '#ccfbf1',
          purple: '#7c3aed',
          'purple-light': '#ede9fe',
          coral: '#ef4444',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'flash-amber': 'flashAmber 0.5s ease-in-out',
        'draw': 'draw 1s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashAmber: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#fef3c7' },
          '100%': { backgroundColor: 'transparent' },
        },
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
