/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Sinhala"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        sinhala: ['"Noto Serif Sinhala"', '"Noto Sans Sinhala"', 'serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ceylon: {
          50: '#fdf8f3',
          100: '#f9ede1',
          200: '#f2d7be',
          300: '#e8b992',
          400: '#dc9361',
          500: '#d3763e',
          600: '#c55e2f',
          700: '#a44828',
          800: '#843b27',
          900: '#6b3222',
          950: '#391810',
        },
        leaf: {
          50: '#f2fbf7',
          100: '#d3f4e4',
          200: '#a9e8cb',
          300: '#73d5ad',
          400: '#42ba8d',
          500: '#279e74',
          600: '#1b7f5d',
          700: '#19664d',
          800: '#18523f',
          900: '#154335',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b8c8',
          400: '#8692a8',
          500: '#67748e',
          600: '#525c75',
          700: '#434b5f',
          800: '#393f50',
          900: '#1e222d',
          950: '#11131a',
        }
      }
    },
  },
  plugins: [],
}
