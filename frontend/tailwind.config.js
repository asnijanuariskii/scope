/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#F15C59', light: '#FFDFDF', dark: '#d94845' },
        n: { 0: '#FFFFFF', 100: '#F2F3F5', 200: '#D8DCE8', 400: '#AEB2BE', 600: '#71747D', 700: '#4D4F56', 800: '#303135' },
        b: { 100: '#E7F2FF', 200: '#A3CFFF', 300: '#5BAAFF', 400: '#007CFF' },
        g: { 100: '#E2FBED', 500: '#0BAE54' },
        r: { 100: '#FFDFDF', 400: '#F15C59' },
        y: { 100: '#FEF8D0' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '20px' },
      boxShadow: {
        card: '0 2px 16px rgba(48,49,53,0.08)',
        overlay: '0 16px 48px rgba(48,49,53,0.24)',
      },
    },
  },
  plugins: [],
};
