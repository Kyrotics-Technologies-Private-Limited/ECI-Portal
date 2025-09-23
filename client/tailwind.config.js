/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {colors: {
      purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
      },
      pink: {
        50: '#fdf2f8',
        100: '#fce7f3',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
      },
    },},
  },
  plugins: [],
}