/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dos-black': 'var(--global-colors-dos-black)',
        'dos-amber': 'var(--global-colors-dos-yellow)',
        'dos-bright-amber': 'var(--global-colors-dos-bright)',
        'dos-dim-amber': 'var(--global-colors-dos-dim)',
        'dos-border': 'var(--global-colors-dos-border)',
        'dos-red': '#FF0000'
      },
      fontFamily: {
        'dos': 'var(--typography-family-dos)'
      },
      fontSize: {
        'base': 'var(--typography-size-base)',
        'lg': 'var(--typography-size-lg)',
        'xl': 'var(--typography-size-xl)',
        '2xl': 'var(--typography-size-2xl)'
      },
      spacing: {
        'unit': 'var(--global-spacing-unit)',
        'title': 'var(--global-spacing-title-height)'
      },
      borderWidth: {
        'thin': 'var(--spacing-border-width-thin)',
        'normal': 'var(--spacing-border-width-normal)',
        'thick': 'var(--spacing-border-width-thick)'
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      maxWidth: {
        'content': 'var(--global-dimension-content-max-width)'
      },
      lineHeight: {
        'base': 'var(--global-typography-line-height-base)'
      }
    },
  },
  plugins: [],
} 