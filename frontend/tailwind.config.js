/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paw: {
          red: '#e33529',
          pink: '#f4ced3',
          'pink-mid': '#f0b5be',
          cream: '#f3f3e9',
          blue: '#2b6786',
          'blue-light': '#afd8fb',
        }
      },
      fontFamily: {
        display: ['Bayon', 'sans-serif'],
        body: ['Neue Montreal', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9.375rem',
      }
    },
  },
  plugins: [],
}
