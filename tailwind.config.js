/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0c5480',
          light: '#146397',
          dark: '#094569',
        },
        secondary: {
          DEFAULT: '#727376',
          light: '#8a8b8e',
          dark: '#5b5c5e',
        }
      }
    },
  },
  plugins: [],
};
