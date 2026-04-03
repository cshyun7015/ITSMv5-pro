/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
  content: [
    "./src/features/request/**/*.{js,jsx,ts,tsx}",
    "./src/features/request/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/event/**/*.{js,jsx,ts,tsx}",
    "./src/features/organization/**/*.{js,jsx,ts,tsx}",
    "./src/features/code/**/*.{js,jsx,ts,tsx}",
    "./src/features/incident/**/*.{js,jsx,ts,tsx}",
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        obsidian: {
          light: '#1c2230',
          DEFAULT: '#0b0f1a',
          dark: '#05070a',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
