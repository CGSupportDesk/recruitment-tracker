/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffe0e0',
          500: '#d01d24',
          600: '#b90f17',
          700: '#970d15',
          800: '#751219',
          900: '#4a0b10',
        },
        ink: '#151922',
        muted: '#8d929b',
        panel: '#ffffff',
        canvas: '#f4f5f7',
      },
      boxShadow: {
        soft: '0 22px 70px rgba(22, 25, 35, 0.10)',
        lift: '0 14px 34px rgba(114, 15, 20, 0.18)',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
