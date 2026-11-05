/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#FAF8F5',
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#121212',
          'card-dark': '#1C1C1C',
        },
        brand: {
          50: '#F0F7F4',
          100: '#DCEEE6',
          200: '#B9DECFC',
          300: '#8AC7B0',
          400: '#54A98C',
          500: '#1F6F54', // Main signature accent
          600: '#175641',
          700: '#124131',
          800: '#0E3024',
          900: '#0A2219',
        },
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
        },
        status: {
          success: '#1B8755',
          'success-bg': '#EAF7EE',
          warning: '#C05621',
          'warning-bg': '#FEF3E7',
          danger: '#C53030',
          'danger-bg': '#FDF0F0',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
        sheet: '0 -4px 20px -2px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
