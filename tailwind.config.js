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
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} 