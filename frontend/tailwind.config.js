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
          primary: '#1E3A8A',    // Deep Trust Blue
          secondary: '#F97316',  // Energy Orange
          accent: '#10B981',     // Success Green
          dark: '#0F172A',
          light: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
