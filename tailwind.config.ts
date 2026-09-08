import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          950: '#082f49',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(8, 47, 73, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
