/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#070b13',
          800: '#0d1522',
          700: '#142032',
          600: '#1e2d44',
          500: '#2b3e5b',
        },
        ev: {
          cyan: '#00f0ff',
          green: '#10b981',
          lime: '#22c55e',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
