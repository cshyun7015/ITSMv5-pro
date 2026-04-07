/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'hsl(var(--bg-primary) / <alpha-value>)',
          secondary: 'hsl(var(--bg-secondary) / <alpha-value>)',
          tertiary: 'hsl(var(--bg-tertiary) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--text-muted) / <alpha-value>)',
        },
        brand: {
          primary: 'hsl(var(--brand-primary) / <alpha-value>)',
          secondary: 'hsl(var(--brand-secondary) / <alpha-value>)',
          accent: 'hsl(var(--brand-accent) / <alpha-value>)',
        },
        status: {
          critical: 'hsl(var(--status-critical) / <alpha-value>)',
          high: 'hsl(var(--status-high) / <alpha-value>)',
          medium: 'hsl(var(--status-medium) / <alpha-value>)',
          low: 'hsl(var(--status-low) / <alpha-value>)',
          resolved: 'hsl(var(--status-resolved) / <alpha-value>)',
        }
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        unit: 'var(--spacing-unit)',
      },
      fontFamily: {
        main: 'var(--font-main)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
