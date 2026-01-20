/** @type {import('tailwindcss').Config} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const eidotterPreset = require('eidotter/tailwind.preset')

export default {
  presets: [eidotterPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/eidotter/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme': {
          'background': 'var(--color-theme-background)',
          'text': {
            'primary': 'var(--color-theme-text-primary)',
            'secondary': 'var(--color-theme-text-secondary)',
            'highlight': 'var(--color-theme-text-highlight)'
          },
          'border': {
            'default': 'var(--color-theme-border-default)',
            'focus': 'var(--color-theme-border-focus)'
          },
          'error': 'var(--color-theme-error)'
        }
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
