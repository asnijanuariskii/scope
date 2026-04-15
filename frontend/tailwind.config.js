/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── M3 Primary (source: #F82C17) ── */
        primary: {
          DEFAULT: '#C00100',
          on: '#FFFFFF',
          container: '#FFDAD4',
          'on-container': '#410000',
        },
        /* ── M3 Secondary ── */
        secondary: {
          DEFAULT: '#775651',
          on: '#FFFFFF',
          container: '#FFDAD4',
          'on-container': '#2C1512',
        },
        /* ── M3 Tertiary ── */
        tertiary: {
          DEFAULT: '#6F5C2E',
          on: '#FFFFFF',
          container: '#FBDFA6',
          'on-container': '#261A00',
        },
        /* ── M3 Error ── */
        error: {
          DEFAULT: '#BA1A1A',
          on: '#FFFFFF',
          container: '#FFDAD6',
          'on-container': '#410002',
        },
        /* ── M3 Surface / Neutral ── */
        surface: {
          DEFAULT: '#FFFBFF',
          dim: '#E4D7D5',
          bright: '#FFFBFF',
          'container-lowest': '#FFFFFF',
          'container-low': '#FFF0EE',
          container: '#FCEAE7',
          'container-high': '#F6E4E1',
          'container-highest': '#F0DEDC',
        },
        'on-surface': '#201A19',
        'on-surface-variant': '#534341',
        outline: '#857371',
        'outline-variant': '#D8C2BF',
        'inverse-surface': '#362F2E',
        'inverse-on-surface': '#FBEEEC',
        'inverse-primary': '#FFB4A8',
        /* ── Legacy aliases for easy migration ── */
        brand: { DEFAULT: '#C00100', light: '#FFDAD4', dark: '#930100' },
        n: {
          0: '#FFFFFF',
          100: '#FFF0EE',
          200: '#D8C2BF',
          400: '#857371',
          600: '#534341',
          700: '#3B2D2B',
          800: '#201A19',
        },
        b: { 100: '#FFDAD4', 200: '#FFB4A8', 300: '#FF897A', 400: '#C00100' },
        g: { 100: '#DCFCE7', 500: '#16A34A' },
        r: { 100: '#FFDAD6', 400: '#BA1A1A' },
        y: { 100: '#FBDFA6' },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '28px',
        full: '9999px',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        'elevation-2': '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        'elevation-3': '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
        'elevation-4': '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
        'elevation-5': '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)',
        /* Legacy aliases */
        card: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        overlay: '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)',
      },
      fontSize: {
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-md': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
        'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '500' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
