import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#5B21B6',
          light: '#7C3AED',
          dark: '#2E0A5C',
        },
        navy: {
          DEFAULT: '#0f0923',
          light: '#151430',
        },
        gold: {
          DEFAULT: '#F5B300',
          light: '#FFD166',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        control: '16px',
      },
      backdropBlur: {
        glass: '18px',
      },
    },
  },
  plugins: [],
}

export default config
