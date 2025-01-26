/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dos-black': 'var(--dos-black)',
        'dos-amber': 'var(--dos-amber)',
        'dos-bright-amber': 'var(--dos-bright-amber)',
        'dos-dim-amber': 'var(--dos-dim-amber)',
        'dos-border': 'var(--dos-border)',
        'dos-red': 'var(--dos-red)'
      },
      fontFamily: {
        'dos': ['DOS', 'Consolas', 'Monaco', 'monospace']
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