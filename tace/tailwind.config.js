/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // SOC dark theme — do not add glassmorphism / translucency utilities here
        background: '#0B1220',
        surface: '#111827',
        border: {
          DEFAULT: '#1F2937',
          subtle: '#1A2332',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          muted: '#1E3A8A',
        },
        success: {
          DEFAULT: '#22C55E',
          muted: '#14532D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: '#78350F',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: '#7F1D1D',
        },
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
