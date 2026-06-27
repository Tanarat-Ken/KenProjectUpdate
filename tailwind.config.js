/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B17',
        'gray-med': '#6B6A60',
        'gray-light': '#9A998E',
        'gray-pale': '#C7C3B6',
        border: '#E7E3D8',
        'border-light': '#F0EDE3',
        panel: '#FAF8F2',
        'panel-alt': '#F4F2EC',
        bg: '#FBFAF6',
        teal: { DEFAULT: '#0E8F7A', light: '#E7F2EF', dark: '#0E7062', mid: '#B8DDD5' },
        blue: { DEFAULT: '#2B61CC', light: '#E8EFFC' },
        burgundy: { DEFAULT: '#9B2242', light: '#F8E9ED' },
        green: { DEFAULT: '#1E8A4B', light: '#E7F4EC' },
        amber: { DEFAULT: '#C98A12', light: '#FBF1DC' },
      },
      fontFamily: {
        sarabun: ['Sarabun', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        card: '13px',
        btn: '9px',
        pill: '20px',
      },
    },
  },
  plugins: [],
}
