/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── Brand / Primary (replacing Atlassian Blue with #F82C17) ── */
        brand: {
          DEFAULT: '#F82C17',
          bold: '#D41A08',
          bolder: '#AE1507',
          boldest: '#7F0F05',
          subtle: '#FFF0EE',
          subtler: '#FFDDD8',
          subtlest: '#FFE9E5',
        },
        /* ── Atlassian-style Neutrals (purple-tinted grays) ── */
        N: {
          0: '#FFFFFF',
          10: '#FAFBFC',
          20: '#F4F5F7',
          30: '#EBECF0',
          40: '#DFE1E6',
          50: '#C1C7D0',
          60: '#B3BAC5',
          70: '#A5ADBA',
          80: '#97A0AF',
          100: '#8993A4',
          200: '#7A869A',
          300: '#6B778C',
          400: '#505F79',
          500: '#42526E',
          600: '#344563',
          700: '#253858',
          800: '#172B4D',
          900: '#091E42',
        },
        /* ── Semantic: Success ── */
        success: {
          DEFAULT: '#36B37E',
          bold: '#00875A',
          subtle: '#E3FCEF',
          text: '#006644',
        },
        /* ── Semantic: Warning ── */
        warning: {
          DEFAULT: '#FFAB00',
          bold: '#FF991F',
          subtle: '#FFFAE6',
          text: '#172B4D',
        },
        /* ── Semantic: Danger ── */
        danger: {
          DEFAULT: '#DE350B',
          bold: '#BF2600',
          subtle: '#FFEBE6',
          text: '#BF2600',
        },
        /* ── Semantic: Discovery ── */
        discovery: {
          DEFAULT: '#6554C0',
          bold: '#5243AA',
          subtle: '#EAE6FF',
          text: '#403294',
        },
        /* ── Semantic: Information ── */
        information: {
          DEFAULT: '#0065FF',
          bold: '#0052CC',
          subtle: '#DEEBFF',
          text: '#0747A6',
        },
        /* ── Legacy aliases for backward compat ── */
        primary: '#F82C17',
        'primary-on': '#FFFFFF',
        'primary-container': '#FFE9E5',
        'primary-on-container': '#7F0F05',
        'secondary-container': '#EBECF0',
        'secondary-on-container': '#172B4D',
        'tertiary-container': '#EAE6FF',
        'tertiary-on-container': '#403294',
        error: '#DE350B',
        'error-container': '#FFEBE6',
        'error-on': '#FFFFFF',
        surface: '#FFFFFF',
        'on-surface': '#172B4D',
        'on-surface-variant': '#6B778C',
        outline: '#DFE1E6',
        'outline-variant': '#EBECF0',
        'surface-container-highest': '#F4F5F7',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        /* Atlassian heading scale */
        'heading-xxl': ['35px', { lineHeight: '40px', fontWeight: '600' }],
        'heading-xl': ['29px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-lg': ['24px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-md': ['20px', { lineHeight: '24px', fontWeight: '500' }],
        'heading-sm': ['16px', { lineHeight: '20px', fontWeight: '600' }],
        'heading-xs': ['14px', { lineHeight: '16px', fontWeight: '600' }],
        'heading-xxs': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        /* Atlassian body scale */
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        /* Labels */
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '3px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        /* Atlassian 8px grid */
        'space-0': '0px',
        'space-025': '2px',
        'space-050': '4px',
        'space-075': '6px',
        'space-100': '8px',
        'space-150': '12px',
        'space-200': '16px',
        'space-250': '20px',
        'space-300': '24px',
        'space-400': '32px',
        'space-500': '40px',
        'space-600': '48px',
      },
      boxShadow: {
        'overflow': '0 0 0 2px #FAFBFC, 0 0 0 4px #F82C17',
        'overlay': '0 4px 8px -2px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)',
        'raised': '0 1px 1px rgba(9,30,66,0.25), 0 0 1px 0 rgba(9,30,66,0.31)',
        'card': '0 1px 1px rgba(9,30,66,0.25), 0 0 1px 0 rgba(9,30,66,0.31)',
      },
    },
  },
  plugins: [],
};
