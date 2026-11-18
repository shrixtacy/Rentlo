/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rentlo: {
          primary: '#1E3A8A',
          secondary: '#F97316',
          accent: '#10B981',
          dark: '#0F172A',
          light: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
