/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#1F2937',
        secondary: '#6B7280',
      },
    },
  },
  plugins: [],
}

