/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          darkBg: '#0d1117',
          darkCard: '#161b22',
          darkText: '#c9d1d9',
          darkBorder: '#30363d',
          lightBg: '#f6f8fa',
          lightCard: '#ffffff',
          lightText: '#24292f',
          lightBorder: '#d0d7de'
        }
      }
    },
  },
  plugins: [],
}
