/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safar: {
          navy: {
            950: '#040814',
            900: '#070F24',
            850: '#0A1633',
            800: '#0F2048',
            700: '#162C63',
          },
          saffron: {
            DEFAULT: '#FF8800',
            50: '#FFF7ED',
            400: '#FFA033',
            500: '#FF8800',
            600: '#E66A00',
            glow: 'rgba(255, 136, 0, 0.4)',
          },
          shield: {
            DEFAULT: '#2563EB',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            glow: 'rgba(37, 99, 235, 0.4)',
          },
          green: {
            DEFAULT: '#10B981',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            glow: 'rgba(16, 185, 129, 0.4)',
          }
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        navy: {
          800: '#0f172a',
          900: '#070f24',
          950: '#040814',
        },
        hazard: {
          safe: '#10b981',
          caution: '#f59e0b',
          restricted: '#f97316',
          critical: '#ef4444',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
        'compass-spin': 'spin 24s linear infinite',
        'compass-spin-slow': 'spin 45s linear infinite',
        'compass-spin-reverse': 'spin-reverse 30s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        }
      }
    },
  },
  plugins: [],
};
