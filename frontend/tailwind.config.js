export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#A8E63D',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        dark: '#0F172A',
        muted: '#64748B',
        success: '#22C55E',
        error: '#EF4444',
      },
      fontFamily: { inter: ['Inter', 'sans-serif'] },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
};
