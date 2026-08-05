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
      keyframes: {
        'logo-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        'logo-glow': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.9)' },
          '50%': { opacity: '0.6', transform: 'scale(1.15)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'logo-pulse': 'logo-pulse 1.4s ease-in-out infinite',
        'logo-glow': 'logo-glow 1.4s ease-in-out infinite',
        'ping-slow': 'ping-slow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
