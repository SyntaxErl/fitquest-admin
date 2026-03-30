/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#121212',
        'bg-secondary': '#2C2C2C',
        'accent-lime': '#CCFF00',
        'accent-orange': '#FF5F1F',
        'text-muted': '#A0A0A0',
        'border-dark': '#3A3A3A',
      },
    },
  },
  plugins: [],
}