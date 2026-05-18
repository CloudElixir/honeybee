/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        honey: {
          DEFAULT: '#FFC107',
          dark: '#E6AC00',
          light: '#FFECB3',
        },
        gold: {
          DEFAULT: '#C9A227',
          muted: '#B8860B',
        },
        lux: {
          gold: '#f4c400',
          black: '#111111',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 12px 48px -12px rgba(0, 0, 0, 0.12)',
        card: '0 8px 32px -8px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
