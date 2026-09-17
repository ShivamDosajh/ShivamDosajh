/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5563',
          dark: '#083E48',
          light: '#E4F0F1',
        },
      },
    },
  },
  plugins: [],
};
